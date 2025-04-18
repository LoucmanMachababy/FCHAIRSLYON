// Système de gestion des disponibilités pour FcHairsLyon
// Ce fichier permet à l'administrateur de définir les créneaux disponibles pour les réservations

// Structure des disponibilités:
// {
//   "2025-04-20": [
//      "09:00", "10:00", "11:00", ... // Heures disponibles
//   ]
// }

// Variables globales
let selectedDate = null;
let availableHours = [];

// Initialiser le module de disponibilités
function initAvailabilityModule() {
    console.log("Initialisation du module de disponibilités");
    
    // Créer la section de disponibilités
    createAvailabilitySection();
    
    // Ajouter un élément au menu
    addAvailabilityMenuItem();
    
    // Initialiser le calendrier
    initAvailabilityCalendar();
    
    // Initialiser les écouteurs d'événements
    initAvailabilityEvents();
}

// Créer la section de gestion des disponibilités
function createAvailabilitySection() {
    const contentSection = document.createElement('section');
    contentSection.id = 'availability';
    contentSection.className = 'content-section';
    
    contentSection.innerHTML = `
        <div class="header">
            <h1 class="page-title">Gestion des Disponibilités</h1>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Calendrier des disponibilités</h2>
            </div>
            
            <p class="description">
                Sélectionnez une date dans le calendrier pour définir vos heures de disponibilité.
                Les jours avec des créneaux disponibles sont marqués en vert.
            </p>
            
            <div class="availability-container">
                <div class="availability-calendar">
                    <div class="calendar-header">
                        <h3 class="calendar-title" id="availability-month-year">Avril 2025</h3>
                        <div class="calendar-navigation">
                            <button class="calendar-nav-btn" id="availability-prev-month"><i class="fas fa-chevron-left"></i></button>
                            <button class="calendar-nav-btn" id="availability-next-month"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                    
                    <div class="calendar-weekdays">
                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mer</div>
                        <div>Jeu</div>
                        <div>Ven</div>
                        <div>Sam</div>
                        <div>Dim</div>
                    </div>
                    
                    <div class="calendar-days" id="availability-calendar-days">
                        <!-- Les jours du calendrier seront générés dynamiquement -->
                    </div>
                </div>
                
                <div class="time-slots-container">
                    <div id="no-date-selected" class="no-date-selected">
                        Sélectionnez une date sur le calendrier pour gérer les heures disponibles
                    </div>
                    
                    <div id="selected-date-info" style="display: none;">
                        <h3 id="selected-date-display">Date sélectionnée: </h3>
                        
                        <div class="form-group">
                            <label class="form-label">Heures disponibles:</label>
                            <div id="hours-container" class="hours-grid">
                                <!-- Les heures seront générées ici -->
                            </div>
                        </div>
                        
                        <button id="save-availability" class="btn btn-success">
                            <i class="fas fa-save"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter la section au contenu
    document.querySelector('.content').appendChild(contentSection);
}

// Ajouter un élément de menu pour les disponibilités
function addAvailabilityMenuItem() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        const availabilityMenuItem = document.createElement('a');
        availabilityMenuItem.href = '#availability';
        availabilityMenuItem.className = 'menu-item';
        availabilityMenuItem.dataset.section = 'availability';
        availabilityMenuItem.innerHTML = '<i class="fas fa-clock"></i> Disponibilités';
        
        // Insérer avant le bouton de déconnexion
        logoutBtn.parentNode.insertBefore(availabilityMenuItem, logoutBtn);
        
        // Ajouter l'écouteur d'événement pour la navigation
        availabilityMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Mettre à jour les classes active
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher la section correspondante
            document.querySelectorAll('.content-section').forEach(cs => {
                cs.classList.remove('active');
                if (cs.id === 'availability') {
                    cs.classList.add('active');
                }
            });
        });
    }
}

// Initialiser le calendrier
function initAvailabilityCalendar() {
    const calendarDays = document.getElementById('availability-calendar-days');
    
    if (calendarDays) {
        const now = new Date();
        generateAvailabilityCalendar(now.getMonth(), now.getFullYear());
        
        // Écouteurs pour les boutons de navigation
        document.getElementById('availability-prev-month').addEventListener('click', () => {
            const monthTitle = document.getElementById('availability-month-year').textContent;
            const [month, year] = monthTitle.split(' ');
            
            const monthIndex = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
            ].indexOf(month);
            
            const prevMonthIndex = monthIndex - 1;
            const prevYear = parseInt(year);
            
            if (prevMonthIndex < 0) {
                generateAvailabilityCalendar(11, prevYear - 1);
            } else {
                generateAvailabilityCalendar(prevMonthIndex, prevYear);
            }
        });
        
        document.getElementById('availability-next-month').addEventListener('click', () => {
            const monthTitle = document.getElementById('availability-month-year').textContent;
            const [month, year] = monthTitle.split(' ');
            
            const monthIndex = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
            ].indexOf(month);
            
            const nextMonthIndex = monthIndex + 1;
            const nextYear = parseInt(year);
            
            if (nextMonthIndex > 11) {
                generateAvailabilityCalendar(0, nextYear + 1);
            } else {
                generateAvailabilityCalendar(nextMonthIndex, nextYear);
            }
        });
    }
}

// Générer le calendrier pour un mois donné
function generateAvailabilityCalendar(month, year) {
    const calendarDays = document.getElementById('availability-calendar-days');
    calendarDays.innerHTML = '';
    
    // Nom du mois et année
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    document.getElementById('availability-month-year').textContent = `${monthNames[month]} ${year}`;
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, etc.)
    let dayOfWeek = firstDay.getDay();
    // Ajuster pour que la semaine commence le lundi
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Récupérer les disponibilités
    const availabilities = getAvailabilities();
    
    // Jours du mois précédent
    if (dayOfWeek > 0) {
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = dayOfWeek - 1; i >= 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day past';
            dayDiv.textContent = prevMonthLastDay - i;
            calendarDays.appendChild(dayDiv);
        }
    }
    
    // Jours du mois actuel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const currentDate = new Date(year, month, i);
        currentDate.setHours(0, 0, 0, 0);
        
        const dateString = formatDateString(currentDate);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.dataset.date = dateString;
        
        // Jour actuel
        if (currentDate.getTime() === today.getTime()) {
            dayDiv.classList.add('today');
        }
        
        // Jours passés
        if (currentDate < today) {
            dayDiv.classList.add('past');
        } else {
            // Vérifier si le jour a des créneaux disponibles
            if (availabilities[dateString] && availabilities[dateString].length > 0) {
                dayDiv.classList.add('available');
            }
            
            // Ajouter l'événement de clic
            dayDiv.addEventListener('click', function() {
                selectAvailabilityDate(dateString);
            });
        }
        
        dayDiv.textContent = i;
        calendarDays.appendChild(dayDiv);
    }
    
    // Jours du mois suivant
    const totalDays = dayOfWeek + lastDay.getDate();
    const remainingCells = 42 - totalDays; // 6 semaines * 7 jours = 42
    
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day past';
        dayDiv.textContent = i;
        calendarDays.appendChild(dayDiv);
    }
}

// Sélectionner une date
function selectAvailabilityDate(dateString) {
    // Mettre à jour la sélection visuelle
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
        if (day.dataset.date === dateString) {
            day.classList.add('selected');
        }
    });
    
    // Mettre à jour la date sélectionnée
    selectedDate = dateString;
    
    // Formater la date pour l'affichage en français
    const date = new Date(dateString);
    const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const jourSemaine = joursSemaine[date.getDay()];
    const jour = date.getDate();
    const nomMois = mois[date.getMonth()];
    const annee = date.getFullYear();
    
    const formattedDate = `${jourSemaine} ${jour} ${nomMois} ${annee}`;
    document.getElementById('selected-date-display').textContent = `Date sélectionnée: ${formattedDate}`;
    
    // Cacher le message et afficher l'interface de gestion
    document.getElementById('no-date-selected').style.display = 'none';
    document.getElementById('selected-date-info').style.display = 'block';
    
    // Charger les heures disponibles pour cette date
    loadAvailableHours(dateString);
}

// Charger les heures disponibles pour une date
function loadAvailableHours(dateString) {
    const availabilities = getAvailabilities();
    availableHours = availabilities[dateString] || [];
    
    // Générer la grille d'heures
    generateHoursGrid();
}

// Générer la grille des heures
function generateHoursGrid() {
    const hoursContainer = document.getElementById('hours-container');
    hoursContainer.innerHTML = '';
    
    // Heures standards (9h-19h)
    const startHour = 9;
    const endHour = 19;
    
    for (let hour = startHour; hour < endHour; hour++) {
        // Pour chaque heure, créer les 2 créneaux de 30 minutes
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Formater pour affichage en français
            const formattedHour = `${hour}h${minute > 0 ? minute : ''}`;
            
            // Vérifier si cette heure est disponible
            const isAvailable = availableHours.includes(timeString);
            
            const hourDiv = document.createElement('div');
            hourDiv.className = 'hour-item';
            hourDiv.innerHTML = `
                <label class="hour-label">
                    <input type="checkbox" class="hour-checkbox" value="${timeString}" ${isAvailable ? 'checked' : ''}>
                    <span>${formattedHour}</span>
                </label>
            `;
            
            // Ajouter l'écouteur d'événement pour le changement
            hourDiv.querySelector('.hour-checkbox').addEventListener('change', function() {
                updateAvailableHours();
            });
            
            hoursContainer.appendChild(hourDiv);
        }
    }
}

// Mettre à jour la liste des heures disponibles
function updateAvailableHours() {
    availableHours = [];
    
    // Récupérer toutes les heures cochées
    document.querySelectorAll('.hour-checkbox:checked').forEach(checkbox => {
        availableHours.push(checkbox.value);
    });
    
    // Trier les heures
    availableHours.sort();
}

// Sauvegarder les disponibilités
function saveAvailability() {
    if (!selectedDate) {
        alert('Veuillez d\'abord sélectionner une date.');
        return;
    }
    
    // Mettre à jour la liste des heures
    updateAvailableHours();
    
    // Récupérer les disponibilités existantes
    const availabilities = getAvailabilities();
    
    // Mettre à jour les disponibilités pour la date sélectionnée
    availabilities[selectedDate] = availableHours;
    
    // Sauvegarder
    setAvailabilities(availabilities);
    
    // Mettre à jour l'affichage du calendrier
    const dayElement = document.querySelector(`.calendar-day[data-date="${selectedDate}"]`);
    if (dayElement) {
        if (availableHours.length > 0) {
            dayElement.classList.add('available');
        } else {
            dayElement.classList.remove('available');
        }
    }
    
    alert('Disponibilités enregistrées avec succès.');
}

// Initialiser les écouteurs d'événements
function initAvailabilityEvents() {
    // Écouteur pour le bouton de sauvegarde
    const saveBtn = document.getElementById('save-availability');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAvailability);
    }
}

// Fonction utilitaire: formater une date en chaîne YYYY-MM-DD
function formatDateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// MODIFICATIONS ICI : Utilisation des méthodes de StorageService
function setAvailabilities(availabilities) {
    try {
        // Utiliser StorageService pour la cohérence
        if (window.StorageService) {
            return window.StorageService.setAvailabilities(availabilities);
        } else {
            // Fallback si StorageService n'est pas disponible
            localStorage.setItem('fchairs_availabilities', JSON.stringify(availabilities));
            console.log("Disponibilités enregistrées:", availabilities);
            return true;
        }
    } catch (error) {
        console.error("Erreur lors de l'enregistrement des disponibilités:", error);
        return false;
    }
}

function getAvailabilities() {
    try {
        // Utiliser StorageService pour la cohérence
        if (window.StorageService) {
            return window.StorageService.getAvailabilities();
        } else {
            // Fallback si StorageService n'est pas disponible
            return JSON.parse(localStorage.getItem('fchairs_availabilities') || '{}');
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des disponibilités:", error);
        return {};
    }
}

// Fonctions pour l'interface client
// Vérifier si une date est disponible
function isDateAvailable(dateString) {
    const availabilities = getAvailabilities();
    return availabilities[dateString] && availabilities[dateString].length > 0;
}

// Obtenir les heures disponibles pour une date
function getAvailableHours(dateString) {
    const availabilities = getAvailabilities();
    return availabilities[dateString] || [];
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Ne l'initialiser que si nous sommes sur la page d'administration
    if (document.getElementById('logout-btn')) {
        initAvailabilityModule();
    }
});

// Exporter les fonctions pour les rendre disponibles globalement
window.availabilityModule = {
    isDateAvailable,
    getAvailableHours
};

// Gestion des disponibilités côté client

// Initialiser le module de disponibilités
function initClientAvailability() {
    // Vérifier si nous sommes sur la page de réservation
    const reservationForm = document.getElementById('reservation-form');
    if (!reservationForm) return;
    
    // Obtenir les éléments du formulaire
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    
    if (!dateInput || !timeInput) return;
    
    // Convertir l'input time en select pour les créneaux spécifiques
    convertTimeInputToSelect();
    
    // Ajouter écouteur pour le changement de date
    dateInput.addEventListener('change', function() {
        updateAvailableTimeSlots(this.value);
    });
    
    // Définir la date minimale à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Si une date est déjà sélectionnée, mettre à jour les créneaux
    if (dateInput.value) {
        updateAvailableTimeSlots(dateInput.value);
    }
    
    // Ajouter la validation au formulaire
    reservationForm.addEventListener('submit', validateAvailabilityBeforeSubmit);
}

// Convertir l'input time en select pour les créneaux spécifiques
function convertTimeInputToSelect() {
    const timeInput = document.getElementById('time-input');
    if (!timeInput) return;
    
    // Créer un élément select pour remplacer l'input time
    const timeSelect = document.createElement('select');
    timeSelect.id = 'time-select';
    timeSelect.className = 'form-select';
    timeSelect.required = true;
    
    // Ajouter une option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = 'Choisissez un créneau';
    timeSelect.appendChild(defaultOption);
    
    // Remplacer l'input time par le select
    timeInput.parentNode.replaceChild(timeSelect, timeInput);
}

// Mettre à jour les créneaux horaires disponibles
function updateAvailableTimeSlots(dateString) {
    // Vérifier si le module de disponibilité est chargé
    if (!window.availabilityModule) {
        console.error("Module de disponibilité non trouvé");
        return;
    }
    
    const timeSelect = document.getElementById('time-select');
    if (!timeSelect) return;
    
    // Réinitialiser le select
    while (timeSelect.options.length > 1) {
        timeSelect.remove(1);
    }
    
    // Vérifier si la date est disponible
    if (!window.availabilityModule.isDateAvailable(dateString)) {
        // Afficher un message d'erreur
        displayAvailabilityMessage(false, "Cette date n'est pas disponible pour les réservations. Veuillez choisir une autre date.");
        
        // Désactiver le select
        timeSelect.disabled = true;
        return;
    }
    
    // Récupérer les heures disponibles
    const availableHours = window.availabilityModule.getAvailableHours(dateString);
    
    if (availableHours.length === 0) {
        // Afficher un message d'erreur
        displayAvailabilityMessage(false, "Aucun créneau disponible pour cette date. Veuillez choisir une autre date.");
        
        // Désactiver le select
        timeSelect.disabled = true;
        return;
    }
    
    // Activer le select
    timeSelect.disabled = false;
    
    // Ajouter les options pour chaque heure disponible
    availableHours.forEach(hour => {
        const option = document.createElement('option');
        option.value = hour;
        
        // Formater l'heure en français (ex: 14:30 devient 14h30)
        const [h, m] = hour.split(':');
        const formattedHour = `${parseInt(h)}h${m === '00' ? '' : m}`;
        
        option.textContent = formattedHour;
        timeSelect.appendChild(option);
    });
    
    // Afficher un message positif
    displayAvailabilityMessage(true, `${availableHours.length} créneaux disponibles pour cette date.`);
}

// Afficher un message concernant les disponibilités
function displayAvailabilityMessage(isAvailable, message) {
    // Vérifier si un élément de message existe déjà
    let messageElement = document.getElementById('availability-message');
    
    // Créer l'élément s'il n'existe pas
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'availability-message';
        messageElement.className = 'date-info';
        
        // Insérer après le champ de date
        const dateInput = document.getElementById('date-input');
        dateInput.parentNode.appendChild(messageElement);
    }
    
    // Mettre à jour le message
    messageElement.innerHTML = `<i class="fas ${isAvailable ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    messageElement.style.color = isAvailable ? '#4CAF50' : '#F44336';
}

// Valider les disponibilités avant soumission du formulaire
function validateAvailabilityBeforeSubmit(event) {
    // Vérifier si le module de disponibilité est chargé
    if (!window.availabilityModule) {
        return true;
    }
    
    const dateInput = document.getElementById('date-input');
    const timeSelect = document.getElementById('time-select');
    
    if (!dateInput || !timeSelect) {
        return true;
    }
    
    const dateString = dateInput.value;
    const timeString = timeSelect.value;
    
    if (!dateString || !timeString) {
        return true; // La validation HTML standard s'en chargera
    }
    
    // Vérifier si la date est disponible
    if (!window.availabilityModule.isDateAvailable(dateString)) {
        alert("Cette date n'est pas disponible pour les réservations. Veuillez choisir une autre date.");
        event.preventDefault();
        return false;
    }
    
    // Vérifier si l'heure est disponible
    const availableHours = window.availabilityModule.getAvailableHours(dateString);
    if (!availableHours.includes(timeString)) {
        alert("Ce créneau horaire n'est pas disponible. Veuillez choisir un autre créneau.");
        event.preventDefault();
        return false;
    }
    
    // Créer un champ caché avec la date et l'heure combinées (pour compatibilité avec le script existant)
    const hiddenDateTimeInput = document.createElement('input');
    hiddenDateTimeInput.type = 'hidden';
    hiddenDateTimeInput.name = 'dateTime';
    hiddenDateTimeInput.value = `${dateString}T${timeString}`;
    event.target.appendChild(hiddenDateTimeInput);
    
    return true;
}

// Fallback si le module admin n'est pas disponible
if (!window.availabilityModule) {
    window.availabilityModule = {
        isDateAvailable: function(dateString) {
            // Par défaut, considérer que les dates futures sont disponibles, sauf dimanche
            const date = new Date(dateString);
            return date > new Date() && date.getDay() !== 0;
        },
        
        getAvailableHours: function(dateString) {
            // Par défaut, créneaux de 9h à 19h avec intervalles de 30min
            const hours = [];
            for (let h = 9; h < 19; h++) {
                hours.push(`${h.toString().padStart(2, '0')}:00`);
                hours.push(`${h.toString().padStart(2, '0')}:30`);
            }
            return hours;
        }
    };
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', initClientAvailability);