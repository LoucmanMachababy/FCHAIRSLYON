// Ce fichier contient des fonctions supplémentaires pour le tableau de bord administrateur
// Il est chargé après admin.js

// Fonction pour générer des données de test (pour la démo)
function generateDemoData() {
    // Vérifier s'il y a déjà des données
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    if (reservations.length > 0) {
        // Déjà des données, pas besoin d'en générer
        return;
    }
    
    // Noms de clients
    const clients = [
        { name: 'Marie Dupont', phone: '0601020304' },
        { name: 'Sophie Martin', phone: '0607080910' },
        { name: 'Thomas Bernard', phone: '0612131415' },
        { name: 'Julie Petit', phone: '0616171819' },
        { name: 'Lisa Moreau', phone: '0620212223' },
        { name: 'Camille Dubois', phone: '0624252627' },
        { name: 'Emma Leroy', phone: '0628293031' },
        { name: 'Lucas Girard', phone: '0632333435' },
        { name: 'Léa Fontaine', phone: '0636373839' },
        { name: 'Nathan Rousseau', phone: '0640414243' }
    ];
    
    // Services femmes
    const femmeServices = [
        { service: 'Braids', models: ['court', 'moyen', 'long'] },
        { service: 'Twist', models: ['court', 'moyen', 'long'] },
        { service: 'Fulani Braids', models: ['court', 'moyen', 'long'] },
        { service: 'Invisible Locs', models: ['moyen', 'long'] },
        { service: 'Nattes collées simple', models: ['unique'] },
        { service: 'Nattes collées avec rajout', models: ['unique'] }
    ];
    
    // Services hommes
    const hommeServices = [
        { service: 'Nattes collées simple', models: ['unique'] },
        { service: 'Nattes collées avec modèle', models: ['unique'] },
        { service: 'Vanilles', models: ['unique'] },
        { service: 'Fulani', models: ['unique'] },
        { service: 'Barrel Twist', models: ['unique'] },
        { service: 'Départ de locks', models: ['unique'] },
        { service: 'Retwist', models: ['unique'] }
    ];
    
    // Statuts
    const statuses = ['pending', 'confirmed', 'cancelled'];
    
    // Générer 50 réservations aléatoires sur les 3 derniers mois
    const now = new Date();
    const demoReservations = [];
    
    for (let i = 0; i < 50; i++) {
        // Client aléatoire
        const client = clients[Math.floor(Math.random() * clients.length)];
        
        // Date aléatoire (entre aujourd'hui et il y a 3 mois)
        const date = new Date();
        date.setDate(now.getDate() - Math.floor(Math.random() * 90));
        
        // Heure aléatoire (entre 9h et 18h)
        date.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
        
        // Catégorie et service aléatoires
        const isWoman = Math.random() > 0.4; // 60% de chances d'être une femme
        const category = isWoman ? 'femmes' : 'hommes';
        const serviceList = isWoman ? femmeServices : hommeServices;
        const serviceObj = serviceList[Math.floor(Math.random() * serviceList.length)];
        const service = serviceObj.service;
        
        // Modèle aléatoire
        const model = serviceObj.models[Math.floor(Math.random() * serviceObj.models.length)];
        
        // Prix selon le service et le modèle
        let price = 0;
        if (isWoman) {
            if (service === 'Braids' || service === 'Twist') {
                if (model === 'court') price = 30;
                else if (model === 'moyen') price = 40;
                else if (model === 'long') price = 50;
            } else if (service === 'Fulani Braids') {
                if (model === 'court') price = 30;
                else if (model === 'moyen') price = 40;
                else if (model === 'long') price = 45;
            } else if (service === 'Invisible Locs') {
                if (model === 'moyen') price = 35;
                else if (model === 'long') price = 45;
            } else if (service === 'Nattes collées simple') {
                price = 15;
            } else if (service === 'Nattes collées avec rajout') {
                price = 20;
            }
        } else {
            if (service === 'Nattes collées simple') {
                price = 10;
            } else if (service === 'Nattes collées avec modèle' || service === 'Vanilles' || service === 'Fulani') {
                price = 15;
            } else if (service === 'Barrel Twist') {
                price = 25;
            } else if (service === 'Départ de locks' || service === 'Retwist') {
                price = 30;
            }
        }
        
        // Brushing aléatoire (20% de chances)
        const brushing = Math.random() < 0.2;
        if (brushing) {
            price += 5;
        }
        
        // Statut aléatoire
        const status = statuses[Math.floor(Math.random() * (date < now ? 3 : 2))]; // Les rendez-vous futurs ne peuvent pas être annulés
        
        // Créer la réservation
        const reservation = {
            name: client.name,
            phone: client.phone,
            service: service,
            category: category,
            model: model,
            brushing: brushing,
            totalPrice: price,
            dateTime: date.toISOString(),
            status: status,
            notes: '',
            createdAt: new Date(date.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), // Créé une semaine avant
            updatedAt: new Date(date.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString() // Mis à jour 3 jours avant
        };
        
        demoReservations.push(reservation);
    }
    
    // Sauvegarder les réservations
    localStorage.setItem('reservations', JSON.stringify(demoReservations));

}

// Fonction pour générer un graphique de revenus
function generateRevenueChart(containerId, data) {
    const container = document.getElementById(containerId);
    
    // Vérifier si le conteneur existe
    if (!container) {
        console.error(`Conteneur ${containerId} non trouvé !`);
        return;
    }
    
    // Pour une démo, on simule un graphique avec du HTML/CSS
    let html = '<div class="chart-wrapper">';
    
    // Axe Y
    html += '<div class="chart-y-axis">';
    for (let i = 5; i >= 0; i--) {
        html += `<div class="chart-y-label">${i * 200}€</div>`;
    }
    html += '</div>';
    
    // Graphique
    html += '<div class="chart-bars">';
    
    // Générer 7 barres aléatoires (pour la démo)
    for (let i = 0; i < 7; i++) {
        const height = Math.floor(Math.random() * 80) + 20; // Entre 20% et 100%
        const day = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i];
        
        html += `
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${height}%" title="${height * 10}€"></div>
                <div class="chart-x-label">${day}</div>
            </div>
        `;
    }
    
    html += '</div>'; // Fin chart-bars
    html += '</div>'; // Fin chart-wrapper
    
    // Injecter le HTML
    container.innerHTML = html;
    
    // Ajouter le style si nécessaire
    if (!document.getElementById('chart-style')) {
        const style = document.createElement('style');
        style.id = 'chart-style';
        style.textContent = `
            .chart-wrapper {
                display: flex;
                height: 300px;
                margin-top: 20px;
            }
            
            .chart-y-axis {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding-right: 10px;
                text-align: right;
                border-right: 1px solid #ccc;
            }
            
            .chart-y-label {
                font-size: 0.8rem;
                color: #666;
            }
            
            .chart-bars {
                display: flex;
                justify-content: space-around;
                align-items: flex-end;
                flex-grow: 1;
                padding: 0 10px;
                height: 100%;
            }
            
            .chart-bar-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 40px;
            }
            
            .chart-bar {
                width: 30px;
                background-color: #FFE0E8;
                border-radius: 3px 3px 0 0;
                margin-bottom: 5px;
                transition: all 0.3s ease;
            }
            
            .chart-bar:hover {
                background-color: #ffb2d9;
            }
            
            .chart-x-label {
                font-size: 0.8rem;
                color: #666;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Fonction pour générer un graphique camembert des services
function generateServicesChart(containerId, data) {
    const container = document.getElementById(containerId);
    
    // Vérifier si le conteneur existe
    if (!container) {
        console.error(`Conteneur ${containerId} non trouvé !`);
        return;
    }
    
    // Pour une démo, on simule un graphique avec du HTML/CSS
    let html = '<div class="pie-chart-container">';
    
    // Graphique camembert
    html += '<div class="pie-chart">';
    
    // Générer 5 segments aléatoires (pour la démo)
// Générer 5 segments aléatoires (pour la démo)
const colors = ['#FFE0E8', '#ffb2d9', '#ff85c0', '#ff57a6', '#ff2a8d'];
const services = ['Braids', 'Twist', 'Fulani Braids', 'Nattes collées', 'Autres'];
const percentages = [];

// Générer des pourcentages aléatoires
let total = 0;
for (let i = 0; i < 4; i++) {
    const percent = Math.floor(Math.random() * 25) + 5; // Entre 5% et 30%
    percentages.push(percent);
    total += percent;
}

// Le dernier pourcentage complète pour arriver à 100%
percentages.push(100 - total);

// Créer les segments du camembert
let cumulativePercentage = 0;

for (let i = 0; i < 5; i++) {
    const startPercent = cumulativePercentage;
    const endPercent = cumulativePercentage + percentages[i];
    
    // Convertir les pourcentages en degrés
    const startDegree = startPercent * 3.6; // 360 / 100 = 3.6
    const endDegree = endPercent * 3.6;
    
    // Ajouter le segment au camembert
    html += `
        <div class="pie-segment" style="
            background-image: linear-gradient(${startDegree}deg, transparent 50%, ${colors[i]} 50%),
                               linear-gradient(${endDegree}deg, ${colors[i]} 50%, transparent 50%);
        " title="${services[i]}: ${percentages[i]}%"></div>
    `;
    
    cumulativePercentage = endPercent;
}

html += '</div>'; // Fin pie-chart

// Légende
html += '<div class="pie-legend">';

for (let i = 0; i < 5; i++) {
    html += `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${colors[i]};"></div>
            <div class="legend-label">${services[i]} (${percentages[i]}%)</div>
        </div>
    `;
}

html += '</div>'; // Fin pie-legend
html += '</div>'; // Fin pie-chart-container

// Injecter le HTML
container.innerHTML = html;

// Ajouter le style si nécessaire
if (!document.getElementById('pie-chart-style')) {
    const style = document.createElement('style');
    style.id = 'pie-chart-style';
    style.textContent = `
        .pie-chart-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 300px;
            margin-top: 20px;
        }
        
        .pie-chart {
            position: relative;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            overflow: hidden;
            background-color: #f5f5f5;
        }
        
        .pie-segment {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .pie-legend {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 20px;
            gap: 10px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            margin-right: 15px;
        }
        
        .legend-color {
            width: 15px;
            height: 15px;
            border-radius: 3px;
            margin-right: 5px;
        }
        
        .legend-label {
            font-size: 0.8rem;
            color: #666;
        }
    `;
    
    document.head.appendChild(style);
}
}

// Fonction pour exporter les données en CSV
function exportToCSV(data, filename) {
// Convertir les données en format CSV
let csv = '';

// Entêtes
const headers = Object.keys(data[0]);
csv += headers.join(',') + '\n';

// Données
data.forEach(item => {
    const row = headers.map(header => {
        let value = item[header];
        
        // Échapper les virgules et les guillemets
        if (typeof value === 'string') {
            value = value.replace(/"/g, '""');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = `"${value}"`;
            }
        }
        
        return value;
    });
    
    csv += row.join(',') + '\n';
});

// Créer un Blob et un lien de téléchargement
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);

const link = document.createElement('a');
link.setAttribute('href', url);
link.setAttribute('download', filename || 'export.csv');
link.style.visibility = 'hidden';

document.body.appendChild(link);
link.click();
document.body.removeChild(link);
}

// Fonction pour générer un rapport Excel (simulé pour la démo)
function exportReport() {
// Récupérer les données du rapport
const reservations = JSON.parse(localStorage.getItem('reservations')) || [];

// Filtrer les réservations valides
const validReservations = reservations.filter(res => res.status !== 'cancelled');

// Préparer les données pour l'export
const exportData = validReservations.map(res => {
    const date = new Date(res.dateTime);
    
    return {
        Date: date.toLocaleDateString('fr-FR'),
        Heure: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        Client: res.name,
        Téléphone: res.phone,
        Service: res.service,
        Modèle: res.model,
        Brushing: res.brushing ? 'Oui' : 'Non',
        Prix: res.totalPrice + '€',
        Statut: res.status === 'confirmed' ? 'Confirmé' : 'En attente'
    };
});

// Exporter en CSV
exportToCSV(exportData, 'rapport_fchairslyon.csv');
}

// Fonction pour mettre à jour automatiquement le tableau de bord
function setupDashboardUpdates() {
// Mettre à jour le tableau de bord toutes les 5 minutes
setInterval(() => {
    updateDashboardStats();
    displayUpcomingAppointments();
}, 5 * 60 * 1000);
}

// Fonctions d'authentification (simulées pour la démo)
function checkAdminAuth() {
// Dans une application réelle, cela vérifierait si l'utilisateur est connecté
// Pour la démo, on vérifie simplement si le mot de passe admin est stocké
const adminAccount = JSON.parse(localStorage.getItem('admin-account'));
const isLoggedIn = sessionStorage.getItem('admin-logged-in');

if (!isLoggedIn) {
    // Rediriger vers la page de connexion
    // Pour la démo, on affiche simplement un formulaire de connexion
    showLoginForm();
    return false;
}

return true;
}

function showLoginForm() {
// Créer un formulaire de connexion
const loginForm = document.createElement('div');
loginForm.className = 'login-container';

loginForm.innerHTML = `
    <div class="login-box">
        <div class="login-header">
            <img src="assets/images/logo.png" alt="FcHairsLyon Logo" class="login-logo">
            <h2>FcHairsLyon</h2>
            <p>Administration</p>
        </div>
        
        <form id="login-form">
            <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input type="text" id="username" class="form-input" value="admin" required>
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" class="form-input" required>
            </div>
            
            <div id="login-error" class="login-error"></div>
            
            <button type="submit" class="form-button">Se connecter</button>
        </form>
    </div>
`;

// Ajouter le style du formulaire
const loginStyle = document.createElement('style');
loginStyle.textContent = `
    .login-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }
    
    .login-box {
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        padding: 30px;
        width: 90%;
        max-width: 400px;
    }
    
    .login-header {
        text-align: center;
        margin-bottom: 20px;
    }
    
    .login-logo {
        width: 80px;
        margin-bottom: 10px;
    }
    
    .login-error {
        color: #F44336;
        margin-bottom: 15px;
        font-size: 0.9rem;
        min-height: 20px;
    }
`;

document.head.appendChild(loginStyle);
document.body.appendChild(loginForm);

// Gérer la soumission du formulaire
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Pour la démo, le mot de passe est "admin"
    if (username === 'admin' && password === 'admin') {
        // Sauvegarder l'état de connexion
        sessionStorage.setItem('admin-logged-in', 'true');
        
        // Supprimer le formulaire
        document.body.removeChild(loginForm);
        
        // Recharger la page
        window.location.reload();
    } else {
        // Afficher une erreur
        document.getElementById('login-error').textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
    }
});
}

// Initialisation du tableau de bord au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
// Vérifier l'authentification
if (!checkAdminAuth()) {
    return;
}

// Générer des données de test si nécessaire
if (!localStorage.getItem('reservations')) {
    generateDemoData();
}

// Générer les graphiques
generateRevenueChart('revenue-chart');
generateServicesChart('services-chart');

// Configurer les mises à jour automatiques
setupDashboardUpdates();

// Ajouter un écouteur pour le bouton d'export
document.getElementById('export-report-btn').addEventListener('click', exportReport);
});

// Détection de déconnexion par inactivité
let inactivityTimer;

function resetInactivityTimer() {
clearTimeout(inactivityTimer);
inactivityTimer = setTimeout(() => {
    // Déconnecter après 30 minutes d'inactivité
    if (confirm('Vous avez été inactif pendant 30 minutes. Voulez-vous rester connecté ?')) {
        resetInactivityTimer();
    } else {
        // Déconnecter
        sessionStorage.removeItem('admin-logged-in');
        window.location.reload();
    }
}, 30 * 60 * 1000); // 30 minutes
}

// Surveiller l'activité de l'utilisateur
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Initialiser le timer
resetInactivityTimer();
