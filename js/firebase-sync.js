// firebase-sync.js
// Solution de synchronisation directe utilisant Firebase

// Configuration Firebase - GRATUIT pour le niveau de trafic d'un salon de coiffure
const firebaseConfig = {
  apiKey: "AIzaSyB1icTuyitHvwLOhOs2BrAd_qC4-kKdd_w",
  authDomain: "fchairslyon-app.firebaseapp.com",
  projectId: "fchairslyon-app",
  storageBucket: "fchairslyon-app.firebasestorage.app",
  messagingSenderId: "969792201439",
  appId: "1:969792201439:web:bddbf810ebf48c5641ff6a",
  measurementId: "G-3ZCHZ4EGJH"
};

  
  // Classe de synchronisation Firebase
  class FirebaseSync {
    constructor() {
      this.initializeFirebase();
      this.db = null;
      this.availabilityRef = null;
      this.listeners = [];
      this.ready = false;
      this.lastUpdateDevice = null;
      this.deviceId = this.getOrCreateDeviceId();
    }
  
    // Générer un ID unique pour cet appareil
    getOrCreateDeviceId() {
      let deviceId = localStorage.getItem('fchairs_device_id');
      if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('fchairs_device_id', deviceId);
      }
      return deviceId;
    }
  
    // Initialiser Firebase en chargeant dynamiquement le script
    async initializeFirebase() {
      return new Promise((resolve, reject) => {
        console.log("[FirebaseSync] Initialisation de Firebase...");
        
        // Vérifier si Firebase est déjà chargé
        if (window.firebase && window.firebase.firestore) {
          console.log("[FirebaseSync] Firebase déjà chargé");
          this.setupFirebase();
          resolve();
          return;
        }
        
        // Chargement du script Firebase
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        script.onload = () => {
          console.log("[FirebaseSync] Script Firebase App chargé");
          
          // Charger Firestore
          const firestoreScript = document.createElement('script');
          firestoreScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js';
          firestoreScript.onload = () => {
            console.log("[FirebaseSync] Script Firestore chargé");
            this.setupFirebase();
            resolve();
          };
          firestoreScript.onerror = (error) => {
            console.error("[FirebaseSync] Erreur lors du chargement de Firestore:", error);
            reject(error);
          };
          document.body.appendChild(firestoreScript);
        };
        script.onerror = (error) => {
          console.error("[FirebaseSync] Erreur lors du chargement de Firebase:", error);
          reject(error);
        };
        document.body.appendChild(script);
      });
    }
  
    // Configurer Firebase après chargement des scripts
    setupFirebase() {
      // Initialiser l'application Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      // Obtenir une référence à Firestore
      this.db = firebase.firestore();
      this.availabilityRef = this.db.collection('availability').doc('main');
      
      // Signaler que Firebase est prêt
      this.ready = true;
      console.log("[FirebaseSync] Firebase configuré avec succès");
      
      // Initialiser l'écoute des changements
      this.setupRealTimeSync();
    }
  
    // Configurer la synchronisation en temps réel
    setupRealTimeSync() {
      console.log("[FirebaseSync] Configuration de la synchronisation en temps réel...");
      
      // Écouter les changements en temps réel
      this.unsubscribe = this.availabilityRef.onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          
          // Vérifier si la mise à jour vient d'un autre appareil
          if (data.lastUpdateDevice && data.lastUpdateDevice !== this.deviceId) {
            console.log("[FirebaseSync] Mise à jour détectée depuis un autre appareil:", data.lastUpdateDevice);
            
            // Mettre à jour le stockage local
            const availabilities = data.availabilities || {};
            localStorage.setItem('fchairs_availabilities', JSON.stringify(availabilities));
            
            // Notifier les écouteurs
            this.notifyListeners(availabilities);
            
            // Toaster une notification
            this.showToast("Les disponibilités ont été mises à jour depuis un autre appareil");
            
            // Actualiser la page admin si nécessaire
            if (document.querySelector('.content-section#availability')?.classList.contains('active')) {
              if (confirm("Les disponibilités ont été mises à jour ailleurs. Recharger la page ?")) {
                window.location.reload();
              }
            }
          }
        } else {
          console.log("[FirebaseSync] Document de disponibilités non trouvé, création initiale");
          // Créer le document avec des données vides s'il n'existe pas
          this.saveAvailabilities({});
        }
      }, (error) => {
        console.error("[FirebaseSync] Erreur lors de l'écoute des changements:", error);
      });
      
      console.log("[FirebaseSync] Synchronisation en temps réel configurée");
    }
  
    // Ajouter un écouteur de changements
    addListener(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
    }
  
    // Notifier tous les écouteurs
    notifyListeners(data) {
      this.listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error("[FirebaseSync] Erreur dans un écouteur:", error);
        }
      });
    }
  
    // Sauvegarder les disponibilités
    async saveAvailabilities(availabilities) {
      if (!this.ready) {
        await this.waitForReady();
      }
      
      try {
        console.log("[FirebaseSync] Sauvegarde des disponibilités...");
        
        // Marquer cet appareil comme la source de mise à jour
        await this.availabilityRef.set({
          availabilities: availabilities,
          lastUpdateDevice: this.deviceId,
          lastUpdateTime: new Date().toISOString()
        });
        
        // Mettre également à jour le stockage local
        localStorage.setItem('fchairs_availabilities', JSON.stringify(availabilities));
        
        console.log("[FirebaseSync] Disponibilités sauvegardées avec succès");
        return true;
      } catch (error) {
        console.error("[FirebaseSync] Erreur lors de la sauvegarde des disponibilités:", error);
        
        // Essayer uniquement le stockage local en cas d'erreur
        try {
          localStorage.setItem('fchairs_availabilities', JSON.stringify(availabilities));
          console.log("[FirebaseSync] Sauvegarde de secours en stockage local réussie");
        } catch (localError) {
          console.error("[FirebaseSync] Échec de la sauvegarde de secours:", localError);
        }
        
        return false;
      }
    }
  
    // Récupérer les disponibilités
    async getAvailabilities() {
      if (!this.ready) {
        await this.waitForReady();
      }
      
      try {
        console.log("[FirebaseSync] Récupération des disponibilités...");
        
        // Essayer d'abord depuis Firebase
        const doc = await this.availabilityRef.get();
        
        if (doc.exists) {
          const data = doc.data();
          const availabilities = data.availabilities || {};
          
          // Mettre à jour le stockage local
          localStorage.setItem('fchairs_availabilities', JSON.stringify(availabilities));
          
          console.log("[FirebaseSync] Disponibilités récupérées avec succès");
          return availabilities;
        } else {
          console.log("[FirebaseSync] Aucune disponibilité trouvée dans Firebase");
        }
      } catch (error) {
        console.error("[FirebaseSync] Erreur lors de la récupération des disponibilités:", error);
      }
      
      // Fallback: Essayer de récupérer depuis le stockage local
      try {
        const localData = localStorage.getItem('fchairs_availabilities');
        if (localData) {
          console.log("[FirebaseSync] Utilisation des disponibilités locales");
          return JSON.parse(localData);
        }
      } catch (localError) {
        console.error("[FirebaseSync] Erreur lors de la récupération des disponibilités locales:", localError);
      }
      
      // Si tout échoue, retourner un objet vide
      return {};
    }
  
    // Attendre que Firebase soit prêt
    async waitForReady() {
      if (this.ready) return;
      
      return new Promise(resolve => {
        const checkReady = () => {
          if (this.ready) {
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    }
  
    // Afficher une notification toast
    showToast(message, type = 'info', duration = 3000) {
      // Vérifier si la fonction showToast est déjà définie globalement
      if (typeof window.showToast === 'function') {
        window.showToast(message, type, duration);
        return;
      }
      
      // Implémentation de secours
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = type === 'error' ? '#f44336' : 
                                   type === 'success' ? '#4CAF50' : 
                                   '#333';
      toast.style.color = 'white';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '4px';
      toast.style.zIndex = '10000';
      toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      toast.style.transition = 'opacity 0.3s';
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      // Animation d'apparition
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, duration);
    }
  
    // Nettoyer les ressources
    cleanup() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }
  }
  
  // Service de disponibilité utilisant Firebase pour la synchronisation
  const FirebaseAvailabilityService = {
    // Instance Firebase
    firebaseSync: new FirebaseSync(),
    
    // Clé de stockage locale (pour compatibilité)
    STORAGE_KEY: 'fchairs_availabilities',
    
    // Récupérer les disponibilités
    getAvailabilities: async function() {
      try {
        console.log("[FirebaseAvailabilityService] Récupération des disponibilités");
        
        // Récupérer depuis Firebase avec fallback local
        const availabilities = await this.firebaseSync.getAvailabilities();
        return availabilities;
      } catch (error) {
        console.error("[FirebaseAvailabilityService] Erreur lors de la récupération:", error);
        
        // Dernière tentative: récupérer directement depuis localStorage
        try {
          const data = localStorage.getItem(this.STORAGE_KEY);
          return data ? JSON.parse(data) : {};
        } catch (e) {
          return {};
        }
      }
    },
    
    // Enregistrer les disponibilités
    setAvailabilities: async function(availabilities) {
      try {
        console.log("[FirebaseAvailabilityService] Enregistrement des disponibilités");
        
        // Sauvegarder via Firebase
        const success = await this.firebaseSync.saveAvailabilities(availabilities);
        return success;
      } catch (error) {
        console.error("[FirebaseAvailabilityService] Erreur lors de l'enregistrement:", error);
        
        // Dernière tentative: sauvegarder directement dans localStorage
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(availabilities));
          return true;
        } catch (e) {
          return false;
        }
      }
    },
    
    // Vérifier si une date est disponible
    isDateAvailable: async function(dateString) {
      const availabilities = await this.getAvailabilities();
      return !!(availabilities[dateString] && availabilities[dateString].length > 0);
    },
    
    // Obtenir les heures disponibles pour une date
    getAvailableHours: async function(dateString) {
      const availabilities = await this.getAvailabilities();
      return availabilities[dateString] || [];
    },
    
    // Mettre à jour les disponibilités pour une date
    updateDateAvailability: async function(dateString, hours) {
      const availabilities = await this.getAvailabilities();
      availabilities[dateString] = hours;
      return await this.setAvailabilities(availabilities);
    },
    
    // Ajouter un écouteur de changements
    addChangeListener: function(callback) {
      this.firebaseSync.addListener(callback);
    }
  };
  
  // Versions synchrones pour compatibilité avec le code existant
  const SyncCompatibilityLayer = {
    cachedAvailabilities: null,
    lastFetchTime: 0,
    
    // Récupérer les disponibilités de manière synchrone
    getAvailabilities: function() {
      // Vérifier le cache (valide pendant 10 secondes)
      const now = Date.now();
      if (this.cachedAvailabilities && (now - this.lastFetchTime < 10000)) {
        return this.cachedAvailabilities;
      }
      
      // Récupérer depuis localStorage pour compatibilité immédiate
      try {
        const data = localStorage.getItem('fchairs_availabilities');
        if (data) {
          this.cachedAvailabilities = JSON.parse(data);
          this.lastFetchTime = now;
          return this.cachedAvailabilities;
        }
      } catch (e) {
        console.error("[SyncCompatibilityLayer] Erreur lors de la récupération locale:", e);
      }
      
      return {};
    },
    
    // Sauvegarder les disponibilités de manière synchrone
    setAvailabilities: function(availabilities) {
      // Mettre à jour le cache
      this.cachedAvailabilities = availabilities;
      this.lastFetchTime = Date.now();
      
      // Sauvegarder localement pour compatibilité immédiate
      try {
        localStorage.setItem('fchairs_availabilities', JSON.stringify(availabilities));
      } catch (e) {
        console.error("[SyncCompatibilityLayer] Erreur lors de la sauvegarde locale:", e);
      }
      
      // Lancer la sauvegarde asynchrone vers Firebase
      FirebaseAvailabilityService.setAvailabilities(availabilities)
        .then(success => {
          if (!success) {
            console.error("[SyncCompatibilityLayer] Échec de la sauvegarde Firebase");
          }
        })
        .catch(error => {
          console.error("[SyncCompatibilityLayer] Erreur lors de la sauvegarde Firebase:", error);
        });
      
      return true;
    },
    
    // Vérifier si une date est disponible de manière synchrone
    isDateAvailable: function(dateString) {
      const availabilities = this.getAvailabilities();
      return !!(availabilities[dateString] && availabilities[dateString].length > 0);
    },
    
    // Obtenir les heures disponibles pour une date de manière synchrone
    getAvailableHours: function(dateString) {
      const availabilities = this.getAvailabilities();
      return availabilities[dateString] || [];
    }
  };
  
  // Remplacer les fonctions existantes au chargement de la page
  document.addEventListener('DOMContentLoaded', async function() {
    console.log("[FirebaseInit] Initialisation de la synchronisation Firebase...");
    
    // Initialiser la synchronisation Firebase
    try {
      await FirebaseAvailabilityService.firebaseSync.waitForReady();
      console.log("[FirebaseInit] Firebase est prêt");
      
      // Récupérer les données initiales
      const initialAvailabilities = await FirebaseAvailabilityService.getAvailabilities();
      console.log("[FirebaseInit] Données initiales récupérées:", 
                  Object.keys(initialAvailabilities).length, "dates disponibles");
      
      // Remplacer les fonctions globales existantes
      if (typeof window.getAvailabilities === 'function') {
        window.getAvailabilities = SyncCompatibilityLayer.getAvailabilities.bind(SyncCompatibilityLayer);
      }
      
      if (typeof window.setAvailabilities === 'function') {
        window.setAvailabilities = SyncCompatibilityLayer.setAvailabilities.bind(SyncCompatibilityLayer);
      }
      
      // Remplacer les services
      window.StorageService = SyncCompatibilityLayer;
      window.AvailabilityService = SyncCompatibilityLayer;
      
      // Maintenir la compatibilité avec l'API simple
      window.availabilityModule = {
        isDateAvailable: SyncCompatibilityLayer.isDateAvailable.bind(SyncCompatibilityLayer),
        getAvailableHours: SyncCompatibilityLayer.getAvailableHours.bind(SyncCompatibilityLayer)
      };
      
      // Améliorer le comportement du bouton de sauvegarde
      if (window.location.pathname.includes('/admin/')) {
        setTimeout(function() {
          const saveBtn = document.getElementById('save-availability');
          if (saveBtn) {
            // Remplacer le bouton pour supprimer les gestionnaires existants
            const newBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newBtn, saveBtn);
            
            // Ajouter notre gestionnaire synchronisé
            newBtn.addEventListener('click', async function() {
              if (!selectedDate) {
                alert('Veuillez d\'abord sélectionner une date.');
                return;
              }
              
              // Mettre à jour la liste des heures
              updateAvailableHours();
              
              // Modifier l'apparence du bouton pendant la sauvegarde
              this.textContent = "Enregistrement en cours...";
              this.disabled = true;
              
              // Enregistrer avec notre service synchronisé
              const success = await FirebaseAvailabilityService.updateDateAvailability(selectedDate, availableHours);
              
              // Restaurer l'apparence du bouton
              this.textContent = "Enregistrer";
              this.disabled = false;
              
              if (success) {
                // Mise à jour visuelle du calendrier
                const dayElement = document.querySelector(`.calendar-day[data-date="${selectedDate}"]`);
                if (dayElement) {
                  if (availableHours.length > 0) {
                    dayElement.classList.add('available');
                  } else {
                    dayElement.classList.remove('available');
                  }
                }
                
                alert('Disponibilités enregistrées avec succès sur tous les appareils!');
              } else {
                alert('Erreur lors de l\'enregistrement des disponibilités. Veuillez réessayer.');
              }
            });
          }
        }, 1000);
      }
      
      console.log("[FirebaseInit] Synchronisation entre appareils configurée avec succès!");
    } catch (error) {
      console.error("[FirebaseInit] Erreur lors de l'initialisation Firebase:", error);
    }
  });

// Fonction pour supprimer toutes les données
async function deleteAllData() {
    try {
        console.log('[FirebaseSync] Suppression de toutes les données...');
        const db = firebase.firestore();
        
        // Supprimer tous les documents de la collection clients
        const clientsSnapshot = await db.collection('clients').get();
        const deletePromises = clientsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        
        // Supprimer tous les documents de la collection reservations
        const reservationsSnapshot = await db.collection('reservations').get();
        const deleteReservationsPromises = reservationsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteReservationsPromises);
        
        console.log('[FirebaseSync] Toutes les données ont été supprimées');
        return true;
    } catch (error) {
        console.error('[FirebaseSync] Erreur lors de la suppression des données:', error);
        throw error;
    }
}

// Fonction pour supprimer toutes les disponibilités
async function deleteAllAvailability() {
    try {
        console.log('[FirebaseSync] Suppression de toutes les disponibilités...');
        const db = firebase.firestore();
        
        // Supprimer le document de disponibilités
        await db.collection('availability').doc('main').delete();
        
        console.log('[FirebaseSync] Toutes les disponibilités ont été supprimées');
        return true;
    } catch (error) {
        console.error('[FirebaseSync] Erreur lors de la suppression des disponibilités:', error);
        throw error;
    }
}

// Exporter les fonctions
window.firebaseSync = {
    // ... existing exports ...
    deleteAllData,
    deleteAllAvailability
};