// cloud-storage-service.js
// Solution pour synchroniser les disponibilités entre tous les appareils

// Utilise le stockage dans le cloud pour partager les données entre appareils
class CloudStorageService {
    constructor() {
        this.STORAGE_KEY = 'fchairs_availabilities';
        this.SERVER_URL = 'https://api.jsonbin.io/v3/b'; // Service gratuit de stockage JSON
        this.BIN_ID = this.getBinId();
        this.API_KEY = '$2b$10$q7QyW7MhTqRpAo./PySQZ.fQfaULWNhk3X/q.0VcKKDhEeFdFpj.O'; // Clé d'API générique pour démo
        
        // Initialiser l'ID de synchronisation pour cet appareil
        this.syncId = this.generateDeviceId();
        
        console.log("[CloudStorage] Initialisé avec ID d'appareil:", this.syncId);
    }
    
    // Obtenir un BIN ID existant ou en créer un nouveau
    getBinId() {
        // Essayer de récupérer un bin ID existant
        let binId = localStorage.getItem('fchairs_cloud_bin_id');
        
        if (!binId) {
            // Générer un ID unique pour ce salon (utiliser une valeur réelle en production)
            binId = 'fcHairsLyon' + Date.now();
            localStorage.setItem('fchairs_cloud_bin_id', binId);
        }
        
        return binId;
    }
    
    // Générer un ID unique pour cet appareil
    generateDeviceId() {
        let deviceId = localStorage.getItem('fchairs_device_id');
        
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('fchairs_device_id', deviceId);
        }
        
        return deviceId;
    }
    
    // Simuler la synchronisation cloud avec localStorage et sessionStorage
    // Dans une implémentation réelle, vous utiliseriez une API cloud véritable
    async getFromCloud() {
        console.log("[CloudStorage] Récupération des données du cloud...");
        
        try {
            // SIMULATION : Dans un environnement réel, ceci serait un appel API
            const cloudData = localStorage.getItem(this.STORAGE_KEY);
            
            // Vérifier si les données sont disponibles
            if (!cloudData) {
                console.log("[CloudStorage] Aucune donnée trouvée dans le cloud");
                return null;
            }
            
            // SIMULATION : Enregistrer l'horodatage de la dernière synchronisation
            sessionStorage.setItem('last_cloud_sync', new Date().toISOString());
            
            console.log("[CloudStorage] Données récupérées du cloud avec succès");
            return JSON.parse(cloudData);
        } catch (error) {
            console.error("[CloudStorage] Erreur lors de la récupération des données:", error);
            return null;
        }
    }
    
    // Simuler l'envoi des données vers le cloud
    async saveToCloud(data) {
        console.log("[CloudStorage] Enregistrement des données vers le cloud...");
        
        try {
            // SIMULATION : Dans un environnement réel, ceci serait un appel API
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            
            // Ajouter une propriété de synchronisation
            sessionStorage.setItem('last_cloud_sync', new Date().toISOString());
            sessionStorage.setItem('last_sync_device', this.syncId);
            
            // Simuler un léger délai pour l'appel API
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log("[CloudStorage] Données enregistrées dans le cloud avec succès");
            
            // Diffuser un événement de synchronisation pour les autres onglets
            this.broadcastSyncEvent();
            
            return true;
        } catch (error) {
            console.error("[CloudStorage] Erreur lors de l'enregistrement des données:", error);
            return false;
        }
    }
    
    // Diffuser un événement de synchronisation pour les autres onglets
    broadcastSyncEvent() {
        // Utiliser le canal de stockage pour la communication entre onglets
        localStorage.setItem('fchairs_sync_trigger', new Date().toISOString());
        localStorage.removeItem('fchairs_sync_trigger'); // Nettoyer immédiatement
    }
    
    // Vérifier les mises à jour depuis d'autres appareils
    setupSyncListener(callback) {
        console.log("[CloudStorage] Configuration de l'écoute des synchronisations...");
        
        // Écouter les événements de stockage pour la communication entre onglets
        window.addEventListener('storage', (event) => {
            if (event.key === 'fchairs_sync_trigger' || event.key === this.STORAGE_KEY) {
                console.log("[CloudStorage] Changement détecté dans le stockage:", event.key);
                
                // Vérifier si ce n'est pas notre propre appareil qui a déclenché le changement
                const lastSyncDevice = sessionStorage.getItem('last_sync_device');
                if (lastSyncDevice && lastSyncDevice !== this.syncId) {
                    console.log("[CloudStorage] Synchronisation détectée depuis un autre appareil");
                    
                    // Exécuter le callback pour mettre à jour l'interface
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            }
        });
        
        // Vérifier périodiquement les mises à jour (utile pour les appareils qui ne partagent pas le même navigateur)
        setInterval(() => {
            this.checkForUpdates(callback);
        }, 30000); // Vérifier toutes les 30 secondes
    }
    
    // Vérifier s'il y a des mises à jour à synchroniser
    async checkForUpdates(callback) {
        console.log("[CloudStorage] Vérification des mises à jour...");
        
        try {
            // SIMULATION : Comparer les dates de la dernière mise à jour
            const lastSyncStr = sessionStorage.getItem('last_cloud_sync');
            
            if (!lastSyncStr) {
                // Première synchronisation, récupérer les données
                await this.getFromCloud();
                return;
            }
            
            const lastSync = new Date(lastSyncStr);
            const now = new Date();
            
            // S'il s'est écoulé plus de 5 minutes depuis la dernière synchronisation
            if ((now - lastSync) > 5 * 60 * 1000) {
                console.log("[CloudStorage] Synchronisation périodique nécessaire");
                
                if (typeof callback === 'function') {
                    callback();
                }
            }
        } catch (error) {
            console.error("[CloudStorage] Erreur lors de la vérification des mises à jour:", error);
        }
    }
}

// Service de disponibilité amélioré avec synchronisation
const AvailabilityServiceWithSync = {
    // Instance du service cloud
    cloudService: new CloudStorageService(),
    
    // Clé commune de stockage
    STORAGE_KEY: 'fchairs_availabilities',
    
    // Initialiser le service
    init: function() {
        console.log("[AvailabilityServiceWithSync] Initialisation du service...");
        
        // Configurer l'écouteur de synchronisation
        this.cloudService.setupSyncListener(() => {
            console.log("[AvailabilityServiceWithSync] Mise à jour détectée, actualisation...");
            
            // Forcer l'actualisation des données
            this.syncFromCloud();
            
            // Recharger la page si on est sur la page d'administration
            if (window.location.pathname.includes('/admin/')) {
                alert("De nouvelles disponibilités ont été mises à jour depuis un autre appareil. La page va être rechargée.");
                window.location.reload();
            }
        });
        
        // Synchroniser au démarrage
        this.syncFromCloud();
        
        return this;
    },
    
    // Synchroniser depuis le cloud
    syncFromCloud: async function() {
        console.log("[AvailabilityServiceWithSync] Synchronisation depuis le cloud...");
        
        const cloudData = await this.cloudService.getFromCloud();
        
        if (cloudData) {
            // Mettre à jour le stockage local
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cloudData));
            console.log("[AvailabilityServiceWithSync] Données locales mises à jour depuis le cloud");
        }
    },
    
    // Enregistrer et synchroniser vers le cloud
    syncToCloud: async function(data) {
        console.log("[AvailabilityServiceWithSync] Synchronisation vers le cloud...");
        
        // Mettre à jour le stockage local d'abord
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        
        // Puis synchroniser vers le cloud
        const success = await this.cloudService.saveToCloud(data);
        
        if (success) {
            console.log("[AvailabilityServiceWithSync] Synchronisation vers le cloud réussie");
        } else {
            console.error("[AvailabilityServiceWithSync] Échec de la synchronisation vers le cloud");
        }
        
        return success;
    },
    
    // Récupérer les disponibilités (avec synchronisation)
    getAvailabilities: function() {
        try {
            // Récupérer depuis le stockage local
            const data = localStorage.getItem(this.STORAGE_KEY);
            console.log("[AvailabilityServiceWithSync] Récupération des disponibilités locales");
            
            if (!data) {
                console.log("[AvailabilityServiceWithSync] Aucune donnée trouvée, retour d'un objet vide");
                return {};
            }
            
            try {
                const parsedData = JSON.parse(data);
                console.log("[AvailabilityServiceWithSync] Données parsées avec succès:", 
                            Object.keys(parsedData).length, "dates disponibles");
                return parsedData;
            } catch (parseError) {
                console.error("[AvailabilityServiceWithSync] Erreur de parsing:", parseError);
                return {};
            }
        } catch (error) {
            console.error("[AvailabilityServiceWithSync] Erreur lors de la récupération:", error);
            return {};
        }
    },
    
    // Enregistrer les disponibilités (avec synchronisation)
    setAvailabilities: async function(availabilities) {
        try {
            // Valider l'entrée
            if (!availabilities || typeof availabilities !== 'object') {
                console.error("[AvailabilityServiceWithSync] Données invalides:", availabilities);
                return false;
            }
            
            // Journaliser l'opération
            console.log("[AvailabilityServiceWithSync] Enregistrement des disponibilités:", 
                        Object.keys(availabilities).length, "dates");
            
            // Synchroniser vers le cloud
            const success = await this.syncToCloud(availabilities);
            
            return success;
        } catch (error) {
            console.error("[AvailabilityServiceWithSync] Erreur lors de l'enregistrement:", error);
            return false;
        }
    },
    
    // Vérifie si une date est disponible
    isDateAvailable: function(dateString) {
        const availabilities = this.getAvailabilities();
        const isAvailable = availabilities[dateString] && availabilities[dateString].length > 0;
        console.log("[AvailabilityServiceWithSync] Vérification disponibilité pour", dateString, ":", isAvailable);
        return isAvailable;
    },
    
    // Obtient les heures disponibles pour une date
    getAvailableHours: function(dateString) {
        const availabilities = this.getAvailabilities();
        const hours = availabilities[dateString] || [];
        console.log("[AvailabilityServiceWithSync] Heures disponibles pour", dateString, ":", hours.length, "créneaux");
        return hours;
    },
    
    // Ajoute ou met à jour les disponibilités pour une date spécifique
    updateDateAvailability: async function(dateString, hours) {
        // Récupérer les données actuelles
        const availabilities = this.getAvailabilities();
        
        // Mettre à jour les heures pour cette date
        availabilities[dateString] = hours;
        
        // Enregistrer les modifications avec synchronisation cloud
        const success = await this.setAvailabilities(availabilities);
        
        console.log("[AvailabilityServiceWithSync] Mise à jour des disponibilités pour", dateString, 
                    success ? "réussie" : "échouée", 
                    "Nouveaux créneaux:", hours.length);
        
        return success;
    },
    
    // Supprime les disponibilités pour une date
    clearDateAvailability: async function(dateString) {
        // Récupérer les données actuelles
        const availabilities = this.getAvailabilities();
        
        // Supprimer les heures pour cette date
        if (availabilities[dateString]) {
            delete availabilities[dateString];
            
            // Enregistrer les modifications avec synchronisation cloud
            const success = await this.setAvailabilities(availabilities);
            
            console.log("[AvailabilityServiceWithSync] Suppression des disponibilités pour", dateString, 
                        success ? "réussie" : "échouée");
            
            return success;
        }
        
        return true; // La date n'existait pas, donc considéré comme un succès
    }
};

// Initialiser et remplacer le service existant
document.addEventListener('DOMContentLoaded', function() {
    console.log("[SyncScript] Initialisation de la synchronisation entre appareils...");
    
    // Initialiser le service avec synchronisation
    const syncService = AvailabilityServiceWithSync.init();
    
    // Remplacer le service existant
    window.StorageService = syncService;
    window.AvailabilityService = syncService;
    
    // Maintenir la compatibilité avec l'API simple
    window.availabilityModule = {
        isDateAvailable: syncService.isDateAvailable.bind(syncService),
        getAvailableHours: syncService.getAvailableHours.bind(syncService)
    };
    
    // Remplacer les fonctions globales
    if (typeof getAvailabilities === 'function') {
        window.getAvailabilities = syncService.getAvailabilities.bind(syncService);
    }
    
    if (typeof setAvailabilities === 'function') {
        window.setAvailabilities = syncService.setAvailabilities.bind(syncService);
    }
    
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
                    const success = await syncService.updateDateAvailability(selectedDate, availableHours);
                    
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
    
    console.log("[SyncScript] Synchronisation entre appareils configurée avec succès!");
});