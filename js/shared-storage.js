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
            const data = localStorage.getItem(this.keys.AVAILABILITIES);
            console.log("Récupération des disponibilités:", data);
            return JSON.parse(data || '{}');
        } catch (error) {
            console.error("Erreur lors de la récupération des disponibilités:", error);
            return {};
        }
    },
    
    // Enregistrer les disponibilités
    setAvailabilities: function(availabilities) {
        try {
            const jsonData = JSON.stringify(availabilities);
            localStorage.setItem(this.keys.AVAILABILITIES, jsonData);
            console.log("Disponibilités enregistrées:", jsonData);
            return true;
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des disponibilités:", error);
            return false;
        }
    },
    
    // Vérifier si une date est disponible
    isDateAvailable: function(dateString) {
        const availabilities = this.getAvailabilities();
        console.log(`Vérification disponibilité pour ${dateString}:`, 
                    availabilities[dateString] && availabilities[dateString].length > 0);
        return availabilities[dateString] && availabilities[dateString].length > 0;
    },
    
    // Obtenir les heures disponibles pour une date
    getAvailableHours: function(dateString) {
        const availabilities = this.getAvailabilities();
        console.log(`Heures disponibles pour ${dateString}:`, availabilities[dateString] || []);
        return availabilities[dateString] || [];
    },
    
    // Méthode de débogage pour créer des disponibilités de test
    createTestAvailabilities: function() {
        const today = new Date();
        const availabilities = {};
        
        // Créer des disponibilités pour aujourd'hui et les 7 prochains jours
        for (let i = 0; i < 8; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Formater la date (YYYY-MM-DD)
            const dateString = this.formatDateString(date);
            
            // Générer des heures aléatoires (entre 9h et 18h)
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
        this.setAvailabilities(availabilities);
        console.log("Disponibilités de test créées:", availabilities);
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

// Rendre le service disponible globalement
window.StorageService = StorageService;

// Initialisation (exécutée au chargement du script)
(function() {
    console.log("Initialisation du StorageService");
    
    // Vérifier si des disponibilités existent déjà
    const availabilities = StorageService.getAvailabilities();
    if (Object.keys(availabilities).length === 0) {
        console.log("Aucune disponibilité trouvée, création de données de test");
        // Créer des disponibilités de test pour la démo
        StorageService.createTestAvailabilities();
    }
})();