// Fichier admin-availability.js
// Ce fichier contient les fonctionnalités de gestion des disponibilités pour l'admin

// Variables globales
let selectedDate = null;
let availabilityData = {};
let currentAvailabilityMonth = new Date();

// Initialisation du module de gestion des disponibilités
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser seulement si on est sur la page admin
    if (!document.getElementById('availability')) return;
    
    // Charger les disponibilités existantes
    loadAvailabilityData();
    
    // Initialiser les onglets de disponibilité
    initAvailabilityTabs();
    
    // Initialiser le calendrier de disponibilité
    initAvailabilityCalendar();
    
    // Initialiser les événements pour les créneaux horaires
    initTimeSlotEvents();
    
    // Initialiser les disponibilités récurrentes
    initRecurringAvailability();
    
    // Événement pour sauvegarder les disponibilités
    document.getElementById('save-availability-btn').addEventListener('click', saveAvailabilityData);
});

// Fonction pour initialiser les onglets de disponibilité
function initAvailabilityTabs() {
    const tabButtons = document.querySelectorAll('[data-availability-tab]');
    const tabContents = document.querySelectorAll('.availability-tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.dataset.availabilityTab;
            
            // Mettre à jour les classes active des boutons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher le contenu de l'onglet sélectionné
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tab + '-tab') {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Fonction pour initialiser le calendrier de disponibilité
function initAvailabilityCalendar() {
    // Afficher le mois courant
    updateAvailabilityCalendar(currentAvailabilityMonth);
    
    // Écouteurs pour les boutons de navigation
    document.getElementById('availability-prev-month').addEventListener('click', function() {
        currentAvailabilityMonth.setMonth(currentAvailabilityMonth.getMonth() - 1);
        updateAvailabilityCalendar(currentAvailabilityMonth);
    });
    
    document.getElementById('availability-next-month').addEventListener('click', function() {
        currentAvailabilityMonth.setMonth(currentAvailabilityMonth.getMonth() + 1);
        updateAvailabilityCalendar(currentAvailabilityMonth);
    });
    
    // Écouteur pour le changement de statut d'une date
    document.getElementById('date-availability-status').addEventListener('change', function() {
        if (!selectedDate) return;
        
        const status = this.value;
        const dateKey = formatDateKey(selectedDate);
        
        if (!availabilityData[dateKey]) {
            availabilityData[dateKey] = {
                available: status === 'available',
                slots: []
            };
        } else {
            availabilityData[dateKey].available = status === 'available';
        }
        
        // Mettre à jour l'affichage du calendrier
        updateAvailabilityCalendar(currentAvailabilityMonth);
        
        // Mettre à jour l'interface des créneaux
        updateTimeSlotsInterface();
    });
}

// Fonction pour mettre à jour le calendrier des disponibilités
function updateAvailabilityCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Mettre à jour le titre du mois
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    document.getElementById('availability-month-year').textContent = `${monthNames[month]} ${year}`;
    
    // Récupérer les jours dans le mois
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Récupérer le jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, etc.)
    let dayOfWeek = firstDay.getDay();
    // Ajuster pour que la semaine commence le lundi
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Générer les jours du calendrier
    const calendarDays = document.getElementById('availability-calendar-days');
    calendarDays.innerHTML = '';
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = dayOfWeek - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day past';
        dayDiv.textContent = prevMonthLastDay - i;
        calendarDays.appendChild(dayDiv);
    }
    
    // Jours du mois actuel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const currentDate = new Date(year, month, i);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;
        
        // Ajouter un attribut data-date
        const dateStr = formatDateKey(currentDate);
        dayDiv.dataset.date = dateStr;
        
        // Vérifier si c'est aujourd'hui
        if (currentDate.toDateString() === today.toDateString()) {
            dayDiv.classList.add('today');
        }
        
        // Vérifier si le jour est dans le passé
        if (currentDate < today) {
            dayDiv.classList.add('past');
        } else {
            // Vérifier si le jour a des disponibilités définies
            if (availabilityData[dateStr]) {
                if (availabilityData[dateStr].available) {
                    dayDiv.classList.add('available');
                } else {
                    dayDiv.classList.add('unavailable');
                }
            }
            
            // Ajouter un événement au clic pour sélectionner la date
            dayDiv.addEventListener('click', function() {
                if (dayDiv.classList.contains('past')) return; // Ne pas permettre de sélectionner des dates passées
                
                // Supprimer la classe selected de tous les jours
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.classList.remove('selected');
                });
                
                // Ajouter la classe selected à ce jour
                this.classList.add('selected');
                
                // Mettre à jour la date sélectionnée
                selectedDate = new Date(year, month, i);
                
                // Mettre à jour l'affichage des créneaux horaires
                updateTimeSlotsUI(selectedDate);
            });
        }
        
        calendarDays.appendChild(dayDiv);
    }
    
    // Jours du mois suivant
    const totalDays = dayOfWeek + lastDay.getDate();
    const daysToAdd = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    
    for (let i = 1; i <= daysToAdd; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day past';
        dayDiv.textContent = i;
        calendarDays.appendChild(dayDiv);
    }
}

// Fonction pour mettre à jour l'interface des créneaux horaires
function updateTimeSlotsUI(date) {
    // Mettre à jour le titre
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('selected-date').textContent = date.toLocaleDateString('fr-FR', options);
    
    // Vérifier si cette date a déjà des disponibilités définies
    const dateKey = formatDateKey(date);
    const dateAvailability = availabilityData[dateKey] || { available: true, slots: [] };
    
    // Mettre à jour le statut de disponibilité
    document.getElementById('date-availability-status').value = dateAvailability.available ? 'available' : 'unavailable';
    
    // Mettre à jour les créneaux horaires
    updateTimeSlotsInterface();
}

// Fonction pour initialiser les événements des créneaux horaires
function initTimeSlotEvents() {
    // Bouton pour ajouter un créneau
    document.getElementById('add-time-slot-btn').addEventListener('click', function() {
        if (!selectedDate) {
            alert('Veuillez d\'abord sélectionner une date dans le calendrier.');
            return;
        }
        
        // Afficher la modale d'ajout de créneau
        const modal = document.getElementById('add-time-slot-modal');
        modal.style.display = 'flex';
        
        // Réinitialiser le formulaire
        document.getElementById('time-slot-form').reset();
        
        // Définir des valeurs par défaut
        document.getElementById('slot-start-time').value = '09:00';
        document.getElementById('slot-end-time').value = '10:00';
    });
    
    // Bouton pour effacer tous les créneaux
    document.getElementById('clear-time-slots-btn').addEventListener('click', function() {
        if (!selectedDate) return;
        
        const dateKey = formatDateKey(selectedDate);
        
        if (availabilityData[dateKey]) {
            availabilityData[dateKey].slots = [];
            updateTimeSlotsInterface();
        }
    });
    
    // Bouton pour sauvegarder un créneau
    document.getElementById('save-time-slot-btn').addEventListener('click', function() {
        const startTime = document.getElementById('slot-start-time').value;
        const endTime = document.getElementById('slot-end-time').value;
        
        if (!startTime || !endTime) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        
        if (startTime >= endTime) {
            alert('L\'heure de début doit être antérieure à l\'heure de fin.');
            return;
        }
        
        // Ajouter le créneau aux disponibilités
        addTimeSlot(selectedDate, startTime, endTime);
        
        // Fermer la modale
        document.getElementById('add-time-slot-modal').style.display = 'none';
    });
    
    // Bouton pour annuler l'ajout d'un créneau
    document.getElementById('cancel-time-slot-btn').addEventListener('click', function() {
        document.getElementById('add-time-slot-modal').style.display = 'none';
    });
    
    // Fermer la modale si on clique en dehors
    document.getElementById('add-time-slot-modal').addEventListener('click', function(event) {
        if (event.target === this) {
            this.style.display = 'none';
        }
    });
    
    // Fermer la modale avec le bouton X
    document.querySelector('#add-time-slot-modal .modal-close').addEventListener('click', function() {
        document.getElementById('add-time-slot-modal').style.display = 'none';
    });
}

// Fonction pour ajouter un créneau horaire
function addTimeSlot(date, startTime, endTime) {
    if (!date) return;
    
    const dateKey = formatDateKey(date);
    
    // Créer l'entrée pour cette date si elle n'existe pas
    if (!availabilityData[dateKey]) {
        availabilityData[dateKey] = {
            available: true,
            slots: []
        };
    }
    
    // Ajouter le créneau
    availabilityData[dateKey].slots.push({
        start: startTime,
        end: endTime
    });
    
    // Trier les créneaux par heure de début
    availabilityData[dateKey].slots.sort((a, b) => a.start.localeCompare(b.start));
    
    // Mettre à jour l'interface
    updateTimeSlotsInterface();
}

// Fonction pour supprimer un créneau horaire
function removeTimeSlot(date, index) {
    if (!date) return;
    
    const dateKey = formatDateKey(date);
    
    if (availabilityData[dateKey] && availabilityData[dateKey].slots[index]) {
        availabilityData[dateKey].slots.splice(index, 1);
        updateTimeSlotsInterface();
    }
}

// Fonction pour mettre à jour l'interface des créneaux horaires
function updateTimeSlotsInterface() {
    const slotsContainer = document.getElementById('time-slots');
    slotsContainer.innerHTML = '';
    
    if (!selectedDate) {
        slotsContainer.innerHTML = '<p class="no-date-selected">Veuillez sélectionner une date dans le calendrier.</p>';
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    
    // Vérifier si cette date a des disponibilités définies
    if (!availabilityData[dateKey] || !availabilityData[dateKey].available) {
        slotsContainer.innerHTML = '<p class="date-unavailable">Cette journée est marquée comme indisponible.</p>';
        document.getElementById('add-time-slot-btn').disabled = true;
        document.getElementById('clear-time-slots-btn').disabled = true;
        return;
    }
    
    document.getElementById('add-time-slot-btn').disabled = false;
    document.getElementById('clear-time-slots-btn').disabled = false;
    
    // Afficher les créneaux existants
    const slots = availabilityData[dateKey].slots || [];
    
    if (slots.length === 0) {
        slotsContainer.innerHTML = '<p class="no-slots">Aucun créneau horaire défini pour cette date.</p>';
    } else {
        const slotsList = document.createElement('div');
        slotsList.className = 'time-slots-list';
        
        slots.forEach((slot, index) => {
            const slotItem = document.createElement('div');
            slotItem.className = 'time-slot-item';
            
            slotItem.innerHTML = `
                <span class="slot-time">${slot.start} - ${slot.end}</span>
                <button class="btn-icon remove-slot" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            slotsList.appendChild(slotItem);
        });
        
        slotsContainer.appendChild(slotsList);
        
        // Ajouter les écouteurs pour les boutons de suppression
        document.querySelectorAll('.remove-slot').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                removeTimeSlot(selectedDate, index);
            });
        });
    }
}

// Fonction pour initialiser les disponibilités récurrentes
function initRecurringAvailability() {
    // Initialiser les toggles pour chaque jour
    const dayToggles = document.querySelectorAll('.day-toggle');
    
    dayToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const day = this.id.split('-')[0]; // monday, tuesday, etc.
            const slotsContainer = document.getElementById(`${day}-slots`);
            
            if (this.checked) {
                slotsContainer.style.display = 'block';
            } else {
                slotsContainer.style.display = 'none';
            }
        });
        
        // Déclencher l'événement pour initialiser l'état
        toggle.dispatchEvent(new Event('change'));
    });
    
    // Ajouter des écouteurs pour les boutons d'ajout de créneau
    document.querySelectorAll('.btn-add-slot').forEach(button => {
        button.addEventListener('click', function() {
            const dayContainer = this.closest('.day-time-slots');
            const slotRow = document.createElement('div');
            slotRow.className = 'time-slot-row';
            
            slotRow.innerHTML = `
                <input type="time" class="form-input time-start" value="09:00">
                <span>à</span>
                <input type="time" class="form-input time-end" value="18:00">
                <button class="btn-icon remove-slot"><i class="fas fa-times"></i></button>
            `;
            
            // Insérer avant le bouton d'ajout
            dayContainer.insertBefore(slotRow, this);
            
            // Ajouter l'écouteur pour le bouton de suppression
            slotRow.querySelector('.remove-slot').addEventListener('click', function() {
                slotRow.remove();
            });
        });
    });
    
    // Ajouter des écouteurs pour les boutons de suppression existants
    document.querySelectorAll('.time-slot-row .remove-slot').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.time-slot-row').remove();
        });
    });
    
    // Bouton pour appliquer les disponibilités récurrentes
    document.getElementById('apply-recurring-btn').addEventListener('click', applyRecurringAvailability);
}

// Fonction pour appliquer les disponibilités récurrentes
function applyRecurringAvailability() {
    if (!confirm('Êtes-vous sûr de vouloir appliquer ces horaires à toutes les dates futures ? Les disponibilités existantes seront remplacées.')) {
        return;
    }
    
    // Récupérer les disponibilités récurrentes pour chaque jour
    const recurringAvailability = {
        0: getRecurringForDay('sunday'), // Dimanche
        1: getRecurringForDay('monday'), // Lundi
        2: getRecurringForDay('tuesday'), // Mardi
        3: getRecurringForDay('wednesday'), // Mercredi
        4: getRecurringForDay('thursday'), // Jeudi
        5: getRecurringForDay('friday'), // Vendredi
        6: getRecurringForDay('saturday') // Samedi
    };
    
    // Appliquer ces disponibilités aux 6 prochains mois
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);
    
    for (let d = new Date(today); d <= sixMonthsLater; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dateKey = formatDateKey(d);
        
        // Vérifier si ce jour de la semaine a des disponibilités récurrentes
        if (recurringAvailability[dayOfWeek].available) {
            // Ne pas écraser les rendez-vous existants
            const hasExistingAppointments = checkExistingAppointments(d);
            
            if (!hasExistingAppointments) {
                availabilityData[dateKey] = {
                    available: true,
                    slots: [...recurringAvailability[dayOfWeek].slots]
                };
            }
        } else {
            // Marquer comme indisponible sauf s'il y a des rendez-vous existants
            const hasExistingAppointments = checkExistingAppointments(d);
            
            if (!hasExistingAppointments) {
                availabilityData[dateKey] = {
                    available: false,
                    slots: []
                };
            }
        }
    }
    
    // Mettre à jour le calendrier
    updateAvailabilityCalendar(currentAvailabilityMonth);
    
    // Mettre à jour l'interface des créneaux horaires si une date est sélectionnée
    if (selectedDate) {
        updateTimeSlotsUI(selectedDate);
    }
    
    alert('Les disponibilités récurrentes ont été appliquées avec succès !');
}

// Fonction pour récupérer les disponibilités récurrentes pour un jour
function getRecurringForDay(day) {
    const isAvailable = document.getElementById(`${day}-toggle`).checked;
    const slots = [];
    
    if (isAvailable) {
        const slotRows = document.querySelectorAll(`#${day}-slots .time-slot-row`);
        
        slotRows.forEach(row => {
            const startTime = row.querySelector('.time-start').value;
            const endTime = row.querySelector('.time-end').value;
            
            if (startTime && endTime && startTime < endTime) {
                slots.push({
                    start: startTime,
                    end: endTime
                });
            }
        });
    }
    
    return {
        available: isAvailable,
        slots: slots
    };
}

// Fonction pour vérifier s'il y a des rendez-vous existants à une date
function checkExistingAppointments(date) {
    // Cette fonction devrait vérifier s'il y a des rendez-vous pour cette date
    // Pour l'instant, nous utilisons une implémentation simplifiée
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    const dateStr = date.toISOString().split('T')[0];
    
    return reservations.some(res => {
        const resDate = new Date(res.dateTime);
        return resDate.toISOString().split('T')[0] === dateStr && res.status !== 'cancelled';
    });
}

// Fonction pour formater une date en clé pour l'objet availabilityData
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

// Fonction pour charger les disponibilités existantes
function loadAvailabilityData() {
    availabilityData = JSON.parse(localStorage.getItem('availability')) || {};
}

// Fonction pour sauvegarder les disponibilités
function saveAvailabilityData() {
    localStorage.setItem('availability', JSON.stringify(availabilityData));
    alert('Vos disponibilités ont été enregistrées avec succès !');
}

// Fonction pour obtenir les disponibilités pour une date
function getAvailabilityForDate(date) {
    const dateKey = formatDateKey(date);
    return availabilityData[dateKey];
}

// Fonction pour vérifier si une date est disponible
function isDateAvailable(date) {
    const dateAvailability = getAvailabilityForDate(date);
    return dateAvailability && dateAvailability.available;
}

// Fonction pour obtenir les créneaux disponibles pour une date
function getAvailableSlotsForDate(date) {
    const dateAvailability = getAvailabilityForDate(date);
    return (dateAvailability && dateAvailability.available) ? dateAvailability.slots : [];
}

// Exposer certaines fonctions globalement pour une utilisation dans d'autres fichiers
window.availabilityManager = {
    isDateAvailable,
    getAvailableSlotsForDate
};