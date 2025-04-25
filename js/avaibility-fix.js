// availability-fix.js
// Solution pour résoudre le problème de synchronisation des disponibilités entre mobile et PC

// Service unifié de gestion des disponibilités
const AvailabilityService = {
    // Clé commune utilisée sur tous les appareils
    STORAGE_KEY: 'fchairs_availabilities',
    
    // Récupérer les disponibilités
    getAvailabilities: function() {
        try {
            // Récupérer depuis localStorage avec logging détaillé
            console.log("[AvailabilityService] Tentative de récupération des disponibilités");
            const data = localStorage.getItem(this.STORAGE_KEY);
            console.log("[AvailabilityService] Données brutes récupérées:", data);
            
            // Valider les données
            if (!data) {
                console.log("[AvailabilityService] Aucune donnée trouvée, retour d'un objet vide");
                return {};
            }
            
            try {
                const parsedData = JSON.parse(data);
                console.log("[AvailabilityService] Données parsées avec succès:", 
                            Object.keys(parsedData).length, "dates disponibles");
                return parsedData;
            } catch (parseError) {
                console.error("[AvailabilityService] Erreur de parsing:", parseError);
                return {};
            }
        } catch (error) {
            console.error("[AvailabilityService] Erreur lors de la récupération:", error);
            return {};
        }
    },
    
    // Enregistrer les disponibilités
    setAvailabilities: function(availabilities) {
        try {
            // Valider l'entrée
            if (!availabilities || typeof availabilities !== 'object') {
                console.error("[AvailabilityService] Données invalides:", availabilities);
                return false;
            }
            
            // Journaliser l'opération
            console.log("[AvailabilityService] Tentative d'enregistrement des disponibilités:", 
                        Object.keys(availabilities).length, "dates");
            
            // Convertir en JSON et stocker
            const jsonData = JSON.stringify(availabilities);
            localStorage.setItem(this.STORAGE_KEY, jsonData);
            
            // Vérifier que l'enregistrement a fonctionné
            const verification = localStorage.getItem(this.STORAGE_KEY);
            const success = verification === jsonData;
            
            console.log("[AvailabilityService] Enregistrement", 
                        success ? "réussi" : "échoué", 
                        "Taille des données:", jsonData.length, "caractères");
            
            return success;
        } catch (error) {
            console.error("[AvailabilityService] Erreur lors de l'enregistrement:", error);
            return false;
        }
    },
    
    // Vérifie si une date est disponible
    isDateAvailable: function(dateString) {
        const availabilities = this.getAvailabilities();
        const isAvailable = availabilities[dateString] && availabilities[dateString].length > 0;
        console.log("[AvailabilityService] Vérification disponibilité pour", dateString, ":", isAvailable);
        return isAvailable;
    },
    
    // Obtient les heures disponibles pour une date
    getAvailableHours: function(dateString) {
        const availabilities = this.getAvailabilities();
        const hours = availabilities[dateString] || [];
        console.log("[AvailabilityService] Heures disponibles pour", dateString, ":", hours.length, "créneaux");
        return hours;
    },
    
    // Ajoute ou met à jour les disponibilités pour une date spécifique
    updateDateAvailability: function(dateString, hours) {
        // Récupérer les données actuelles
        const availabilities = this.getAvailabilities();
        
        // Mettre à jour les heures pour cette date
        availabilities[dateString] = hours;
        
        // Enregistrer les modifications
        const success = this.setAvailabilities(availabilities);
        
        console.log("[AvailabilityService] Mise à jour des disponibilités pour", dateString, 
                    success ? "réussie" : "échouée", 
                    "Nouveaux créneaux:", hours.length);
        
        return success;
    },
    
    // Supprime les disponibilités pour une date
    clearDateAvailability: function(dateString) {
        // Récupérer les données actuelles
        const availabilities = this.getAvailabilities();
        
        // Supprimer les heures pour cette date
        if (availabilities[dateString]) {
            delete availabilities[dateString];
            
            // Enregistrer les modifications
            const success = this.setAvailabilities(availabilities);
            
            console.log("[AvailabilityService] Suppression des disponibilités pour", dateString, 
                        success ? "réussie" : "échouée");
            
            return success;
        }
        
        return true; // La date n'existait pas, donc considéré comme un succès
    },
    
    // Crée des disponibilités de test
    createTestAvailabilities: function() {
        const today = new Date();
        const availabilities = {};
        
        // Créer des disponibilités pour aujourd'hui et les 7 prochains jours
        for (let i = 0; i < 8; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Ignorer le dimanche
            if (date.getDay() === 0) continue;
            
            // Formater la date (YYYY-MM-DD)
            const dateString = this.formatDateString(date);
            
            // Générer des heures (9h-19h avec intervalles de 30min)
            const hours = [];
            for (let h = 9; h < 19; h++) {
                if (Math.random() > 0.3) { // 70% de chances d'être disponible
                    hours.push(`${h.toString().padStart(2, '0')}:00`);
                }
                if (Math.random() > 0.3) {
                    hours.push(`${h.toString().padStart(2, '0')}:30`);
                }
            }
            
            availabilities[dateString] = hours;
        }
        
        // Sauvegarder les disponibilités
        const success = this.setAvailabilities(availabilities);
        
        console.log("[AvailabilityService] Création de disponibilités de test", 
                    success ? "réussie" : "échouée", 
                    "Nombre de dates:", Object.keys(availabilities).length);
        
        return availabilities;
    },
    
    // Utilitaire pour formater une date
    formatDateString: function(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};

// Remplacer les fonctions de disponibilité existantes
document.addEventListener('DOMContentLoaded', function() {
    console.log("[AvailabilityFix] Initialisation de la correction pour les disponibilités");
    
    // Vérifier s'il y a des données existantes à migrer
    const existingData = localStorage.getItem('fchairs_availabilities');
    if (existingData) {
        console.log("[AvailabilityFix] Données existantes trouvées - Migration non nécessaire");
    } else {
        // Vérifier d'autres clés possibles utilisées précédemment
        const alternateKeys = [
            'availabilities',
            'fchairsAvailabilities',
            'fc_availabilities'
        ];
        
        let migrated = false;
        alternateKeys.forEach(key => {
            const altData = localStorage.getItem(key);
            if (altData && !migrated) {
                try {
                    console.log("[AvailabilityFix] Données trouvées sous une clé alternative:", key);
                    localStorage.setItem('fchairs_availabilities', altData);
                    console.log("[AvailabilityFix] Migration des données réussie");
                    migrated = true;
                } catch (e) {
                    console.error("[AvailabilityFix] Échec de la migration:", e);
                }
            }
        });
        
        if (!migrated) {
            console.log("[AvailabilityFix] Aucune donnée existante trouvée");
        }
    }
    
    // Remplacer les fonctions globales existantes
    window.StorageService = AvailabilityService;
    
    // Pour l'API plus simple, maintenir la compatibilité
    window.availabilityModule = {
        isDateAvailable: AvailabilityService.isDateAvailable.bind(AvailabilityService),
        getAvailableHours: AvailabilityService.getAvailableHours.bind(AvailabilityService)
    };
    
    // Remplacer les fonctions dans le module d'administration
    if (window.location.pathname.includes('/admin/')) {
        console.log("[AvailabilityFix] Correction des fonctions d'administration");
        
        // Remplacer les fonctions globales existantes
        if (typeof getAvailabilities === 'function') {
            window.getAvailabilities = AvailabilityService.getAvailabilities.bind(AvailabilityService);
        }
        
        if (typeof setAvailabilities === 'function') {
            window.setAvailabilities = AvailabilityService.setAvailabilities.bind(AvailabilityService);
        }
        
        // Ajouter un écouteur d'événements pour le bouton de sauvegarde
        const saveBtnSelector = '#save-availability';
        
        // Attendre que le DOM soit complètement chargé
        setTimeout(function() {
            const saveBtn = document.querySelector(saveBtnSelector);
            if (saveBtn) {
                console.log("[AvailabilityFix] Bouton de sauvegarde trouvé, ajout d'un gestionnaire");
                
                // Supprimer les gestionnaires existants
                const newBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newBtn, saveBtn);
                
                // Ajouter notre propre gestionnaire
                newBtn.addEventListener('click', function() {
                    console.log("[AvailabilityFix] Bouton de sauvegarde cliqué");
                    
                    if (!selectedDate) {
                        alert('Veuillez d\'abord sélectionner une date.');
                        return;
                    }
                    
                    // Mettre à jour la liste des heures
                    updateAvailableHours();
                    
                    // Enregistrer directement avec notre service
                    const success = AvailabilityService.updateDateAvailability(selectedDate, availableHours);
                    
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
                        
                        alert('Disponibilités enregistrées avec succès.');
                    } else {
                        alert('Erreur lors de l\'enregistrement des disponibilités. Veuillez réessayer.');
                    }
                });
            } else {
                console.warn("[AvailabilityFix] Bouton de sauvegarde non trouvé");
            }
        }, 1000); // Attendre 1 seconde pour s'assurer que tout est chargé
    }
    
    console.log("[AvailabilityFix] Correction installée avec succès");
});

// Fonctions utilitaires
function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

// Forcer l'actualisation après l'enregistrement des disponibilités
function forceRefreshAfterSave() {
    // Rechercher tous les boutons de sauvegarde de disponibilités
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent.toLowerCase().includes('enregistrer') ||
            button.textContent.toLowerCase().includes('sauvegarder') ||
            button.id.toLowerCase().includes('save')) {
            
            // Cloner pour supprimer les gestionnaires existants
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Ajouter notre gestionnaire
            newButton.addEventListener('click', function() {
                console.log("[AvailabilityFix] Clic détecté sur un bouton de sauvegarde, programmation de l'actualisation");
                
                // Attendre un peu que l'enregistrement se termine
                setTimeout(function() {
                    console.log("[AvailabilityFix] Actualisation de la page pour refléter les changements");
                    window.location.reload();
                }, 1500);
            });
        }
    });
}