// Gestion des disponibilités côté client

// Vérifier les disponibilités lorsque l'utilisateur sélectionne une date
function initAvailabilityCheck() {
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    
    if (dateInput) {
        // Ajouter un écouteur d'événement pour le changement de date
        dateInput.addEventListener('change', function() {
            const selectedDate = this.value;
            if (selectedDate) {
                updateAvailableTimeSlots(selectedDate);
            }
        });
        
        // Vérifier dès le début si une date est déjà sélectionnée
        if (dateInput.value) {
            updateAvailableTimeSlots(dateInput.value);
        }
    }
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
        const dateDisplay = document.getElementById('date-display');
        if (dateDisplay) {
            dateDisplay.parentNode.insertBefore(messageElement, dateDisplay.nextSibling);
        } else {
            const dateInput = document.getElementById('date-input');
            dateInput.parentNode.appendChild(messageElement);
        }
    }
    
    // Mettre à jour le message
    messageElement.innerHTML = `<i class="fas ${isAvailable ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    messageElement.style.color = isAvailable ? '#4CAF50' : '#F44336';
}

// Vérifier si la date et l'heure sélectionnées sont disponibles avant de soumettre
function validateAvailabilityBeforeSubmit(event) {
    // Vérifier si le module de disponibilité est chargé
    const availabilityModule = getAvailabilityModule();
    if (!availabilityModule) {
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
    if (!availabilityModule.isDateAvailable(dateString)) {
        alert("Cette date n'est pas disponible pour les réservations. Veuillez choisir une autre date.");
        event.preventDefault();
        return false;
    }
    
    // Vérifier si l'heure est disponible
    const availableHours = availabilityModule.getAvailableHours(dateString);
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

// Récupérer le module de disponibilité (en utilisant StorageService en priorité)
function getAvailabilityModule() {
    // Vérifier d'abord dans le stockage local directement
    try {
        // Vérifier si nous avons des données dans localStorage
        const storedData = localStorage.getItem('fchairs_availabilities');
        if (storedData) {
            console.log("Données de disponibilité trouvées dans localStorage:", storedData);
            const availabilities = JSON.parse(storedData);
            
            return {
                isDateAvailable: function(dateString) {
                    return availabilities[dateString] && availabilities[dateString].length > 0;
                },
                getAvailableHours: function(dateString) {
                    return availabilities[dateString] || [];
                }
            };
        }
    } catch (error) {
        console.error("Erreur lors de l'accès aux disponibilités:", error);
    }
    
    // Utiliser StorageService s'il est disponible
    if (window.StorageService) {
        console.log("Utilisation de StorageService pour les disponibilités");
        return {
            isDateAvailable: function(dateString) {
                return window.StorageService.isDateAvailable(dateString);
            },
            getAvailableHours: function(dateString) {
                return window.StorageService.getAvailableHours(dateString);
            }
        };
    }
    
    // Sinon, utiliser le module de disponibilité global s'il existe
    if (window.availabilityModule) {
        console.log("Utilisation du module availabilityModule global");
        return window.availabilityModule;
    }
    
    // Fallback: créer un module de base
    console.log("Aucun module de disponibilité trouvé, utilisation du fallback");
    return {
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

// Mettre à jour les créneaux horaires disponibles
function updateAvailableTimeSlots(dateString) {
    // Récupérer le module de disponibilité
    const availabilityModule = getAvailabilityModule();
    if (!availabilityModule) {
        console.error("Module de disponibilité non trouvé");
        return;
    }
    
    const timeSelect = document.getElementById('time-select');
    if (!timeSelect) return;
    
    // Réinitialiser le select
    while (timeSelect.options.length > 1) {
        timeSelect.remove(1);
    }
    
    // Formater la date en français pour les messages
    const date = new Date(dateString);
    const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const jourSemaine = joursSemaine[date.getDay()];
    const jour = date.getDate();
    const nomMois = mois[date.getMonth()];
    
    const dateFrancais = `${jourSemaine} ${jour} ${nomMois}`;
    
    // Vérifier si la date est disponible
    if (!availabilityModule.isDateAvailable(dateString)) {
        // Afficher un message d'erreur
        displayAvailabilityMessage(false, `${dateFrancais} n'est pas disponible pour les réservations. Veuillez choisir une autre date.`);
        
        // Désactiver le select
        timeSelect.disabled = true;
        return;
    }
    
    // Récupérer les heures disponibles
    const availableHours = availabilityModule.getAvailableHours(dateString);
    
    if (availableHours.length === 0) {
        // Afficher un message d'erreur
        displayAvailabilityMessage(false, `Aucun créneau disponible pour ${dateFrancais}. Veuillez choisir une autre date.`);
        
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
        option.classList.add('slot-appear');
        timeSelect.appendChild(option);
        setTimeout(() => option.classList.add('slot-appear-active'), 10);
    });
    
    // Afficher un message positif
    displayAvailabilityMessage(true, `${availableHours.length} créneaux disponibles pour ${dateFrancais}.`);
}

// Fonction pour créer un sélecteur de date plus convivial avec dates en français
function enhanceDatePicker() {
    const dateInput = document.getElementById('date-input');
    if (!dateInput) return;

    // Ajouter un attribut data-date pour stocker la valeur réelle
    dateInput.setAttribute('data-date', dateInput.value || '');
    
    // Créer un champ d'affichage pour la date en français
    const dateDisplay = document.createElement('div');
    dateDisplay.id = 'date-display';
    dateDisplay.className = 'date-display';
    dateDisplay.textContent = dateInput.value ? formatDateToFrench(dateInput.value) : 'Cliquez pour choisir une date';
    
    // Insérer l'affichage avant l'input
    dateInput.parentNode.insertBefore(dateDisplay, dateInput);
    
    // Cacher l'input d'origine mais le garder accessible pour la soumission du formulaire
    dateInput.style.display = 'none';
    
    // Créer un calendrier simplifié pour sélectionner les dates
    const calendar = document.createElement('div');
    calendar.id = 'date-picker-calendar';
    calendar.className = 'date-picker-calendar';
    calendar.style.display = 'none';
    
    // Ajouter le calendrier après l'affichage
    dateDisplay.parentNode.insertBefore(calendar, dateDisplay.nextSibling);
    
    // Ouvrir/fermer le calendrier au clic sur l'affichage
    dateDisplay.addEventListener('click', function() {
        if (calendar.style.display === 'none') {
            generateCalendar(calendar);
            calendar.style.display = 'block';
        } else {
            calendar.style.display = 'none';
        }
    });
    
    // Fermer le calendrier si on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!dateDisplay.contains(e.target) && !calendar.contains(e.target)) {
            calendar.style.display = 'none';
        }
    });
}

// Modifiez cette partie du code dans client-availability.js
// Générer le calendrier pour le sélecteur de date
function generateCalendar(calendarElement) {
    // Récupérer la date actuelle ou la date sélectionnée
    const dateInput = document.getElementById('date-input');
    const selectedDate = dateInput.getAttribute('data-date') ? new Date(dateInput.getAttribute('data-date')) : new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    // Noms des mois et jours en français
    const moisFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const joursFr = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
    
    // Créer l'en-tête du calendrier
    let calendarHTML = `
        <div class="calendar-header">
            <button class="calendar-nav" id="prev-month">&lt;</button>
            <div class="calendar-title">${moisFr[currentMonth]} ${currentYear}</div>
            <button class="calendar-nav" id="next-month">&gt;</button>
        </div>
        <div class="calendar-weekdays">
    `;
    
    // Ajouter les noms des jours
    joursFr.forEach(jour => {
        calendarHTML += `<div class="calendar-weekday">${jour}</div>`;
    });
    
    calendarHTML += `</div><div class="calendar-days">`;
    
    // Premier jour du mois
    const firstDay = new Date(currentYear, currentMonth, 1);
    let startingDay = firstDay.getDay(); // 0 (Dimanche) à 6 (Samedi)
    startingDay = startingDay === 0 ? 6 : startingDay - 1; // Ajuster pour commencer par Lundi
    
    // Dernier jour du mois
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Obtenir la date d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Obtenir le module de disponibilité
    const availabilityModule = getAvailabilityModule();
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        calendarHTML += `<div class="calendar-day past">${prevMonthLastDay - i}</div>`;
    }
    
    // Jours du mois courant
    for (let i = 1; i <= lastDay; i++) {
        const date = new Date(currentYear, currentMonth, i);
        date.setHours(0, 0, 0, 0);
        
        const dateString = formatDateString(date);
        
        let classes = 'calendar-day';
        if (date < today) {
            classes += ' past';
        } else {
            // Vérifier si la date est disponible
            if (availabilityModule && availabilityModule.isDateAvailable) {
                if (availabilityModule.isDateAvailable(dateString)) {
                    classes += ' available';
                }
            }
            
            // Vérifier si c'est la date sélectionnée
            if (dateInput.getAttribute('data-date') === dateString) {
                classes += ' selected';
            }
        }
        
        if (date.getTime() === today.getTime()) {
            classes += ' today';
        }
        
        calendarHTML += `<div class="${classes}" data-date="${dateString}">${i}</div>`;
    }
    
    // Jours du mois suivant
    const daysAfterLastDay = 7 - ((lastDay + startingDay) % 7);
    if (daysAfterLastDay < 7) {
        for (let i = 1; i <= daysAfterLastDay; i++) {
            calendarHTML += `<div class="calendar-day past">${i}</div>`;
        }
    }
    
    calendarHTML += `</div>`;
    
    // Mettre à jour le contenu du calendrier
    calendarElement.innerHTML = calendarHTML;
    
    // Ajouter les écouteurs d'événements pour la navigation
    document.getElementById('prev-month').addEventListener('click', function(e) {
        e.stopPropagation();
        navigateCalendar(calendarElement, currentMonth - 1, currentYear);
    });
    
    document.getElementById('next-month').addEventListener('click', function(e) {
        e.stopPropagation();
        navigateCalendar(calendarElement, currentMonth + 1, currentYear);
    });
    
    // Ajouter les écouteurs d'événements pour les jours
    document.querySelectorAll('.calendar-day:not(.past)').forEach(day => {
        day.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const dateString = day.getAttribute('data-date');
            if (!dateString) return;
            
            // Mettre à jour l'input et l'affichage
            dateInput.value = dateString;
            dateInput.setAttribute('data-date', dateString);
            document.getElementById('date-display').textContent = formatDateToFrench(dateString);
            
            // Masquer le calendrier
            calendarElement.style.display = 'none';
            
            // CORRECTION ICI: Forcer la mise à jour des créneaux disponibles
            updateAvailableTimeSlots(dateString);
        });
    });
}

// Naviguer dans le calendrier
function navigateCalendar(calendarElement, month, year) {
    if (month < 0) {
        month = 11;
        year--;
    } else if (month > 11) {
        month = 0;
        year++;
    }
    
    // Mettre à jour la date de référence pour le calendrier
    const dateInput = document.getElementById('date-input');
    let currentDate = dateInput.getAttribute('data-date') ? new Date(dateInput.getAttribute('data-date')) : new Date();
    currentDate.setMonth(month);
    currentDate.setFullYear(year);
    
    // Régénérer le calendrier
    generateCalendar(calendarElement);
}

// Formater une date au format YYYY-MM-DD
function formatDateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Formater une date en français
function formatDateToFrench(dateString) {
    const date = new Date(dateString);
    const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const jourSemaine = joursSemaine[date.getDay()];
    const jour = date.getDate();
    const nomMois = mois[date.getMonth()];
    const annee = date.getFullYear();
    
    return `${jourSemaine} ${jour} ${nomMois} ${annee}`;
}

// Modifier l'initialisation pour inclure l'amélioration du sélecteur de date
function initClientAvailability() {
    // Vérifier si nous sommes sur la page de réservation
    const reservationForm = document.getElementById('reservation-form');
    if (!reservationForm) return;
    
    // Obtenir les éléments du formulaire
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    
    if (!dateInput || !timeInput) return;
    
    // Améliorer le sélecteur de date
    enhanceDatePicker();
    
    // Convertir l'input time en select pour les créneaux spécifiques
    convertTimeInputToSelect();
    
    // Si une date est déjà sélectionnée, mettre à jour les créneaux
    if (dateInput.value) {
        updateAvailableTimeSlots(dateInput.value);
    }
    
    // Ajouter la validation au formulaire
    reservationForm.addEventListener('submit', validateAvailabilityBeforeSubmit);
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', initClientAvailability);