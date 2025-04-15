// Fichier utils.js
// Centralise les fonctions utilitaires utilisées dans plusieurs fichiers

// Namespace global pour les utilitaires
window.utils = window.utils || {};

// Utilitaires pour l'authentification admin
window.utils.auth = {
    // Vérifier si l'utilisateur est connecté en tant qu'admin
    checkAdminAuth: function() {
        console.log("checkAdminAuth() centralisé appelé");
        const isLoggedIn = sessionStorage.getItem('admin-logged-in');
        
        // Si on est sur la page admin mais pas connecté, rediriger vers l'accueil
        if (isLoggedIn !== 'true') {
            // Déterminer si nous sommes sur la page admin
            if (window.location.pathname.includes('/admin/')) {
                console.log("Redirection vers la page d'accueil (non connecté)");
                try {
                    window.location.href = '../index.html#admin';
                } catch (e) {
                    console.error("Erreur lors de la redirection:", e);
                }
                return false;
            }
            return false;
        }
        
        return true;
    },
    
    // Se connecter en tant qu'admin
    login: function(username, password) {
        // Pour une démonstration, on accepte uniquement admin/admin
        if (username === 'admin' && password === 'admin') {
            sessionStorage.setItem('admin-logged-in', 'true');
            return true;
        }
        return false;
    },
    
    // Se déconnecter
    logout: function() {
        sessionStorage.removeItem('admin-logged-in');
        // Rediriger vers la page d'accueil
        try {
            window.location.href = '../index.html';
        } catch (e) {
            console.error("Erreur lors de la redirection:", e);
        }
    },
    
    // Afficher le formulaire de connexion
    showLoginForm: function() {
        // Cette fonction devrait afficher un formulaire de connexion modal
        console.log("showLoginForm() appelé - à implémenter spécifiquement dans chaque contexte");
    }
};

// Utilitaires pour localStorage
window.utils.storage = {
    // Récupérer des données depuis localStorage
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error(`Erreur lors de la récupération des données (${key}) depuis localStorage: ${error}`);
            return defaultValue;
        }
    },
    
    // Stocker des données dans localStorage
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Erreur lors du stockage des données (${key}) dans localStorage: ${error}`);
            return false;
        }
    },
    
    // Supprimer des données de localStorage
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression des données (${key}) de localStorage: ${error}`);
            return false;
        }
    }
};

// Utilitaires pour la gestion des dates
window.utils.date = {
    // Formater une date en français
    formatDateFR: function(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    // Formater une heure en français
    formatTimeFR: function(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Obtenir la date actuelle au format ISO (YYYY-MM-DD)
    getCurrentDateISO: function() {
        return new Date().toISOString().split('T')[0];
    }
};

// Utilitaires pour la gestion des services
window.utils.services = {
    // Normaliser un chemin d'image
    normalizeImagePath: function(path) {
        if (!path) return 'images/default.jpg';
        
        // Si le chemin commence par 'images/' ou 'assets/images/', le laisser tel quel
        if (path.startsWith('images/') || path.startsWith('assets/images/')) {
            return path;
        }
        
        // Sinon, ajouter 'images/'
        return 'images/' + path;
    },
    
    // Calculer le prix d'un service
    calculatePrice: function(service, category, model, brushing = false) {
        // Récupérer les services depuis localStorage
        const services = window.utils.storage.get('services', {
            femmes: {},
            hommes: {}
        });
        
        let price = 0;
        
        // Vérifier que le service existe
        if (services[category] && services[category][service] && services[category][service][model]) {
            price = services[category][service][model];
        } else {
            console.error(`Service non trouvé: ${category} / ${service} / ${model}`);
        }
        
        // Ajouter le prix du brushing si nécessaire
        if (brushing) {
            price += 5;
        }
        
        return price;
    }
};

// Ce fichier sert de pont entre reservation.js et le reste de l'application
// Permet de résoudre le problème de référence dans index.html

// Importer toutes les fonctions de reservation.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Chargement de reservations.js (fichier pont)");
    
    // Vérifier que le fichier reservation.js est chargé
    if (typeof getClientReservations === 'undefined') {
        console.error("Le fichier reservation.js n'est pas chargé correctement");
        
        // Charger dynamiquement reservation.js
        const script = document.createElement('script');
        script.src = 'js/reservation.js';
        script.onload = function() {
            console.log("reservation.js chargé avec succès");
        };
        script.onerror = function() {
            console.error("Impossible de charger reservation.js");
        };
        document.head.appendChild(script);
    } else {
        console.log("reservation.js déjà chargé");
    }
});

// Si le fichier reservation.js n'est pas chargé, définir des fonctions de secours
// pour éviter les erreurs JavaScript
if (typeof getClientReservations === 'undefined') {
    function getClientReservations(phone) {
        console.warn("Function getClientReservations called but not properly loaded");
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        return reservations.filter(res => res.phone === phone);
    }
    
    function getUpcomingReservations() {
        console.warn("Function getUpcomingReservations called but not properly loaded");
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const now = new Date();
        
        return reservations.filter(res => {
            const resDate = new Date(res.dateTime);
            return resDate > now && res.status !== 'cancelled';
        });
    }
    
    function exportReservationsToCSV() {
        console.warn("Function exportReservationsToCSV called but not properly loaded");
        // Implémentation minimale
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        
        if (reservations.length === 0) {
            return null;
        }
        
        // Entêtes CSV
        let csv = 'Nom,Téléphone,Service,Modèle,Brushing,Prix,Date,Heure,Statut,Notes\n';
        
        // Données
        reservations.forEach(res => {
            const date = new Date(res.dateTime);
            const formattedDate = date.toLocaleDateString('fr-FR');
            const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            
            const brushing = res.brushing ? 'Oui' : 'Non';
            const status = res.status === 'pending' ? 'En attente' : 
                        res.status === 'confirmed' ? 'Confirmé' : 'Annulé';
            
            // Échapper les valeurs qui contiennent des virgules ou des guillemets
            const escapeCsv = (value) => {
                if (value && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            };
            
            csv += `${escapeCsv(res.name)},`;
            csv += `${escapeCsv(res.phone)},`;
            csv += `${escapeCsv(res.service)},`;
            csv += `${escapeCsv(res.model)},`;
            csv += `${brushing},`;
            csv += `${res.totalPrice}€,`;
            csv += `${formattedDate},`;
            csv += `${formattedTime},`;
            csv += `${status},`;
            csv += `${escapeCsv(res.notes)}\n`;
        });
        
        return csv;
    }
    
    // Autres fonctions de secours si nécessaire
}
console.log("Utilitaires chargés avec succès");