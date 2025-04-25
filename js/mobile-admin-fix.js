// mobile-admin-fix.js
// Ce script corrige spécifiquement les problèmes d'interactions tactiles sur mobile
// pour l'interface d'administration des disponibilités

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes sur la page d'administration
    if (!window.location.pathname.includes('/admin/')) return;
    
    console.log("[MobileAdminFix] Initialisation des correctifs spécifiques pour mobile");
    
    // Détection de l'appareil mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
        console.log("[MobileAdminFix] Appareil non mobile détecté, correctifs non appliqués");
        return;
    }
    
    console.log("[MobileAdminFix] Appareil mobile détecté, application des correctifs");
    
    // 1. Corriger les événements de clic vs. touch sur les jours du calendrier
    enhanceCalendarTouchInteractions();
    
    // 2. Améliorer la sélection des cases à cocher des heures
    enhanceCheckboxInteractions();
    
    // 3. Ajouter un mécanisme de confirmation avant sauvegarde
    enhanceSaveButtonWithConfirmation();
    
    // 4. Forcer l'actualisation après la sauvegarde
    addRefreshAfterSave();
    
    // 5. Ajouter des indicateurs visuels de progression
    addVisualFeedback();
    
    console.log("[MobileAdminFix] Correctifs mobiles appliqués avec succès");
});

// Améliorer les interactions tactiles avec le calendrier
function enhanceCalendarTouchInteractions() {
    // Attendre un peu que le calendrier soit généré
    setTimeout(function() {
        console.log("[MobileAdminFix] Amélioration des interactions tactiles du calendrier");
        
        // Sélectionner tous les jours du calendrier
        const calendarDays = document.querySelectorAll('.calendar-day:not(.past)');
        
        calendarDays.forEach(day => {
            // Style pour indiquer qu'il est tactile
            day.style.cursor = 'pointer';
            
            // Supprimer les gestionnaires existants et ajouter les nôtres
            const newDay = day.cloneNode(true);
            day.parentNode.replaceChild(newDay, day);
            
            // Ajouter des gestionnaires pour les événements tactiles
            newDay.addEventListener('touchstart', function() {
                this.style.backgroundColor = '#FFD0E0'; // Feedback visuel au toucher
            });
            
            newDay.addEventListener('touchend', function() {
                this.style.backgroundColor = ''; // Restaurer la couleur
                
                // Simuler un clic pour déclencher la sélection
                if (typeof selectAvailabilityDate === 'function') {
                    const dateString = this.getAttribute('data-date');
                    if (dateString) {
                        console.log("[MobileAdminFix] Sélection de la date:", dateString);
                        selectAvailabilityDate(dateString);
                    }
                } else {
                    console.warn("[MobileAdminFix] Fonction selectAvailabilityDate non trouvée");
                }
            });
            
            // Maintenir également le clic normal pour la compatibilité
            newDay.addEventListener('click', function() {
                const dateString = this.getAttribute('data-date');
                if (dateString && typeof selectAvailabilityDate === 'function') {
                    selectAvailabilityDate(dateString);
                }
            });
        });
    }, 1000); // Attendre 1 seconde
}

// Améliorer l'interaction avec les cases à cocher des heures
function enhanceCheckboxInteractions() {
    // Observer les modifications du DOM pour détecter l'ajout de cases à cocher
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Rechercher les cases à cocher nouvellement ajoutées
                const checkboxes = document.querySelectorAll('.hour-checkbox');
                
                checkboxes.forEach(checkbox => {
                    // Agrandir la zone tactile
                    const label = checkbox.closest('label');
                    if (label) {
                        label.style.padding = '12px';
                        label.style.display = 'flex';
                        label.style.alignItems = 'center';
                        
                        // Augmenter la taille de la case à cocher
                        checkbox.style.width = '20px';
                        checkbox.style.height = '20px';
                    }
                });
            }
        });
    });
    
    // Observer les modifications dans le conteneur d'heures
    const hoursContainer = document.getElementById('hours-container');
    if (hoursContainer) {
        observer.observe(hoursContainer, { childList: true, subtree: true });
    }
}

// Améliorer le bouton de sauvegarde avec confirmation
function enhanceSaveButtonWithConfirmation() {
    setTimeout(function() {
        const saveButton = document.getElementById('save-availability');
        if (saveButton) {
            console.log("[MobileAdminFix] Amélioration du bouton de sauvegarde");
            
            // Remplacer le bouton pour supprimer les gestionnaires existants
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
            
            // Ajouter notre gestionnaire avec confirmation
            newSaveButton.addEventListener('click', function(e) {
                // Empêcher l'action par défaut
                e.preventDefault();
                e.stopPropagation();
                
                // Vérifier si une date est sélectionnée
                if (typeof selectedDate === 'undefined' || !selectedDate) {
                    alert('Veuillez d\'abord sélectionner une date.');
                    return;
                }
                
                // Mettre à jour la liste des heures
                if (typeof updateAvailableHours === 'function') {
                    updateAvailableHours();
                }
                
                // Demander confirmation
                if (confirm('Êtes-vous sûr de vouloir enregistrer ces disponibilités ?')) {
                    console.log("[MobileAdminFix] Sauvegarde confirmée");
                    
                    // Indication visuelle
                    this.textContent = 'Enregistrement...';
                    this.disabled = true;
                    
                    // Enregistrer avec le service centralisé
                    if (window.AvailabilityService) {
                        const success = window.AvailabilityService.updateDateAvailability(
                            selectedDate, 
                            window.availableHours || []
                        );
                        
                        if (success) {
                            console.log("[MobileAdminFix] Enregistrement réussi");
                            alert('Disponibilités enregistrées avec succès.');
                            
                            // Actualiser la page pour voir les changements
                            setTimeout(() => window.location.reload(), 500);
                        } else {
                            console.error("[MobileAdminFix] Échec de l'enregistrement");
                            alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
                            this.disabled = false;
                            this.textContent = 'Enregistrer';
                        }
                    } else {
                        // Utiliser la fonction originale si disponible
                        if (typeof saveAvailability === 'function') {
                            saveAvailability();
                            
                            // Actualiser après un délai
                            setTimeout(() => window.location.reload(), 500);
                        } else {
                            console.error("[MobileAdminFix] Aucune méthode de sauvegarde trouvée");
                            alert('Erreur: méthode de sauvegarde non trouvée.');
                            this.disabled = false;
                            this.textContent = 'Enregistrer';
                        }
                    }
                }
            });
        }
    }, 1000);
}

// Ajouter un rechargement de page après la sauvegarde
function addRefreshAfterSave() {
    // Surveiller les modifications apportées aux données de disponibilité
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        // Appeler la fonction originale
        originalSetItem.apply(this, arguments);
        
        // Si c'est une sauvegarde de disponibilités
        if (key.includes('availabilit')) {
            console.log("[MobileAdminFix] Détection d'une sauvegarde de disponibilités");
            
            // Programmer un rechargement de page
            setTimeout(function() {
                console.log("[MobileAdminFix] Rechargement de la page pour refléter les changements");
                window.location.reload();
            }, 1000);
        }
    };
}

// Ajouter des retours visuels pour une meilleure expérience sur mobile
function addVisualFeedback() {
    // Ajouter des styles pour le feedback visuel
    const styles = document.createElement('style');
    styles.textContent = `
        /* Amélioration de l'apparence tactile */
        .hour-item {
            transition: background-color 0.2s ease;
        }
        
        .hour-item:active {
            background-color: #FFD0E0;
        }
        
        .hour-checkbox:checked + span {
            font-weight: bold;
            color: #FF6BB3;
        }
        
        /* Effet pulsation lors des modifications */
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .pulse-effect {
            animation: pulse 0.3s ease;
        }
        
        /* Amélioration du bouton de sauvegarde */
        #save-availability {
            padding: 12px;
            font-size: 1.1rem;
            margin-top: 20px;
        }
        
        /* État de chargement */
        .loading-state {
            position: relative;
            pointer-events: none;
        }
        
        .loading-state::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(styles);
    
    // Ajouter une notification visuelle de changement
    setTimeout(function() {
        const checkboxes = document.querySelectorAll('.hour-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const item = this.closest('.hour-item');
                if (item) {
                    // Ajouter un effet de pulsation temporaire
                    item.classList.add('pulse-effect');
                    setTimeout(() => item.classList.remove('pulse-effect'), 300);
                }
            });
        });
    }, 1000);
}