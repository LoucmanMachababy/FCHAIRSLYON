// shared-storage.js - À placer dans le dossier js/
// Centralise le stockage des disponibilités pour tout le site

const StorageService = {
    // Clés de stockage partagées
    keys: {
        AVAILABILITIES: 'fchairs_availabilities'
    },
    
    // Obtenir les disponibilités
    getAvailabilities: function() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.AVAILABILITIES) || '{}');
        } catch (error) {
            console.error("Erreur lors de la récupération des disponibilités:", error);
            return {};
        }
    },
    
    // Enregistrer les disponibilités
    setAvailabilities: function(availabilities) {
        try {
            localStorage.setItem(this.keys.AVAILABILITIES, JSON.stringify(availabilities));
            console.log("Disponibilités enregistrées:", availabilities);
            return true;
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des disponibilités:", error);
            return false;
        }
    },
    
    // Vérifier si une date est disponible
    isDateAvailable: function(dateString) {
        const availabilities = this.getAvailabilities();
        return availabilities[dateString] && availabilities[dateString].length > 0;
    },
    
    // Obtenir les heures disponibles pour une date
    getAvailableHours: function(dateString) {
        const availabilities = this.getAvailabilities();
        return availabilities[dateString] || [];
    }
};

// Rendre le service disponible globalement
window.StorageService = StorageService;