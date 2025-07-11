// Initialiser EmailJS
function initEmailJS() {
    (function() {
        // === CONFIGURATION EMAILJS SÉCURISÉE ===
        // Placez votre clé publique dans un fichier séparé non versionné : 'js/emailjs-config.js'
        // Exemple de contenu pour js/emailjs-config.js :
        //   window.FCHAIRSLYON_EMAILJS_KEY = "VOTRE_CLE_PUBLIQUE_EMAILJS";
        // NE PAS VERSIONNER CE FICHIER ! (ajoutez-le à .gitignore)
        let emailjsKey = undefined;
        if (window.FCHAIRSLYON_EMAILJS_KEY) {
            emailjsKey = window.FCHAIRSLYON_EMAILJS_KEY;
        } else {
            console.error("[EmailJS] ERREUR : Le fichier js/emailjs-config.js est manquant ou mal configuré. Veuillez suivre l'exemple dans script.js pour brancher votre vraie clé EmailJS.");
            // Valeur de secours (ancienne clé, à remplacer !)
            emailjsKey = "FNaCkd48052cJ6ssL";
        }
        emailjs.init(emailjsKey);
    })();
}

// Fonction pour envoyer un email de confirmation
function sendConfirmationEmail(reservation) {
    const dateTime = new Date(reservation.dateTime);
    const formattedDate = dateTime.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const formattedTime = dateTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const emailParams = {
        to_name: reservation.name,
        to_email: reservation.email,
        email: reservation.email,
        service_name: reservation.service,
        service_model: reservation.model,
        reservation_date: formattedDate,
        reservation_time: formattedTime,
        total_price: reservation.totalPrice + '€',
        brushing: reservation.brushing ? 'Oui' : 'Non',
        instagram: reservation.instagram || ''
    };
    
    // Envoyer l'email
    emailjs.send('service_ijqcgmf', 'template_zt7aabh', emailParams)
        .then(function(response) {
            console.log('EMAIL ENVOYÉ!', response.status, response.text);
        }, function(error) {
            console.log('ERREUR D\'ENVOI EMAIL...', error);
        });
}


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
            "unique": 30, 
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
        <img src="${details.image}" alt="${name}" class="service-image" loading="lazy">
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
        
        // Préparer les données pour l'email
        const reservationData = {
            name: reservation.name,
            service: reservation.service,
            model: reservation.model,
            dateTime: reservation.dateTime,
            totalPrice: reservation.totalPrice,
            email: reservation.email
        };
        
        if (hoursDiff < 24) {
            // Au lieu de bloquer, on marque simplement comme annulée
            reservations[realIndex].status = 'cancelled';
            localStorage.setItem('reservations', JSON.stringify(reservations));
            showAlert('success', 'Réservation annulée. Notez qu\'une annulation moins de 24h avant peut entraîner des frais.');
            // Notifier admin et client
            if (window.emailNotificationService && reservation.email) {
                window.emailNotificationService.sendEmail(reservation.email, 'reservation_cancellation', reservationData);
                window.emailNotificationService.sendAdminNotification('reservation_annulee', reservationData);
            }
        } else {
            // Supprimer la réservation
            reservations.splice(realIndex, 1);
            localStorage.setItem('reservations', JSON.stringify(reservations));
            showAlert('success', 'Réservation annulée avec succès.');
            // Notifier admin et client
            if (window.emailNotificationService && reservation.email) {
                window.emailNotificationService.sendEmail(reservation.email, 'reservation_cancellation', reservationData);
                window.emailNotificationService.sendAdminNotification('reservation_annulee', reservationData);
            }
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
        const email = document.getElementById('email-input')?.value || ''; // Récupérer l'email
        const instagram = document.getElementById('instagram-input')?.value || '';
        const date = document.getElementById('date-input').value;
        
        // Récupérer l'heure - vérifier si nous utilisons le select personnalisé
        let time;
        const timeInput = document.getElementById('time-input');
        const timeSelect = document.getElementById('time-select');
        
        if (timeInput && timeInput.value) {
            time = timeInput.value;
        } else if (timeSelect && timeSelect.value) {
            time = timeSelect.value;
        } else {
            showAlert('error', 'Veuillez sélectionner une heure de rendez-vous.');
            return;
        }
        
        const notes = document.getElementById('notes-input')?.value || '';
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
            email, // Ajouter l'email à l'objet de réservation
            instagram, // Ajout du champ Instagram
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
    confirmReservationBtn.addEventListener('click', async function () {
        const reservation = currentReservation;
        const dateKey = reservation.dateTime.split('T')[0];
        const hour = reservation.dateTime.split('T')[1];

        // Charger les dispos depuis Firebase
        const availabilities = await FirebaseAvailabilityService.getAvailabilities();
        const availableHours = availabilities[dateKey] || [];

        // Vérifie si l'heure est encore dispo
        if (!availableHours.includes(hour)) {
            showAlert('error', "Désolé, ce créneau a déjà été réservé. Veuillez en choisir un autre.");
            confirmationModal.style.display = 'none';
            return;
        }

        // Supprimer l'heure du tableau
        const updatedHours = availableHours.filter(h => h !== hour);
        availabilities[dateKey] = updatedHours;

        // Enregistrer les nouvelles dispos dans Firebase
        const success = await FirebaseAvailabilityService.setAvailabilities(availabilities);
        
        if (!success) {
            showAlert('error', "Une erreur est survenue lors de la validation. Veuillez réessayer.");
            return;
        }

        // Enregistrer la réservation localement
        saveReservation(reservation);

        // Envoyer un email de confirmation
        if (reservation.email) {
            sendConfirmationEmail(reservation);
            // Envoi à la coiffeuse
            const coiffeuseReservation = { ...reservation, email: "manoushka779@gmail.com", name: reservation.name + " (NOUVELLE RÉSERVATION CLIENT)" };
            sendConfirmationEmail(coiffeuseReservation);
        }

        // Réinitialiser
        reservationForm.reset();
        modelSelect.innerHTML = '<option value="" disabled selected>Choisissez d\'abord un service</option>';
        confirmationModal.style.display = 'none';

        showAlert('success', 'Votre réservation a été confirmée et votre créneau est bloqué 🔒');
        displayReservations();
    });
    
    // Configurer la date minimale pour aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-input').min = today;
    document.getElementById('date-input').value = today;
}

// Animation d'apparition sur les sections principales (formulaire, alertes, cartes, etc.)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.section-title, .card, .modal-content, .reservation-item, .stat-card, .reservation-section, .alert').forEach((el, i) => {
        el.style.animationDelay = (0.1 + i * 0.07) + 's';
        el.classList.add('fade-in');
    });
    // Animation du logo
    const logo = document.querySelector('.footer-logo, .logo');
    if (logo) logo.classList.add('logo-animate');
});

// Fonction d'initialisation - DÉPLACER EN DEHORS de initEventListeners
function init() {
    initEmailJS();
    renderServices();
    populateServiceSelect();
    initEventListeners();
    displayReservations();
}

// Ajoutez ce code à votre fichier script.js pour optimiser le chargement sur mobile
document.addEventListener('DOMContentLoaded', function() {
    // Détection de connexion lente
    if (navigator.connection && navigator.connection.effectiveType.includes('2g')) {
        // Désactiver certaines animations pour économiser les ressources
        document.documentElement.classList.add('reduce-motion');
        
        // Charger les images de façon différée
        document.querySelectorAll('img').forEach(img => {
            img.loading = 'lazy';
        });
    }
    
    // Optimisation du scroll sur mobile
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        // Ajouter une classe pendant le défilement
        document.body.classList.add('is-scrolling');
        
        // Supprimer la classe après l'arrêt du défilement
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            document.body.classList.remove('is-scrolling');
        }, 200);
    }, { passive: true });
});
// Lancer l'application au chargement de la page - DÉPLACER EN DEHORS de initEventListeners
document.addEventListener('DOMContentLoaded', init);

// === DINGUERIE COIFFURE ===
(function() {
  // Carrousel Masonry
  const masonry = document.querySelector('.coiffure-carousel-masonry');
  const leftBtn = document.querySelector('.carousel-arrow.left');
  const rightBtn = document.querySelector('.carousel-arrow.right');
  if (masonry && leftBtn && rightBtn) {
    leftBtn.addEventListener('click', () => {
      masonry.scrollBy({ left: -350, behavior: 'smooth' });
    });
    rightBtn.addEventListener('click', () => {
      masonry.scrollBy({ left: 350, behavior: 'smooth' });
    });
    // Swipe sur mobile
    let startX = null;
    masonry.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
    masonry.addEventListener('touchend', e => {
      if (startX !== null) {
        let dx = e.changedTouches[0].clientX - startX;
        if (dx > 60) leftBtn.click();
        if (dx < -60) rightBtn.click();
        startX = null;
      }
    });
  }
  // Flip card (hover/tap)
  document.querySelectorAll('.coiffure-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (window.innerWidth < 900) {
        this.classList.toggle('flipped');
      }
    });
    card.addEventListener('mouseleave', function() {
      if (window.innerWidth < 900) {
        this.classList.remove('flipped');
      }
    });
  });
  // Fade/slide apparition
  function revealOnScroll() {
    document.querySelectorAll('.fade-slide').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('DOMContentLoaded', revealOnScroll);
  // Zoom plein écran sur la photo
  function createModal(imgSrc, alt) {
    const modal = document.createElement('div');
    modal.className = 'coiffure-modal';
    modal.innerHTML = `<div class="modal-bg"></div><img src="${imgSrc}" alt="${alt}"><button class="modal-close" aria-label="Fermer">&times;</button>`;
    document.body.appendChild(modal);
    modal.querySelector('.modal-bg').onclick = modal.querySelector('.modal-close').onclick = () => modal.remove();
    setTimeout(() => modal.classList.add('show'), 10);
  }
  document.querySelectorAll('.coiffure-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function(e) {
      createModal(this.src, this.alt);
    });
  });
  // Parallax sur la bannière (header)
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function() {
      let y = window.scrollY;
      header.style.backgroundPosition = `center ${y * 0.3}px`;
    });
  }
})();

// === MODAL PHOTO GRAND FORMAT ===
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('photo-modal-img');
  const modalClose = document.getElementById('photo-modal-close');

  function openModal(src) {
    modalImg.src = src;
    modal.style.display = 'flex';
  }
  function closeModal() {
    modal.style.display = 'none';
    modalImg.src = '';
  }
  // Clic sur les images de prestation/coiffure
  document.querySelectorAll('.service-image, .coiffure-card img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function(e) {
      openModal(this.src);
    });
  });
  // Fermer la modal au clic sur la croix ou l'overlay
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
  // Fermer avec Echap
  document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'flex' && e.key === 'Escape') closeModal();
  });
});