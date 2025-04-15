// Données des services (identiques à celles du script principal)
const services = {
    femmes: {
        "Braids": { 
            "court": 30, 
            "moyen": 40, 
            "long": 50, 
            "image": "../images/braid femme.jpeg" 
        },
        "Twist": { 
            "court": 30, 
            "moyen": 40, 
            "long": 50, 
            "image": "assets/images/twist.jpg" 
        },
        "Fulani Braids": { 
            "court": 30, 
            "moyen": 40, 
            "long": 45, 
            "image": "assets/images/fulani.jpg" 
        },
        "Invisible Locs": { 
            "moyen": 35, 
            "long": 45, 
            "image": "assets/images/locs.jpg" 
        },
        "Nattes collées simple": { 
            "unique": 15, 
            "image": "assets/images/nattes-simple.jpg" 
        },
        "Nattes collées avec rajout": { 
            "unique": 20, 
            "image": "assets/images/nattes-rajout.jpg" 
        }
    },
    hommes: {
        "Nattes collées simple": { 
            "unique": 10, 
            "image": "assets/images/nattes-h-simple.jpg" 
        },
        "Nattes collées avec modèle": { 
            "unique": 15, 
            "image": "assets/images/nattes-h-modele.jpg" 
        },
        "Vanilles": { 
            "unique": 15, 
            "image": "assets/images/vanilles.jpg" 
        },
        "Fulani": { 
            "unique": 15, 
            "image": "assets/images/fulani-h.jpg" 
        },
        "Barrel Twist": { 
            "unique": 25, 
            "image": "assets/images/barrel-twist.jpg" 
        },
        "Départ de locks": { 
            "unique": 30, 
            "image": "assets/images/depart-locks.jpg" 
        },
        "Retwist": { 
            "unique": 30, 
            "image": "assets/images/retwist.jpg" 
        }
    }
};

// Sélecteurs DOM communs
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const appointmentModal = document.getElementById('appointment-modal');
const serviceModal = document.getElementById('service-modal');
const confirmModal = document.getElementById('confirm-modal');
const detailsModal = document.getElementById('details-modal');

// Variables globales
let currentAppointmentId = null;
let currentServiceId = null;
let currentPage = 1;
let appointmentsPerPage = 10;
let currentDeleteCallback = null;

// Initialisation de l'admin
function init() {
    initNavigation();
    initAppointmentsSection();
    initClientsSection();
    initServicesSection();
    initStatisticsSection();
    initSettingsSection();
    initModals();
    
    // Par défaut, afficher le tableau de bord
    displayDashboard();
}

// Navigation entre sections
function initNavigation() {
    menuItems.forEach(item => {
        if (item.id !== 'logout-btn') {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Mettre à jour les classes active
                menuItems.forEach(mi => mi.classList.remove('active'));
                this.classList.add('active');
                
                // Afficher la section correspondante
                const section = this.dataset.section;
                contentSections.forEach(cs => {
                    cs.classList.remove('active');
                    if (cs.id === section) {
                        cs.classList.add('active');
                    }
                });
            });
        }
    });
    
    // Gérer le bouton de déconnexion
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            // Dans une application réelle, cela redirigerait vers une page de connexion
            // ou déconnecterait l'utilisateur via une API
            window.location.href = 'index.html';
        }
    });
}

// ======== GESTION DES RENDEZ-VOUS ========

function initAppointmentsSection() {
    // Écouteurs pour les boutons d'ajout de rendez-vous
    document.getElementById('add-appointment-btn').addEventListener('click', showAddAppointmentModal);
    document.getElementById('add-appointment-btn-2').addEventListener('click', showAddAppointmentModal);
    
    // Écouteurs pour les filtres de rendez-vous
    document.getElementById('filter-date').addEventListener('change', filterAppointments);
    document.getElementById('filter-status').addEventListener('change', filterAppointments);
    document.getElementById('search-input').addEventListener('input', filterAppointments);
    
    // Initialiser le client select
    populateClientSelect();
    
    // Initialiser les catégories et services
    document.getElementById('service-category').addEventListener('change', function() {
        const category = this.value;
        populateServiceSelect(category);
    });
    
    document.getElementById('service-select').addEventListener('change', function() {
        const category = document.getElementById('service-category').value;
        const service = this.value;
        populateModelSelect(service, category);
        updatePriceInput();
    });
    
    document.getElementById('model-select').addEventListener('change', updatePriceInput);
    document.getElementById('brushing-option').addEventListener('change', updatePriceInput);
    
    // Initialiser les nouveaux champs client
    document.getElementById('client-select').addEventListener('change', function() {
        const isNewClient = this.value === 'new';
        document.getElementById('new-client-fields').style.display = isNewClient ? 'block' : 'none';
    });
    
    // Initialiser la date minimale pour aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-input').min = today;
    
    // Boutons de la modal
    document.getElementById('save-appointment-btn').addEventListener('click', saveAppointment);
    document.getElementById('cancel-appointment-btn').addEventListener('click', function() {
        appointmentModal.style.display = 'none';
    });
    
    // Afficher les rendez-vous
    displayAllAppointments();
}

function showAddAppointmentModal() {
    // Réinitialiser le formulaire
    document.getElementById('appointment-form').reset();
    document.getElementById('new-client-fields').style.display = 'none';
    document.getElementById('appointment-id').value = '';
    document.getElementById('appointment-modal-title').textContent = 'Ajouter un rendez-vous';
    currentAppointmentId = null;
    
    // Mettre à jour les sélects
    document.getElementById('model-select').innerHTML = '<option value="" disabled selected>Choisir d\'abord un service</option>';
    document.getElementById('service-select').innerHTML = '<option value="" disabled selected>Choisir d\'abord une catégorie</option>';
    
    // Afficher la modal
    appointmentModal.style.display = 'flex';
}

function showEditAppointmentModal(id) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservation = reservations[id];
    
    if (!reservation) {
        alert('Rendez-vous non trouvé !');
        return;
    }
    
    // Mettre à jour le titre et l'ID
    document.getElementById('appointment-modal-title').textContent = 'Modifier le rendez-vous';
    document.getElementById('appointment-id').value = id;
    currentAppointmentId = id;
    
    // Remplir le formulaire
    // Client
    const clientSelect = document.getElementById('client-select');
    const existingOption = Array.from(clientSelect.options).find(option => option.textContent === reservation.name);
    
    if (existingOption) {
        existingOption.selected = true;
        document.getElementById('new-client-fields').style.display = 'none';
    } else {
        // Si le client n'existe pas encore dans le select
        const newOption = document.createElement('option');
        newOption.value = 'existing_' + reservation.phone;
        newOption.textContent = reservation.name;
        clientSelect.appendChild(newOption);
        newOption.selected = true;
        document.getElementById('new-client-fields').style.display = 'none';
    }
    
    // Remplir les champs client (même s'ils sont cachés)
    document.getElementById('client-name').value = reservation.name;
    document.getElementById('client-phone').value = reservation.phone;
    
    // Catégorie de service
    document.getElementById('service-category').value = reservation.category;
    
    // Services
    populateServiceSelect(reservation.category);
    setTimeout(() => {
        document.getElementById('service-select').value = reservation.service;
        
        // Modèle
        populateModelSelect(reservation.service, reservation.category);
        setTimeout(() => {
            document.getElementById('model-select').value = reservation.model;
            updatePriceInput();
        }, 100);
    }, 100);
    
    // Brushing
    document.getElementById('brushing-option').checked = reservation.brushing;
    
    // Date et heure
    const dateTime = new Date(reservation.dateTime);
    document.getElementById('date-input').value = dateTime.toISOString().split('T')[0];
    document.getElementById('time-input').value = dateTime.toISOString().slice(11, 16);
    
    // Statut
    document.getElementById('status-select').value = reservation.status;
    
    // Notes
    document.getElementById('notes-input').value = reservation.notes || '';
    
    // Afficher la modal
    appointmentModal.style.display = 'flex';
}

function saveAppointment() {
    const form = document.getElementById('appointment-form');
    
    // Vérifier si le formulaire est valide
    if (!form.checkValidity()) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    // Récupérer les données du formulaire
    const id = document.getElementById('appointment-id').value;
    const clientSelectValue = document.getElementById('client-select').value;
    const isNewClient = clientSelectValue === 'new';
    
    // Données client
    let clientName, clientPhone;
    
    if (isNewClient) {
        clientName = document.getElementById('client-name').value;
        clientPhone = document.getElementById('client-phone').value;
    } else if (clientSelectValue.startsWith('existing_')) {
        // Récupérer le téléphone du client existant qui n'est pas encore dans la liste déroulante
        clientPhone = clientSelectValue.replace('existing_', '');
        clientName = document.getElementById('client-select').options[document.getElementById('client-select').selectedIndex].text;
    } else {
        // Récupérer les données du client existant
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        const client = clients.find(c => c.id === clientSelectValue);
        clientName = client.name;
        clientPhone = client.phone;
    }
    
    // Données de service
    const category = document.getElementById('service-category').value;
    const service = document.getElementById('service-select').value;
    const model = document.getElementById('model-select').value;
    const brushing = document.getElementById('brushing-option').checked;
    
    // Calculer le prix
    let price = services[category][service][model];
    if (brushing) {
        price += 5;
    }
    
    // Date et heure
    const date = document.getElementById('date-input').value;
    const time = document.getElementById('time-input').value;
    const dateTime = `${date}T${time}`;
    
    // Autres données
    const status = document.getElementById('status-select').value;
    const notes = document.getElementById('notes-input').value;
    
    // Créer l'objet de réservation
    const reservation = {
        service,
        category,
        model,
        name: clientName,
        phone: clientPhone,
        dateTime,
        notes,
        brushing,
        totalPrice: price,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Enregistrer le client s'il est nouveau
    if (isNewClient) {
        saveClient({
            id: Date.now().toString(),
            name: clientName,
            phone: clientPhone,
            createdAt: new Date().toISOString()
        });
    }
    
    // Récupérer les réservations existantes
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    if (id) {
        // Mettre à jour une réservation existante
        reservations[id] = reservation;
    } else {
        // Ajouter une nouvelle réservation
        reservations.push(reservation);
    }
    
    // Enregistrer les réservations
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    // Fermer la modal
    appointmentModal.style.display = 'none';
    
    // Rafraîchir l'affichage
    displayAllAppointments();
    displayDashboard(); // Mettre à jour le tableau de bord
    
    // Afficher un message
    alert('Rendez-vous ' + (id ? 'modifié' : 'ajouté') + ' avec succès !');
}

function deleteAppointment(id) {
    showConfirmModal(
        'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
        () => {
            let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            reservations.splice(id, 1);
            localStorage.setItem('reservations', JSON.stringify(reservations));
            
            displayAllAppointments();
            displayDashboard(); // Mettre à jour le tableau de bord
            
            // Fermer la modal
            confirmModal.style.display = 'none';
            
            // Afficher un message
            alert('Rendez-vous supprimé avec succès !');
        }
    );
}

function viewAppointmentDetails(id) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservation = reservations[id];
    
    if (!reservation) {
        alert('Rendez-vous non trouvé !');
        return;
    }
    
    // Formater les données
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
    
    let brushingText = reservation.brushing ? 'Oui (+5€)' : 'Non';
    let modelDisplay = reservation.model === 'unique' ? 'Standard' : reservation.model.charAt(0).toUpperCase() + reservation.model.slice(1);
    
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
    
    // Construire le contenu des détails
    const content = `
        <div class="details-grid">
            <div class="details-section">
                <h3>Informations Client</h3>
                <p><strong>Nom :</strong> ${reservation.name}</p>
                <p><strong>Téléphone :</strong> ${reservation.phone}</p>
            </div>
            
            <div class="details-section">
                <h3>Détails du Service</h3>
                <p><strong>Service :</strong> ${reservation.service}</p>
                <p><strong>Catégorie :</strong> ${reservation.category === 'femmes' ? 'Femmes' : 'Hommes'}</p>
                <p><strong>Modèle/Longueur :</strong> ${modelDisplay}</p>
                <p><strong>Brushing :</strong> ${brushingText}</p>
                <p><strong>Prix Total :</strong> ${reservation.totalPrice}€</p>
            </div>
            
            <div class="details-section">
                <h3>Date et Heure</h3>
                <p><strong>Date :</strong> ${formattedDate}</p>
                <p><strong>Heure :</strong> ${formattedTime}</p>
            </div>
            
            <div class="details-section">
                <h3>Statut</h3>
                <p><span class="status ${statusClass}">${statusText}</span></p>
                <p><strong>Créé le :</strong> ${new Date(reservation.createdAt).toLocaleString('fr-FR')}</p>
                ${reservation.updatedAt ? `<p><strong>Mis à jour le :</strong> ${new Date(reservation.updatedAt).toLocaleString('fr-FR')}</p>` : ''}
            </div>
        </div>
        
        ${reservation.notes ? `
        <div class="details-section">
            <h3>Notes</h3>
            <p>${reservation.notes}</p>
        </div>
        ` : ''}
    `;
    
    // Mettre à jour et afficher la modal
    document.getElementById('details-content').innerHTML = content;
    detailsModal.style.display = 'flex';
    
    // Ajouter écouteur pour le bouton de fermeture
    document.getElementById('details-close-btn').addEventListener('click', function() {
        detailsModal.style.display = 'none';
    });
}

function displayAllAppointments(page = 1, filters = null) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const tbody = document.getElementById('all-appointments');
    
    // Filtrer les réservations si nécessaire
    let filteredReservations = reservations;
    
    if (filters) {
        filteredReservations = reservations.filter(res => {
            // Filtre par date
            if (filters.date && !res.dateTime.startsWith(filters.date)) {
                return false;
            }
            
            // Filtre par statut
            if (filters.status && filters.status !== 'all' && res.status !== filters.status) {
                return false;
            }
            
            // Filtre par recherche (nom ou téléphone)
            if (filters.search) {
                const search = filters.search.toLowerCase();
                return res.name.toLowerCase().includes(search) || res.phone.includes(search);
            }
            
            return true;
        });
    }
    
    // Trier par date (du plus récent au plus ancien)
    filteredReservations.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
    // Pagination
    const totalPages = Math.ceil(filteredReservations.length / appointmentsPerPage);
    const startIndex = (page - 1) * appointmentsPerPage;
    const paginatedReservations = filteredReservations.slice(startIndex, startIndex + appointmentsPerPage);
    
    // Effacer le tableau
    tbody.innerHTML = '';
    
    // Afficher un message si aucun rendez-vous
    if (paginatedReservations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Aucun rendez-vous trouvé</td></tr>`;
        return;
    }
    
    // Remplir le tableau
    paginatedReservations.forEach((res, index) => { const realIndex = startIndex + index;
        
        // Formater la date et l'heure
        const dateTime = new Date(res.dateTime);
        const formattedDate = dateTime.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const formattedTime = dateTime.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Déterminer la classe de statut
        let statusClass = '';
        let statusText = '';
        
        switch(res.status) {
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'En attente';
                break;
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'Confirmé';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Annulé';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'En attente';
        }
        
        // Créer la ligne
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${res.name}</td>
            <td>${res.service} (${res.model})</td>
            <td>${formattedDate} - ${formattedTime}</td>
            <td>${res.totalPrice}€</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        // Ajouter les événements pour les boutons d'action
        row.querySelector('.view').addEventListener('click', () => viewAppointmentDetails(realIndex));
        row.querySelector('.edit').addEventListener('click', () => showEditAppointmentModal(realIndex));
        row.querySelector('.delete').addEventListener('click', () => deleteAppointment(realIndex));
        
        tbody.appendChild(row);
    });
    
    // Mettre à jour la pagination
    updatePagination(page, totalPages);
}

function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('appointments-pagination');
    pagination.innerHTML = '';
    
    // Bouton précédent
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            displayAllAppointments(currentPage - 1, getFilters());
        }
    });
    pagination.appendChild(prevBtn);
    
    // Pages
    const maxPages = 5; // Nombre maximum de pages à afficher
    const halfMaxPages = Math.floor(maxPages / 2);
    
    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            displayAllAppointments(i, getFilters());
        });
        pagination.appendChild(pageBtn);
    }
    
    // Bouton suivant
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            displayAllAppointments(currentPage + 1, getFilters());
        }
    });
    pagination.appendChild(nextBtn);
}

function filterAppointments() {
    const filters = getFilters();
    displayAllAppointments(1, filters);
}

function getFilters() {
    return {
        date: document.getElementById('filter-date').value,
        status: document.getElementById('filter-status').value,
        search: document.getElementById('search-input').value
    };
}

// ======== GESTION DES CLIENTS ========

function initClientsSection() {
    // Écouteur pour le bouton d'ajout de client
    document.getElementById('add-client-btn').addEventListener('click', () => {
        // TODO: Implémenter l'ajout de client
        alert('Fonctionnalité à venir !');
    });
    
    // Écouteur pour la recherche
    document.getElementById('client-search').addEventListener('input', () => {
        displayClients();
    });
    
    // Afficher les clients
    displayClients();
}

function displayClients() {
    // Récupérer tous les clients
    let clients = [];
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Extraire les clients uniques des réservations
    const phoneNumbers = new Set();
    reservations.forEach(res => {
        if (!phoneNumbers.has(res.phone)) {
            phoneNumbers.add(res.phone);
            clients.push({
                id: res.phone, // Utiliser le téléphone comme ID
                name: res.name,
                phone: res.phone,
                appointmentsCount: 0,
                totalSpent: 0
            });
        }
    });
    
    // Calculer le nombre de rendez-vous et les dépenses pour chaque client
    clients.forEach(client => {
        // Filtrer les réservations pour ce client
        const clientReservations = reservations.filter(res => res.phone === client.phone);
        
        // Mettre à jour les statistiques
        client.appointmentsCount = clientReservations.length;
        client.totalSpent = clientReservations.reduce((sum, res) => sum + res.totalPrice, 0);
    });
    
    // Filtrer les clients selon la recherche
    const searchTerm = document.getElementById('client-search').value.toLowerCase();
    if (searchTerm) {
        clients = clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm) || 
            client.phone.includes(searchTerm)
        );
    }
    
    // Trier les clients par dépenses (du plus au moins)
    clients.sort((a, b) => b.totalSpent - a.totalSpent);
    
    // Afficher les clients
    const tbody = document.getElementById('clients-list');
    tbody.innerHTML = '';
    
    // Afficher un message si aucun client
    if (clients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Aucun client trouvé</td></tr>`;
        return;
    }
    
    // Remplir le tableau
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.phone}</td>
            <td>${client.appointmentsCount}</td>
            <td>${client.totalSpent}€</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                </div>
            </td>
        `;
        
        // TODO: Ajouter les événements pour les boutons d'action
        
        tbody.appendChild(row);
    });
    
    // Mettre à jour la liste des clients dans le formulaire de rendez-vous
    populateClientSelect();
}

function saveClient(client) {
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    // Vérifier si le client existe déjà
    const existingIndex = clients.findIndex(c => c.phone === client.phone);
    
    if (existingIndex !== -1) {
        // Mettre à jour le client existant
        clients[existingIndex] = { ...clients[existingIndex], ...client };
    } else {
        // Ajouter un nouveau client
        clients.push(client);
    }
    
    // Sauvegarder les clients
    localStorage.setItem('clients', JSON.stringify(clients));
    
    // Mettre à jour la liste des clients
    populateClientSelect();
}

function populateClientSelect() {
    const clientSelect = document.getElementById('client-select');
    
    // Sauvegarder la valeur actuelle
    const currentValue = clientSelect.value;
    
    // Vider le select
    clientSelect.innerHTML = '<option value="" disabled selected>Sélectionner un client</option>';
    
    // Option pour nouveau client
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '+ Nouveau client';
    clientSelect.appendChild(newOption);
    
    // Récupérer tous les clients uniques des réservations
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const clients = {};
    
    reservations.forEach(res => {
        if (!clients[res.phone]) {
            clients[res.phone] = {
                name: res.name,
                phone: res.phone
            };
        }
    });
    
    // Ajouter les clients au select
    Object.values(clients).forEach(client => {
        const option = document.createElement('option');
        option.value = client.phone;
        option.textContent = client.name;
        clientSelect.appendChild(option);
    });
    
    // Restaurer la valeur si possible
    if (currentValue) {
        try {
            clientSelect.value = currentValue;
        } catch (e) {
            // Ignorer si la valeur n'existe plus
        }
    }
}

// ======== GESTION DES SERVICES ========

function initServicesSection() {
    // Écouteurs pour les boutons d'ajout de service
    document.getElementById('add-women-service-btn').addEventListener('click', () => showAddServiceModal('femmes'));
    document.getElementById('add-men-service-btn').addEventListener('click', () => showAddServiceModal('hommes'));
    
    // Boutons de la modal
    document.getElementById('save-service-btn').addEventListener('click', saveService);
    document.getElementById('cancel-service-btn').addEventListener('click', () => {
        serviceModal.style.display = 'none';
    });
    
    // Afficher les services
    displayServices();
}

function showAddServiceModal(category) {
    // Réinitialiser le formulaire
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = '';
    document.getElementById('service-category-hidden').value = category;
    document.getElementById('service-modal-title').textContent = 'Ajouter un service';
    currentServiceId = null;
    
    // Afficher les champs appropriés selon la catégorie
    document.getElementById('women-service-prices').style.display = category === 'femmes' ? 'block' : 'none';
    document.getElementById('men-service-price').style.display = category === 'hommes' ? 'block' : 'none';
    
    // Afficher la modal
    serviceModal.style.display = 'flex';
}

function showEditServiceModal(category, service) {
    // Réinitialiser le formulaire
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = service;
    document.getElementById('service-category-hidden').value = category;
    document.getElementById('service-modal-title').textContent = 'Modifier le service';
    currentServiceId = service;
    
    // Afficher les champs appropriés selon la catégorie
    document.getElementById('women-service-prices').style.display = category === 'femmes' ? 'block' : 'none';
    document.getElementById('men-service-price').style.display = category === 'hommes' ? 'block' : 'none';
    
    // Remplir le formulaire
    document.getElementById('service-name').value = service;
    
    if (category === 'femmes') {
        document.getElementById('price-court').value = services[category][service].court || '';
        document.getElementById('price-moyen').value = services[category][service].moyen || '';
        document.getElementById('price-long').value = services[category][service].long || '';
    } else {
        document.getElementById('price-unique').value = services[category][service].unique || '';
    }
    
    // TODO: Image upload
    
    // Afficher la modal
    serviceModal.style.display = 'flex';
}

function saveService() {
    const form = document.getElementById('service-form');
    
    // Vérifier si le formulaire est valide
    if (!form.checkValidity()) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    // Récupérer les données du formulaire
    const serviceName = document.getElementById('service-name').value;
    const category = document.getElementById('service-category-hidden').value;
    
    // Créer l'objet de service
    let serviceData = {
        image: 'assets/images/default.jpg' // Image par défaut
    };
    
    if (category === 'femmes') {
        const courtPrice = document.getElementById('price-court').value;
        const moyenPrice = document.getElementById('price-moyen').value;
        const longPrice = document.getElementById('price-long').value;
        
        if (courtPrice) serviceData.court = parseFloat(courtPrice);
        if (moyenPrice) serviceData.moyen = parseFloat(moyenPrice);
        if (longPrice) serviceData.long = parseFloat(longPrice);
    } else {
        const uniquePrice = document.getElementById('price-unique').value;
        serviceData.unique = parseFloat(uniquePrice);
    }
    
    // TODO: Gérer l'upload d'image
    
    // Mettre à jour les services
    services[category][serviceName] = serviceData;
    
    // Sauvegarder les services
    localStorage.setItem('services', JSON.stringify(services));
    
    // Fermer la modal
    serviceModal.style.display = 'none';
    
    // Rafraîchir l'affichage
    displayServices();
    
    // Afficher un message
    alert('Service ' + (currentServiceId ? 'modifié' : 'ajouté') + ' avec succès !');
}

function deleteService(category, service) {
    showConfirmModal(
        'Êtes-vous sûr de vouloir supprimer ce service ?',
        () => {
            // Supprimer le service
            delete services[category][service];
            
            // Sauvegarder les services
            localStorage.setItem('services', JSON.stringify(services));
            
            // Rafraîchir l'affichage
            displayServices();
            
            // Fermer la modal
            confirmModal.style.display = 'none';
            
            // Afficher un message
            alert('Service supprimé avec succès !');
        }
    );
}

function displayServices() {
    // Afficher les services femmes
    const womenTbody = document.getElementById('women-services');
    womenTbody.innerHTML = '';
    
    for (const [name, details] of Object.entries(services.femmes)) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${details.court ? details.court + '€' : 'N/A'}</td>
            <td>${details.moyen ? details.moyen + '€' : 'N/A'}</td>
            <td>${details.long ? details.long + '€' : 'N/A'}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        // Ajouter les événements pour les boutons d'action
        row.querySelector('.edit').addEventListener('click', () => showEditServiceModal('femmes', name));
        row.querySelector('.delete').addEventListener('click', () => deleteService('femmes', name));
        
        womenTbody.appendChild(row);
    }
    
    // Afficher les services hommes
    const menTbody = document.getElementById('men-services');
    menTbody.innerHTML = '';
    
    for (const [name, details] of Object.entries(services.hommes)) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${details.unique ? details.unique + '€' : 'N/A'}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        // Ajouter les événements pour les boutons d'action
        row.querySelector('.edit').addEventListener('click', () => showEditServiceModal('hommes', name));
        row.querySelector('.delete').addEventListener('click', () => deleteService('hommes', name));
        
        menTbody.appendChild(row);
    }
}

// ======== STATISTIQUES ET TABLEAU DE BORD ========

function initStatisticsSection() {
    // Écouteur pour le changement de période
    document.getElementById('stats-period').addEventListener('change', updateStatistics);
    
    // Écouteur pour le bouton d'export
    document.getElementById('export-report-btn').addEventListener('click', exportReport);
    
    // Afficher les statistiques initiales
    updateStatistics();
}

function updateStatistics() {
    const period = document.getElementById('stats-period').value;
    
    // TODO: Implémenter les graphiques
    document.getElementById('revenue-chart').innerHTML = '<p>Graphique des revenus à venir</p>';
    document.getElementById('services-chart').innerHTML = '<p>Graphique des services à venir</p>';
    
    // Générer et afficher le rapport
    generateReport(period);
}

function generateReport(period) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Filtrer les réservations selon la période
    const now = new Date();
    const filteredReservations = reservations.filter(res => {
        const resDate = new Date(res.dateTime);
        
        switch(period) {
            case 'week':
                // Cette semaine
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
                startOfWeek.setHours(0, 0, 0, 0);
                
                return resDate >= startOfWeek;
                
            case 'month':
                // Ce mois
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                
                return resDate >= startOfMonth;
                
            case 'year':
                // Cette année
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                
                return resDate >= startOfYear;
                
            default:
                return true;
        }
    });
    
    // Grouper par catégorie et service
    const reportData = {};
    
    filteredReservations.forEach(res => {
        // Ignorer les réservations annulées
        if (res.status === 'cancelled') return;
        
        const category = res.category;
        const service = res.service;
        
        if (!reportData[category]) {
            reportData[category] = {};
        }
        
        if (!reportData[category][service]) {
            reportData[category][service] = {
                count: 0,
                revenue: 0
            };
        }
        
        reportData[category][service].count++;
        reportData[category][service].revenue += res.totalPrice;
    });
    
    // Afficher le rapport
    const tbody = document.getElementById('report-data');
    tbody.innerHTML = '';
    
    // Afficher un message si aucune donnée
    if (Object.keys(reportData).length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Aucune donnée pour cette période</td></tr>`;
        return;
    }
    
    // Remplir le tableau
    for (const [category, services] of Object.entries(reportData)) {
        for (const [service, data] of Object.entries(services)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category === 'femmes' ? 'Femmes' : 'Hommes'}</td>
                <td>${service}</td>
                <td>${data.count}</td>
                <td>${data.revenue}€</td>
            `;
            tbody.appendChild(row);
        }
    }
}

function exportReport() {
    // TODO: Implémenter l'export du rapport
    alert('Fonctionnalité dexport à venir !');
}

// ======== PARAMÈTRES ========

function initSettingsSection() {
    // Écouteurs pour les formulaires
    document.getElementById('salon-info-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSalonInfo();
    });
    
    document.getElementById('hours-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveOpeningHours();
    });
    
    document.getElementById('admin-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAdminAccount();
    });
    
    // Charger les données existantes
    loadSettings();
}

function saveSalonInfo() {
    const salonInfo = {
        name: document.getElementById('salon-name').value,
        phone: document.getElementById('salon-phone').value,
        address: document.getElementById('salon-address').value,
        description: document.getElementById('salon-description').value
    };
    
    // Sauvegarder dans localStorage
    localStorage.setItem('salon-info', JSON.stringify(salonInfo));
    
    alert('Informations du salon mises à jour !');
}

function saveOpeningHours() {
    const hours = {
        monday: {
            open: document.getElementById('monday-open').value,
            close: document.getElementById('monday-close').value
        },
        tuesday: {
            open: document.getElementById('tuesday-open').value,
            close: document.getElementById('tuesday-close').value
        },
        wednesday: {
            open: document.getElementById('wednesday-open').value,
            close: document.getElementById('wednesday-close').value
        },
        thursday: {
            open: document.getElementById('thursday-open').value,
            close: document.getElementById('thursday-close').value
        },
        friday: {
            open: document.getElementById('friday-open').value,
            close: document.getElementById('friday-close').value
        },
        saturday: {
            open: document.getElementById('saturday-open').value,
            close: document.getElementById('saturday-close').value
        },
        sunday: {
            status: document.getElementById('sunday-status').value,
            open: '10:00',
            close: '18:00'
        }
    };
    
    // Sauvegarder dans localStorage
    localStorage.setItem('opening-hours', JSON.stringify(hours));
    
    alert('Horaires d\'ouverture mis à jour !');
}

function saveAdminAccount() {
    const username = document.getElementById('admin-username').value;
    const email = document.getElementById('admin-email').value;
    const oldPassword = document.getElementById('admin-old-password').value;
    const newPassword = document.getElementById('admin-new-password').value;
    
    // Dans une application réelle, il faudrait vérifier l'ancien mot de passe
    // et crypter le nouveau mot de passe
    
    const adminAccount = {
        username,
        email,
        password: newPassword || 'admin' // Mot de passe par défaut
    };
    
    // Sauvegarder dans localStorage
    localStorage.setItem('admin-account', JSON.stringify(adminAccount));
    
    // Réinitialiser les champs de mot de passe
    document.getElementById('admin-old-password').value = '';
    document.getElementById('admin-new-password').value = '';
    
    alert('Compte administrateur mis à jour !');
}

function loadSettings() {
    // Charger les informations du salon
    const salonInfo = JSON.parse(localStorage.getItem('salon-info')) || {};
    document.getElementById('salon-name').value = salonInfo.name || 'FcHairsLyon';
    document.getElementById('salon-phone').value = salonInfo.phone || '';
    document.getElementById('salon-address').value = salonInfo.address || '';
    document.getElementById('salon-description').value = salonInfo.description || 'Votre spécialiste de la coiffure afro à Lyon';
    
    // Charger les horaires d'ouverture
    const hours = JSON.parse(localStorage.getItem('opening-hours')) || {};
    if (hours.monday) {
        document.getElementById('monday-open').value = hours.monday.open || '09:00';
        document.getElementById('monday-close').value = hours.monday.close || '19:00';
    }
    if (hours.tuesday) {
        document.getElementById('tuesday-open').value = hours.tuesday.open || '09:00';
        document.getElementById('tuesday-close').value = hours.tuesday.close || '19:00';
    }
    if (hours.wednesday) {
        document.getElementById('wednesday-open').value = hours.wednesday.open || '09:00';
        document.getElementById('wednesday-close').value = hours.wednesday.close || '19:00';
    }
    if (hours.thursday) {
        document.getElementById('thursday-open').value = hours.thursday.open || '09:00';
        document.getElementById('thursday-close').value = hours.thursday.close || '19:00';
    }
    if (hours.friday) {
        document.getElementById('friday-open').value = hours.friday.open || '09:00';
        document.getElementById('friday-close').value = hours.friday.close || '19:00';
    }
    if (hours.saturday) {
        document.getElementById('saturday-open').value = hours.saturday.open || '10:00';
        document.getElementById('saturday-close').value = hours.saturday.close || '18:00';
    }
    if (hours.sunday) {
        document.getElementById('sunday-status').value = hours.sunday.status || 'closed';
    }
    
    // Charger le compte admin
    const adminAccount = JSON.parse(localStorage.getItem('admin-account')) || {};
    document.getElementById('admin-username').value = adminAccount.username || 'admin';
    document.getElementById('admin-email').value = adminAccount.email || '';
}

// ======== FONCTIONS UTILITAIRES ========

function populateServiceSelect(category) {
    const serviceSelect = document.getElementById('service-select');
    serviceSelect.innerHTML = '<option value="" disabled selected>Choisir un service</option>';
    
    if (category) {
        for (const service of Object.keys(services[category])) {
            const option = document.createElement('option');
            option.value = service;
            option.textContent = service;
            serviceSelect.appendChild(option);
        }
    }
}

function populateModelSelect(service, category) {
    const modelSelect = document.getElementById('model-select');
    modelSelect.innerHTML = '<option value="" disabled selected>Choisir un modèle</option>';
    
    if (service && category) {
        const models = services[category][service];
        for (const [model, price] of Object.entries(models)) {
            if (model !== 'image') {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model === 'unique' ? 'Standard' : 
                                    model.charAt(0).toUpperCase() + model.slice(1);
                modelSelect.appendChild(option);
            }
        }
    }
}

function updatePriceInput() {
    const category = document.getElementById('service-category').value;
    const service = document.getElementById('service-select').value;
    const model = document.getElementById('model-select').value;
    const brushing = document.getElementById('brushing-option').checked;
    
    if (category && service && model) {
        let price = services[category][service][model];
        if (brushing) {
            price += 5;
        }
        document.getElementById('price-input').value = price;
    } else {
        document.getElementById('price-input').value = '';
    }
}

function showConfirmModal(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    confirmModal.style.display = 'flex';
    
    // Enregistrer le callback
    currentDeleteCallback = callback;
    
    // Écouteurs pour les boutons
    document.getElementById('confirm-yes-btn').onclick = function() {
        if (currentDeleteCallback) {
            currentDeleteCallback();
        }
    };
    
    document.getElementById('confirm-no-btn').onclick = function() {
        confirmModal.style.display = 'none';
    };
}

// ======== TABLEAU DE BORD ========

function displayDashboard() {
    displayUpcomingAppointments();
    displayPopularServices();
    updateDashboardStats();
    initCalendar();
}

function displayUpcomingAppointments() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Filtrer pour ne garder que les rendez-vous à venir
    const now = new Date();
    const upcomingReservations = reservations.filter(res => {
        const resDate = new Date(res.dateTime);
        return resDate > now && res.status !== 'cancelled';
    });
    
    // Trier par date (du plus proche au plus éloigné)
    upcomingReservations.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    
    // Limiter à 5 rendez-vous
// Limiter à 5 rendez-vous
const displayReservations = upcomingReservations.slice(0, 5);
    
const tbody = document.getElementById('upcoming-appointments');
tbody.innerHTML = '';

// Afficher un message si aucun rendez-vous
if (displayReservations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Aucun rendez-vous à venir</td></tr>`;
    return;
}

// Remplir le tableau
displayReservations.forEach((res, index) => {
    // Formater la date et l'heure
    const dateTime = new Date(res.dateTime);
    const formattedDate = dateTime.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const formattedTime = dateTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Déterminer la classe de statut
    let statusClass = '';
    let statusText = '';
    
    switch(res.status) {
        case 'pending':
            statusClass = 'status-pending';
            statusText = 'En attente';
            break;
        case 'confirmed':
            statusClass = 'status-confirmed';
            statusText = 'Confirmé';
            break;
        default:
            statusClass = 'status-pending';
            statusText = 'En attente';
    }
    
    // Créer la ligne
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${res.name}</td>
        <td>${res.service} (${res.model})</td>
        <td>${formattedDate} - ${formattedTime}</td>
        <td>${res.totalPrice}€</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>
            <div class="table-actions">
                <button class="action-btn view"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete"><i class="fas fa-trash"></i></button>
            </div>
        </td>
    `;
    
    // Ajouter les événements pour les boutons d'action
    const realIndex = reservations.findIndex(r => 
        r.service === res.service && 
        r.dateTime === res.dateTime &&
        r.phone === res.phone
    );
    
    row.querySelector('.view').addEventListener('click', () => viewAppointmentDetails(realIndex));
    row.querySelector('.edit').addEventListener('click', () => showEditAppointmentModal(realIndex));
    row.querySelector('.delete').addEventListener('click', () => deleteAppointment(realIndex));
    
    tbody.appendChild(row);
});
}

function displayPopularServices() {
const reservations = JSON.parse(localStorage.getItem('reservations')) || [];

// Compter les occurrences de chaque service
const serviceCounts = {};

reservations.forEach(res => {
    if (res.status !== 'cancelled') {
        const serviceKey = res.service;
        if (!serviceCounts[serviceKey]) {
            serviceCounts[serviceKey] = {
                name: res.service,
                category: res.category,
                count: 0,
                revenue: 0
            };
        }
        serviceCounts[serviceKey].count++;
        serviceCounts[serviceKey].revenue += res.totalPrice;
    }
});

// Convertir en tableau et trier par nombre de réservations
const popularServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count);

// Limiter à 5 services
const topServices = popularServices.slice(0, 5);

const container = document.getElementById('popular-services');
container.innerHTML = '';

// Afficher un message si aucun service
if (topServices.length === 0) {
    container.innerHTML = '<p style="text-align: center;">Aucune donnée disponible</p>';
    return;
}

// Afficher les services populaires
topServices.forEach(service => {
    const serviceItem = document.createElement('div');
    serviceItem.className = 'service-item';
    
    serviceItem.innerHTML = `
        <div class="service-icon">
            <i class="fas fa-cut"></i>
        </div>
        <div class="service-info">
            <div class="service-name">${service.name}</div>
            <div class="service-price">${service.count} réservation${service.count > 1 ? 's' : ''} - ${service.revenue}€</div>
        </div>
        <div class="service-actions">
            <button class="action-btn edit"><i class="fas fa-edit"></i></button>
        </div>
    `;
    
    // Ajouter un événement pour le bouton d'édition
    serviceItem.querySelector('.edit').addEventListener('click', () => {
        showEditServiceModal(service.category, service.name);
    });
    
    container.appendChild(serviceItem);
});
}

function updateDashboardStats() {
const reservations = JSON.parse(localStorage.getItem('reservations')) || [];

// Rendez-vous aujourd'hui
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todayAppointments = reservations.filter(res => {
    const resDate = new Date(res.dateTime);
    return resDate >= today && resDate < tomorrow && res.status !== 'cancelled';
}).length;

document.getElementById('today-appointments').textContent = todayAppointments;

// Revenus cette semaine
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi

const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 7); // Dimanche prochain

const weeklyRevenue = reservations.filter(res => {
    const resDate = new Date(res.dateTime);
    return resDate >= startOfWeek && resDate < endOfWeek && res.status !== 'cancelled';
}).reduce((sum, res) => sum + res.totalPrice, 0);

document.getElementById('weekly-revenue').textContent = weeklyRevenue + '€';

// Nouveaux clients ce mois
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

const phoneNumbersSet = new Set();
const monthlyClientsCount = reservations.filter(res => {
    const resDate = new Date(res.dateTime);
    if (resDate >= startOfMonth && resDate <= endOfMonth) {
        phoneNumbersSet.add(res.phone);
        return true;
    }
    return false;
}).length;

document.getElementById('monthly-clients').textContent = phoneNumbersSet.size;

// Croissance mensuelle (comparaison avec le mois précédent)
const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

const prevMonthRevenue = reservations.filter(res => {
    const resDate = new Date(res.dateTime);
    return resDate >= startOfPrevMonth && resDate <= endOfPrevMonth && res.status !== 'cancelled';
}).reduce((sum, res) => sum + res.totalPrice, 0);

const currentMonthRevenue = reservations.filter(res => {
    const resDate = new Date(res.dateTime);
    return resDate >= startOfMonth && resDate <= endOfMonth && res.status !== 'cancelled';
}).reduce((sum, res) => sum + res.totalPrice, 0);

let growthRate = 0;
if (prevMonthRevenue > 0) {
    growthRate = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
}

document.getElementById('growth-rate').textContent = growthRate.toFixed(0) + '%';
}

function initCalendar() {
const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

generateCalendar(currentMonth, currentYear);

// Écouteurs pour les boutons de navigation
document.getElementById('prev-month').addEventListener('click', () => {
    const monthTitle = document.getElementById('calendar-month-year').textContent;
    const [month, year] = monthTitle.split(' ');
    
    const monthIndex = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ].indexOf(month);
    
    const prevMonthIndex = monthIndex - 1;
    const prevYear = parseInt(year);
    
    if (prevMonthIndex < 0) {
        generateCalendar(11, prevYear - 1);
    } else {
        generateCalendar(prevMonthIndex, prevYear);
    }
});

document.getElementById('next-month').addEventListener('click', () => {
    const monthTitle = document.getElementById('calendar-month-year').textContent;
    const [month, year] = monthTitle.split(' ');
    
    const monthIndex = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ].indexOf(month);
    
    const nextMonthIndex = monthIndex + 1;
    const nextYear = parseInt(year);
    
    if (nextMonthIndex > 11) {
        generateCalendar(0, nextYear + 1);
    } else {
        generateCalendar(nextMonthIndex, nextYear);
    }
});
}

function generateCalendar(month, year) {
const calendarDays = document.getElementById('calendar-days');
calendarDays.innerHTML = '';

// Nom du mois et année
const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year}`;

// Premier jour du mois
const firstDay = new Date(year, month, 1);
// Dernier jour du mois
const lastDay = new Date(year, month + 1, 0);

// Jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, etc.)
let dayOfWeek = firstDay.getDay();
// Ajuster pour que la semaine commence le lundi
dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

// Récupérer les rendez-vous du mois
const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
const monthReservations = reservations.filter(res => {
    const resDate = new Date(res.dateTime);
    return resDate.getMonth() === month && resDate.getFullYear() === year && res.status !== 'cancelled';
});

// Calculer les jours avec des rendez-vous
const daysWithEvents = {};
monthReservations.forEach(res => {
    const day = new Date(res.dateTime).getDate();
    if (!daysWithEvents[day]) {
        daysWithEvents[day] = [];
    }
    daysWithEvents[day].push(res);
});

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
for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    // Jour actuel
    if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
        dayDiv.classList.add('today');
    }
    
    // Jours avec des rendez-vous
    if (daysWithEvents[i]) {
        dayDiv.classList.add('has-events');
    }
    
    dayDiv.textContent = i;
    
    // Ajouter un événement pour afficher les rendez-vous du jour
    dayDiv.addEventListener('click', () => {
        showDayAppointments(i, month, year);
    });
    
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

function showDayAppointments(day, month, year) {
const date = new Date(year, month, day);

// Formater la date
const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});

// Récupérer les rendez-vous de ce jour
const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
const dayReservations = reservations.filter(res => {
    const resDate = new Date(res.dateTime);
    return resDate.getDate() === day && 
           resDate.getMonth() === month && 
           resDate.getFullYear() === year && 
           res.status !== 'cancelled';
});

// Trier par heure
dayReservations.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

let content = `<h3>Rendez-vous du ${formattedDate}</h3>`;

if (dayReservations.length === 0) {
    content += `<p>Aucun rendez-vous pour ce jour.</p>`;
} else {
    content += `<ul class="day-appointments">`;
    dayReservations.forEach(res => {
        const time = new Date(res.dateTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        content += `
            <li>
                <strong>${time}</strong> - ${res.name}<br>
                ${res.service} (${res.model}) - ${res.totalPrice}€
            </li>
        `;
    });
    content += `</ul>`;
    
    content += `<button class="btn btn-primary day-add-btn">+ Ajouter un rendez-vous</button>`;
}

// Trouver l'index des réservations dans le tableau complet
const indexes = dayReservations.map(dayRes => {
    return reservations.findIndex(res => 
        res.service === dayRes.service && 
        res.dateTime === dayRes.dateTime &&
        res.phone === dayRes.phone
    );
});

// Afficher les détails
document.getElementById('details-content').innerHTML = content;
detailsModal.style.display = 'flex';

// Ajouter un écouteur pour le bouton de fermeture
document.getElementById('details-close-btn').addEventListener('click', function() {
    detailsModal.style.display = 'none';
});

// Ajouter un écouteur pour le bouton d'ajout de rendez-vous
const addBtn = document.querySelector('.day-add-btn');
if (addBtn) {
    addBtn.addEventListener('click', function() {
        // Fermer la modal de détails
        detailsModal.style.display = 'none';
        
        // Préparer la date pour le formulaire
        const formattedDateForInput = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Ouvrir la modal d'ajout de rendez-vous avec la date pré-remplie
        showAddAppointmentModal();
        document.getElementById('date-input').value = formattedDateForInput;
    });
}
}

// ======== INITIALISATION DE L'INTERFACE MODALES ========

function initModals() {
// Fermer les modales lorsqu'on clique sur le X
document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Fermer les modales lorsqu'on clique en dehors
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});
}

// ======== INITIALISATION GÉNÉRALE ========

// Lancer l'initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', init);