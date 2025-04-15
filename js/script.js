// Données des services
const services = {
    femmes: {
        "Braids": { 
            "court": 30, 
            "moyen": 40, 
            "long": 50, 
            "image": "images/BraidFemme.jpeg" 
        },
        "Twist": { 
            "court": 30, 
            "moyen": 40, 
            "long": 50, 
            "image": "images/vanillefemme.jpeg" 
        },
        "Fulani Braids": { 
            "court": 30, 
            "moyen": 40, 
            "long": 45, 
            "image": "images/fbraidsfemme.jpeg" 
        },
        "Invisible Locs": { 
            "moyen": 35, 
            "long": 45, 
            "image": "images/invisiblelocsfemme.jpeg" 
        },
        "Nattes collées simple": { 
            "unique": 15, 
            "image": "images/natteSimpleFemme.jpeg" 
        },
        "Nattes collées avec rajout": { 
            "unique": 20, 
            "image": "images/natteMotifFemme.jpeg" 
        }
    },
    hommes: {
        "Nattes collées simple": { 
            "unique": 10, 
            "image": "images/natteSimpleHomme.png" 
        },
        "Nattes collées avec modèle": { 
            "unique": 15, 
            "image": "images/nattehommemotif.jpeg" 
        },
        "Vanilles": { 
            "unique": 15, 
            "image": "images/vanilleMan.png" 
        },
        "Fulani": { 
            "unique": 15, 
            "image": "images/fulanihomme.png" 
        },
        "Barrel Twist": { 
            "unique": 25, 
            "image": "images/BARRELMANLOCKSER.jpeg" 
        },
        "Départ de locks": { 
            "unique": 30, 
            "image": "images/Barrel man 2.jpeg" 
        },
        "Retwist": { 
            "unique": 30, 
            "image": "images/DepartLocks.png" 
        }
    }
};

// Éléments DOM
const femmesServicesContainer = document.getElementById('femmes-services');
const hommesServicesContainer = document.getElementById('hommes-services');
const serviceSelect = document.getElementById('service-select');
const modelSelect = document.getElementById('model-select');
const reservationForm = document.getElementById('reservation-form');
const reservationsList = document.getElementById('reservations-list');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationContent = document.getElementById('confirmation-content');
const confirmReservationBtn = document.getElementById('confirm-reservation');
const brushingOption = document.getElementById('brushing-option');
const alertSuccess = document.getElementById('alert-success');
const alertError = document.getElementById('alert-error');

// Variables globales
let currentTab = 'femmes';
let selectedService = null;
let selectedModel = null;
let selectedCategory = 'femmes';
let currentReservation = null;

// Fonctions
function renderServices() {
    // Rendu des services femmes
    femmesServicesContainer.innerHTML = '';
    for (const [name, details] of Object.entries(services.femmes)) {
        const card = createServiceCard(name, details, 'femmes');
        femmesServicesContainer.appendChild(card);
    }
    
    // Rendu des services hommes
    hommesServicesContainer.innerHTML = '';
    for (const [name, details] of Object.entries(services.hommes)) {
        const card = createServiceCard(name, details, 'hommes');
        hommesServicesContainer.appendChild(card);
    }
}

function createServiceCard(name, details, category) {
    const card = document.createElement('div');
    card.className = 'service-card';
    
    // Construction des prix
    let priceHTML = '';
    for (const [model, price] of Object.entries(details)) {
        if (model !== 'image') {
            const displayModel = model === 'unique' ? '' : model;
            priceHTML += `<span class="price-tag">${displayModel} ${price}€</span>`;
        }
    }
    
    card.innerHTML = `
        <img src="${details.image}" alt="${name}" class="service-image">
        <div class="service-info">
            <h3 class="service-title">${name}</h3>
            <div class="service-price">
                ${priceHTML}
            </div>
            <button class="service-select" data-service="${name}" data-category="${category}">Sélectionner</button>
        </div>
    `;
    
    // Événement pour sélectionner ce service
    card.querySelector('.service-select').addEventListener('click', function() {
        selectService(name, category);
        document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
    });
    
    return card;
}

function populateServiceSelect() {
    // Vider les options actuelles
    serviceSelect.innerHTML = '<option value="" disabled selected>Choisissez un service</option>';
    
    // Ajouter tous les services (femmes et hommes)
    for (const category of ['femmes', 'hommes']) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category === 'femmes' ? 'Services Femmes' : 'Services Hommes';
        
        for (const service of Object.keys(services[category])) {
            const option = document.createElement('option');
            option.value = JSON.stringify({ service, category });
            option.textContent = service;
            optgroup.appendChild(option);
        }
        
        serviceSelect.appendChild(optgroup);
    }
}

// Modifier la fonction existante dans script.js
function populateAvailableDates() {
    // Charger les disponibilités définies par l'admin
    const availabilityData = JSON.parse(localStorage.getItem('availability')) || [];
    
    // Filtrer pour n'avoir que les dates futures
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const availableDates = availabilityData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= today && item.available === true;
    });
    
    // Mettre à jour le sélecteur de date dans le formulaire de réservation
    const dateSelect = document.getElementById('date-input');
    
    // Désactiver toutes les dates par défaut
    dateSelect.setAttribute('disabled', 'true');
    
    // Ajouter les dates disponibles
    if (availableDates.length > 0) {
        dateSelect.removeAttribute('disabled');
        
        // Permettre la sélection uniquement des dates disponibles
        dateSelect.addEventListener('input', function(e) {
            const selectedDate = e.target.value;
            if (!availableDates.some(d => d.date === selectedDate)) {
                e.target.value = '';
                alert('Cette date n\'est pas disponible. Veuillez choisir une autre date.');
            } else {
                // Mettre à jour les créneaux horaires disponibles
                updateAvailableTimeSlots(selectedDate);
            }
        });
    } else {
        // Aucune disponibilité définie
        const message = document.createElement('p');
        message.className = 'no-availability';
        message.textContent = 'Aucune disponibilité pour le moment. Veuillez réessayer ultérieurement.';
        dateSelect.parentNode.appendChild(message);
    }
}

function updateModelSelect(service, category) {
    // Vider les options actuelles
    modelSelect.innerHTML = '<option value="" disabled selected>Choisissez un modèle</option>';
    
    if (service) {
        // Ajouter les modèles disponibles pour ce service
        const models = services[category][service];
        for (const [model, price] of Object.entries(models)) {
            if (model !== 'image') {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model === 'unique' ? 'Standard' : 
                                    model.charAt(0).toUpperCase() + model.slice(1) + ` (${price}€)`;
                modelSelect.appendChild(option);
            }
        }
    }
}

function selectService(service, category) {
    selectedService = service;
    selectedCategory = category;
    
    // Mettre à jour le select de service
    const options = serviceSelect.querySelectorAll('option');
    for (const option of options) {
        if (option.value && JSON.parse(option.value).service === service) {
            option.selected = true;
            break;
        }
    }
    
    // Mettre à jour le select de modèle
    updateModelSelect(service, category);
}

function calculatePrice(service, category, model, brushing = false) {
    let price = services[category][service][model];
    if (brushing) {
        price += 5;
    }
    return price;
}

function saveReservation(reservation) {
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    
}

function displayReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    reservationsList.innerHTML = '';
    
    if (reservations.length === 0) {
        reservationsList.innerHTML = '<p>Aucune réservation pour le moment.</p>';
        return;
    }
    
    // Filtrer les réservations pour cet utilisateur (utiliser le téléphone comme identifiant)
    const userPhone = localStorage.getItem('userPhone');
    const userReservations = userPhone 
        ? reservations.filter(res => res.phone === userPhone) 
        : reservations;
    
    if (userReservations.length === 0) {
        reservationsList.innerHTML = '<p>Aucune réservation pour le moment.</p>';
        return;
    }
    
    // Trier par date (les plus récentes en premier)
    userReservations.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
    for (let i = 0; i < userReservations.length; i++) {
        const reservation = userReservations[i];
        const item = document.createElement('div');
        item.className = 'reservation-item';
        
        const formattedDate = new Date(reservation.dateTime).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const formattedTime = new Date(reservation.dateTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let brushingText = reservation.brushing ? ' + Brushing' : '';
        let modelDisplay = reservation.model === 'unique' ? '' : ` (${reservation.model})`;
        
        let statusText = '';
        let statusClass = '';
        
        switch(reservation.status) {
            case 'pending':
                statusText = 'En attente de confirmation';
                statusClass = 'status-pending';
                break;
            case 'confirmed':
                statusText = 'Confirmé';
                statusClass = 'status-confirmed';
                break;
            case 'cancelled':
                statusText = 'Annulé';
                statusClass = 'status-cancelled';
                break;
            default:
                statusText = 'En attente de confirmation';
                statusClass = 'status-pending';
        }
        
        item.innerHTML = `
            <div class="reservation-info">
                <div class="reservation-name">${reservation.service}${modelDisplay}${brushingText}</div>
                <div class="reservation-details">Statut: <span class="status ${statusClass}">${statusText}</span></div>
                <div class="reservation-date">${formattedDate} à ${formattedTime}</div>
            </div>
            <div class="reservation-price">${reservation.totalPrice}€</div>
            <div class="reservation-actions">
                <button class="action-button edit" data-id="${i}"><i class="fas fa-edit"></i></button>
                <button class="action-button delete" data-id="${i}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        
        reservationsList.appendChild(item);
        
        // Ajouter les événements pour les boutons d'action
        item.querySelector('.edit').addEventListener('click', function() {
            editReservation(this.dataset.id);
        });
        
        item.querySelector('.delete').addEventListener('click', function() {
            deleteReservation(this.dataset.id);
        });
    }
}

function editReservation(index) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const userPhone = localStorage.getItem('userPhone');
    
    // Filtrer les réservations pour cet utilisateur
    const userReservations = userPhone 
        ? reservations.filter(res => res.phone === userPhone) 
        : reservations;
    
    const reservation = userReservations[index];
    
    // Trouver l'index réel dans le tableau complet de réservations
    const realIndex = reservations.findIndex(res => 
        res.service === reservation.service && 
        res.dateTime === reservation.dateTime &&
        res.phone === reservation.phone
    );
    
    if (realIndex === -1) {
        showAlert('error', 'Impossible de trouver cette réservation.');
        return;
    }
    
    // Vérifier si la réservation peut être modifiée (24h avant)
    const reservationTime = new Date(reservation.dateTime);
    const now = new Date();
    const hoursDiff = (reservationTime - now) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
        showAlert('error', 'Les réservations ne peuvent être modifiées que 24h à l\'avance.');
        return;
    }
    
    // Remplir le formulaire avec les données de la réservation
    // Sélectionner le service
    selectService(reservation.service, reservation.category);
    
    // Sélectionner le modèle (après un court délai pour s'assurer que le select est mis à jour)
    setTimeout(() => {
        modelSelect.value = reservation.model;
    }, 100);
    
    document.getElementById('name-input').value = reservation.name;
    document.getElementById('phone-input').value = reservation.phone;
    
    // Formater la date et l'heure pour les inputs
    const dateTime = new Date(reservation.dateTime);
    const isoDate = dateTime.toISOString().slice(0, 10);
    const isoTime = dateTime.toISOString().slice(11, 16);
    
    document.getElementById('date-input').value = isoDate;
    document.getElementById('time-input').value = isoTime;
    document.getElementById('notes-input').value = reservation.notes || '';
    brushingOption.checked = reservation.brushing;
    
    // Supprimer cette réservation 
    reservations.splice(realIndex, 1);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    displayReservations();
    
    // Faire défiler jusqu'au formulaire
    document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
    
    // Afficher un message
    showAlert('success', 'Vous pouvez modifier votre réservation. Soumettez le formulaire pour confirmer les modifications.');
}

function deleteReservation(index) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const userPhone = localStorage.getItem('userPhone');
        
        // Filtrer les réservations pour cet utilisateur
        const userReservations = userPhone 
            ? reservations.filter(res => res.phone === userPhone) 
            : reservations;
        
        const reservation = userReservations[index];
        
        // Trouver l'index réel dans le tableau complet de réservations
        const realIndex = reservations.findIndex(res => 
            res.service === reservation.service && 
            res.dateTime === reservation.dateTime &&
            res.phone === reservation.phone
        );
        
        if (realIndex === -1) {
            showAlert('error', 'Impossible de trouver cette réservation.');
            return;
        }
        
        // Vérifier si la réservation peut être annulée (24h avant)
        const reservationTime = new Date(reservation.dateTime);
        const now = new Date();
        const hoursDiff = (reservationTime - now) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            // Au lieu de bloquer, on marque simplement comme annulée
            reservations[realIndex].status = 'cancelled';
            localStorage.setItem('reservations', JSON.stringify(reservations));
            showAlert('success', 'Réservation annulée. Notez qu\'une annulation moins de 24h avant peut entraîner des frais.');
        } else {
            // Supprimer la réservation
            reservations.splice(realIndex, 1);
            localStorage.setItem('reservations', JSON.stringify(reservations));
            showAlert('success', 'Réservation annulée avec succès.');
        }
        
        displayReservations();
    }
}

function showAlert(type, message) {
    const alert = type === 'success' ? alertSuccess : alertError;
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

function showConfirmationModal(reservation) {
    // Mettre à jour le contenu de la modal
    let brushingText = reservation.brushing ? ' (avec brushing)' : '';
    
    confirmationContent.innerHTML = `
        <p><strong>Service :</strong> ${reservation.service}${brushingText}</p>
        <p><strong>Modèle :</strong> ${reservation.model}</p>
        <p><strong>Prix total :</strong> ${reservation.totalPrice}€</p>
        <p><strong>Nom :</strong> ${reservation.name}</p>
        <p><strong>Téléphone :</strong> ${reservation.phone}</p>
        <p><strong>Date et heure :</strong> ${new Date(reservation.dateTime).toLocaleDateString('fr-FR')} à ${new Date(reservation.dateTime).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
        ${reservation.notes ? `<p><strong>Notes :</strong> ${reservation.notes}</p>` : ''}
    `;
    
    currentReservation = reservation;
    
    // Afficher la modal
    confirmationModal.style.display = 'flex';
}

function initEventListeners() {
    // Événements pour les onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Mettre à jour les classes d'onglet active
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher le contenu de l'onglet sélectionné
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tab) {
                    content.classList.add('active');
                    currentTab = tab;
                }
            });
        });
    });
    
    // Évènement pour le changement de service dans le formulaire
    serviceSelect.addEventListener('change', function() {
        if (this.value) {
            const { service, category } = JSON.parse(this.value);
            selectedService = service;
            selectedCategory = category;
            updateModelSelect(service, category);
        } else {
            modelSelect.innerHTML = '<option value="" disabled selected>Choisissez d\'abord un service</option>';
        }
    });
    
    // Évènement de soumission du formulaire
    reservationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const serviceData = JSON.parse(serviceSelect.value);
        const service = serviceData.service;
        const category = serviceData.category;
        const model = modelSelect.value;
        const name = document.getElementById('name-input').value;
        const phone = document.getElementById('phone-input').value;
        const date = document.getElementById('date-input').value;
        const time = document.getElementById('time-input').value;
        const notes = document.getElementById('notes-input').value;
        const brushing = brushingOption.checked;
        
        // Calculer le prix
        const price = calculatePrice(service, category, model, brushing);
        
        // Créer l'objet de réservation
        const reservation = {
            service,
            category,
            model,
            name,
            phone,
            dateTime: `${date}T${time}`,
            notes,
            brushing,
            totalPrice: price,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Stocker temporairement le téléphone de l'utilisateur
        localStorage.setItem('userPhone', phone);
        
        // Afficher la modal de confirmation
        showConfirmationModal(reservation);
    });
    
    // Événement pour le bouton de confirmation dans la modal
    confirmReservationBtn.addEventListener('click', function() {
        saveReservation(currentReservation);
        
        // Réinitialiser le formulaire
        reservationForm.reset();
        modelSelect.innerHTML = '<option value="" disabled selected>Choisissez d\'abord un service</option>';
        
        // Fermer la modal
        confirmationModal.style.display = 'none';
        
        // Afficher un message de succès
        showAlert('success', 'Votre réservation a été confirmée !');
        
        // Rafraîchir la liste des réservations
        displayReservations();
    });
    
    // Événement pour fermer la modal
    document.querySelector('.modal-close').addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
    
    // Fermer la modal si on clique à l'extérieur
    confirmationModal.addEventListener('click', function(event) {
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
    
    // Configurer la date minimale pour aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-input').min = today;
    document.getElementById('date-input').value = today;
}

// Modifications à ajouter à votre fichier script.js existant

// Fonction modifiée pour tenir compte des disponibilités de l'administratrice
function updateDateAndTimeInputs() {
    // Récupérer les disponibilités définies par l'admin
    const availabilityData = JSON.parse(localStorage.getItem('availability')) || {};
    
    // Configurer le champ de date
    const dateInput = document.getElementById('date-input');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Assurer que la date minimale est aujourd'hui
    dateInput.min = today.toISOString().split('T')[0];
    
    // Ajouter un écouteur pour la sélection de date
    dateInput.addEventListener('change', function() {
        const selectedDate = this.value;
        
        // Vérifier si cette date est disponible
        if (availabilityData[selectedDate] && availabilityData[selectedDate].available) {
            // Mettre à jour les heures disponibles
            updateAvailableHours(selectedDate, availabilityData[selectedDate].slots);
        } else {
            // Date non disponible ou non définie
            const timeInput = document.getElementById('time-input');
            timeInput.innerHTML = '<option value="" disabled selected>Aucun créneau disponible à cette date</option>';
            timeInput.disabled = true;
            
            // Afficher un message si la date a été explicitement marquée comme indisponible
            if (availabilityData[selectedDate] && !availabilityData[selectedDate].available) {
                alert('Désolé, il n\'y a pas de disponibilité à cette date. Veuillez choisir une autre date.');
                this.value = '';
            }
        }
    });
}

// Fonction pour mettre à jour les heures disponibles
function updateAvailableHours(date, slots) {
    const timeInput = document.getElementById('time-input');
    
    // Si aucun créneau défini, utiliser les heures d'ouverture par défaut
    if (!slots || slots.length === 0) {
        // Heures par défaut (9h-18h par tranches de 30 minutes)
        const defaultSlots = [];
        for (let hour = 9; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                defaultSlots.push(time);
            }
        }
        
        populateTimeOptions(timeInput, defaultSlots);
    } else {
        // Utiliser les créneaux définis par l'admin
        const availableTimes = [];
        
        slots.forEach(slot => {
            // Convertir les heures de début et de fin en minutes
            const startParts = slot.start.split(':');
            const endParts = slot.end.split(':');
            
            const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
            const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
            
            // Générer des créneaux de 30 minutes
            for (let time = startMinutes; time < endMinutes; time += 30) {
                const hour = Math.floor(time / 60);
                const minute = time % 60;
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                availableTimes.push(timeStr);
            }
        });
        
        populateTimeOptions(timeInput, availableTimes);
    }
}

// Fonction pour remplir les options d'heure
function populateTimeOptions(timeInput, times) {
    // Vérifier s'il y a des créneaux disponibles
    if (times.length === 0) {
        timeInput.innerHTML = '<option value="" disabled selected>Aucun créneau disponible</option>';
        timeInput.disabled = true;
        return;
    }
    
    // Activer le champ
    timeInput.disabled = false;
    
    // Vider les options actuelles
    timeInput.innerHTML = '<option value="" disabled selected>Choisissez une heure</option>';
    
    // Vérifier s'il y a des rendez-vous existants pour éviter les chevauchements
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const selectedDate = document.getElementById('date-input').value;
    
    // Ajouter les options d'heure
    times.forEach(time => {
        // Vérifier si ce créneau chevauche un rendez-vous existant
        const isOverlapping = checkTimeOverlap(selectedDate, time, reservations);
        
        if (!isOverlapping) {
            const option = document.createElement('option');
            option.value = time;
            
            // Formater l'heure pour l'affichage (par exemple, 14:30 -> 14h30)
            const timeParts = time.split(':');
            option.textContent = `${timeParts[0]}h${timeParts[1]}`;
            
            timeInput.appendChild(option);
        }
    });
    
    // Vérifier si des créneaux sont disponibles après filtrage
    if (timeInput.options.length <= 1) {
        timeInput.innerHTML = '<option value="" disabled selected>Aucun créneau disponible</option>';
        timeInput.disabled = true;
    }
}

// Fonction pour vérifier si un créneau chevauche avec des rendez-vous existants
function checkTimeOverlap(date, time, reservations) {
    const selectedDateTime = new Date(`${date}T${time}`);
    
    // Estimer la durée du service sélectionné (pour simplifier, on utilise 1 heure fixe)
    const serviceDuration = 60; // minutes
    const endTime = new Date(selectedDateTime.getTime() + serviceDuration * 60000);
    
    return reservations.some(res => {
        if (res.status === 'cancelled') return false;
        
        const resDate = new Date(res.dateTime);
        
        // Estimer la durée de ce rendez-vous
        let resDuration = 60; // Durée par défaut: 1 heure
        
        // Calculer la durée en fonction du service et du modèle
        if (res.service === 'Braids' || res.service === 'Twist') {
            if (res.model === 'court') resDuration = 120; // 2 heures
            else if (res.model === 'moyen') resDuration = 180; // 3 heures
            else if (res.model === 'long') resDuration = 240; // 4 heures
        } else if (res.service === 'Fulani Braids') {
            if (res.model === 'court') resDuration = 150; // 2.5 heures
            else if (res.model === 'moyen') resDuration = 210; // 3.5 heures
            else if (res.model === 'long') resDuration = 270; // 4.5 heures
        } else if (res.service === 'Invisible Locs') {
            if (res.model === 'moyen') resDuration = 180; // 3 heures
            else if (res.model === 'long') resDuration = 240; // 4 heures
        }
        
        const resEndTime = new Date(resDate.getTime() + resDuration * 60000);
        
        // Vérifier si les rendez-vous se chevauchent
        return (selectedDateTime < resEndTime && endTime > resDate);
    });
}

// Nouvelle fonction pour filtrer les dates disponibles dans le calendrier
function highlightAvailableDates() {
    // Récupérer le champ de date
    const dateInput = document.getElementById('date-input');
    
    // Récupérer les disponibilités
    const availabilityData = JSON.parse(localStorage.getItem('availability')) || {};
    
    // Créer un objet Date pour aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filtrer les dates disponibles (celles explicitement marquées comme available)
    const availableDates = Object.keys(availabilityData).filter(dateKey => {
        const date = new Date(dateKey);
        return date >= today && availabilityData[dateKey].available;
    });
    
    // Si aucune date n'est disponible, afficher un message
    if (availableDates.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-availability';
        message.textContent = 'Aucune disponibilité n\'a été définie. Veuillez réessayer ultérieurement.';
        
        // Insérer le message après le champ de date
        dateInput.parentNode.appendChild(message);
        
        // Désactiver le champ de date
        dateInput.disabled = true;
    }
    
    // Ajouter un indicateur visuel à côté du champ de date
    const dateInfo = document.createElement('div');
    dateInfo.className = 'date-info';
    dateInfo.innerHTML = '<i class="fas fa-info-circle"></i> Seules les dates disponibles peuvent être sélectionnées';
    
    // Insérer l'info après le champ de date
    dateInput.parentNode.appendChild(dateInfo);
}

// Remplacer ou modifier l'initialisation existante pour inclure la vérification des disponibilités
function init() {
    renderServices();
    populateServiceSelect();
    initEventListeners();
    displayReservations();
    updateDateAndTimeInputs(); // Nouvelle fonction pour gérer les disponibilités
    highlightAvailableDates(); // Ajouter les indicateurs visuels
}

// Assurez-vous que cette fonction est appelée au chargement de la page
document.addEventListener('DOMContentLoaded', init);

// Initialisation de l'application
function init() {
    renderServices();
    populateServiceSelect();
    initEventListeners();
    displayReservations();
}



// Lancer l'application au chargement de la page
document.addEventListener('DOMContentLoaded', init);