// Fonction pour récupérer les réservations d'un client
function getClientReservations(phone) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    return reservations.filter(res => res.phone === phone);
}

// Fonction pour récupérer les réservations à venir
function getUpcomingReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const now = new Date();
    
    return reservations.filter(res => {
        const resDate = new Date(res.dateTime);
        return resDate > now && res.status !== 'cancelled';
    });
}

// Fonction pour récupérer les réservations pour une date
function getReservationsForDate(date) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return reservations.filter(res => {
        const resDate = new Date(res.dateTime);
        return resDate.getDate() === targetDate.getDate() &&
               resDate.getMonth() === targetDate.getMonth() &&
               resDate.getFullYear() === targetDate.getFullYear() &&
               res.status !== 'cancelled';
    });
}

// Fonction pour calculer les créneaux disponibles pour une date
function getAvailableTimeSlotsForDate(date) {
    const dayReservations = getReservationsForDate(date);
    const dateParts = date.split('-');
    const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    
    // Vérifier si c'est un dimanche (jour 0)
    if (targetDate.getDay() === 0) {
        return []; // Pas de créneaux disponibles le dimanche
    }
    
    // Heures d'ouverture
    const openingHour = targetDate.getDay() === 6 ? 10 : 9; // 10h le samedi, 9h les autres jours
    const closingHour = targetDate.getDay() === 6 ? 18 : 19; // 18h le samedi, 19h les autres jours
    
    const availableSlots = [];
    const takenTimes = {};
    
    // Marquer les créneaux déjà pris
    dayReservations.forEach(res => {
        const resTime = new Date(res.dateTime);
        const hour = resTime.getHours();
        const minute = resTime.getMinutes();
        const timeKey = `${hour}:${minute}`;
        
        // Estimer la durée du service
        let duration = 60; // 1 heure par défaut
        
        if (res.service === 'Braids' || res.service === 'Twist') {
            if (res.model === 'court') duration = 120; // 2 heures
            else if (res.model === 'moyen') duration = 180; // 3 heures
            else if (res.model === 'long') duration = 240; // 4 heures
        } else if (res.service === 'Fulani Braids') {
            if (res.model === 'court') duration = 150; // 2.5 heures
            else if (res.model === 'moyen') duration = 210; // 3.5 heures
            else if (res.model === 'long') duration = 270; // 4.5 heures
        } else if (res.service === 'Invisible Locs') {
            if (res.model === 'moyen') duration = 180; // 3 heures
            else if (res.model === 'long') duration = 240; // 4 heures
        }
        
        // Marquer les créneaux de 30 minutes pendant la durée du service
        for (let i = 0; i < duration; i += 30) {
            const blockTime = new Date(resTime);
            blockTime.setMinutes(minute + i);
            const blockHour = blockTime.getHours();
            const blockMinute = blockTime.getMinutes();
            takenTimes[`${blockHour}:${blockMinute}`] = true;
        }
    });
    
    // Générer les créneaux disponibles de 30 minutes
    for (let hour = openingHour; hour < closingHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeKey = `${hour}:${minute}`;
            
            // Vérifier si le créneau est disponible
            if (!takenTimes[timeKey]) {
                // Créer la date avec l'heure et les minutes
                const slotDate = new Date(targetDate);
                slotDate.setHours(hour, minute, 0, 0);
                
                // Ajouter le créneau disponible
                availableSlots.push({
                    time: slotDate.toISOString(),
                    displayTime: slotDate.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                });
            }
        }
    }
    
    return availableSlots;
}

// Fonction pour suggérer des créneaux disponibles autour d'une date
function suggestAvailableTimeSlots(targetDate, daysToCheck = 7) {
    const suggestions = [];
    
    // Vérifier la date cible et les jours suivants
    for (let i = 0; i < daysToCheck; i++) {
        const date = new Date(targetDate);
        date.setDate(date.getDate() + i);
        
        // Formater la date en YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Récupérer les créneaux disponibles pour cette date
        const availableSlots = getAvailableTimeSlotsForDate(formattedDate);
        
        if (availableSlots.length > 0) {
            suggestions.push({
                date: formattedDate,
                displayDate: date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                }),
                slots: availableSlots
            });
        }
    }
    
    return suggestions;
}

// Fonction pour récupérer les statistiques du salon
function getSalonStatistics() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Filtrer les réservations non annulées
    const validReservations = reservations.filter(res => res.status !== 'cancelled');
    
  // Statistiques générales
  const stats = {
    total: validReservations.length,
    totalRevenue: validReservations.reduce((sum, res) => sum + res.totalPrice, 0),
    clients: [...new Set(validReservations.map(res => res.phone))].length
};

// Statistiques par service
const serviceStats = {};
validReservations.forEach(res => {
    if (!serviceStats[res.service]) {
        serviceStats[res.service] = {
            count: 0,
            revenue: 0
        };
    }
    
    serviceStats[res.service].count++;
    serviceStats[res.service].revenue += res.totalPrice;
});

// Statistiques par jour de la semaine
const dayStats = {
    0: 0, // Dimanche
    1: 0, // Lundi
    2: 0, // Mardi
    3: 0, // Mercredi
    4: 0, // Jeudi
    5: 0, // Vendredi
    6: 0  // Samedi
};

validReservations.forEach(res => {
    const day = new Date(res.dateTime).getDay();
    dayStats[day]++;
});

// Statistiques par mois
const monthStats = {};
validReservations.forEach(res => {
    const date = new Date(res.dateTime);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    
    if (!monthStats[key]) {
        monthStats[key] = {
            count: 0,
            revenue: 0,
            displayName: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        };
    }
    
    monthStats[key].count++;
    monthStats[key].revenue += res.totalPrice;
});

return {
    general: stats,
    services: serviceStats,
    days: dayStats,
    months: monthStats
};
}

// Fonction pour exporter les données des réservations en CSV
function exportReservationsToCSV() {
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

// Fonction pour vérifier si un rendez-vous chevauche avec des rendez-vous existants
function checkOverlappingAppointments(dateTime, duration, excludeId = null) {
const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
const newStart = new Date(dateTime);
const newEnd = new Date(newStart.getTime() + duration * 60000); // Convertir minutes en millisecondes

// Vérifier chaque réservation existante
for (let i = 0; i < reservations.length; i++) {
    // Ignorer la réservation à exclure (lors d'une modification)
    if (excludeId !== null && i === excludeId) {
        continue;
    }
    
    // Ignorer les réservations annulées
    if (reservations[i].status === 'cancelled') {
        continue;
    }
    
    // Estimer la durée du service existant
    let existingDuration = 60; // 1 heure par défaut
    
    if (reservations[i].service === 'Braids' || reservations[i].service === 'Twist') {
        if (reservations[i].model === 'court') existingDuration = 120; // 2 heures
        else if (reservations[i].model === 'moyen') existingDuration = 180; // 3 heures
        else if (reservations[i].model === 'long') existingDuration = 240; // 4 heures
    } else if (reservations[i].service === 'Fulani Braids') {
        if (reservations[i].model === 'court') existingDuration = 150; // 2.5 heures
        else if (reservations[i].model === 'moyen') existingDuration = 210; // 3.5 heures
        else if (reservations[i].model === 'long') existingDuration = 270; // 4.5 heures
    } else if (reservations[i].service === 'Invisible Locs') {
        if (reservations[i].model === 'moyen') existingDuration = 180; // 3 heures
        else if (reservations[i].model === 'long') existingDuration = 240; // 4 heures
    }
    
    const existingStart = new Date(reservations[i].dateTime);
    const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);
    
    // Vérifier si les réservations se chevauchent
    if ((newStart < existingEnd && newEnd > existingStart)) {
        return {
            overlaps: true,
            reservation: reservations[i]
        };
    }
}

return { overlaps: false };
}

// Fonction pour estimer la durée d'un service en minutes
function estimateServiceDuration(service, model) {
// Durées en minutes
if (service === 'Braids' || service === 'Twist') {
    if (model === 'court') return 120; // 2 heures
    else if (model === 'moyen') return 180; // 3 heures
    else if (model === 'long') return 240; // 4 heures
} else if (service === 'Fulani Braids') {
    if (model === 'court') return 150; // 2.5 heures
    else if (model === 'moyen') return 210; // 3.5 heures
    else if (model === 'long') return 270; // 4.5 heures
} else if (service === 'Invisible Locs') {
    if (model === 'moyen') return 180; // 3 heures
    else if (model === 'long') return 240; // 4 heures
} else if (service === 'Nattes collées simple') {
    return 60; // 1 heure
} else if (service === 'Nattes collées avec rajout') {
    return 90; // 1.5 heures
} else if (service === 'Barrel Twist' || service === 'Vanilles' || service === 'Fulani') {
    return 90; // 1.5 heures
} else if (service === 'Départ de locks' || service === 'Retwist') {
    return 120; // 2 heures
}

return 60; // Durée par défaut: 1 heure
}

// Fonction pour formater une date en français
function formatDateFR(date) {
if (typeof date === 'string') {
    date = new Date(date);
}

return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
}

// Fonction pour formater une heure en français
function formatTimeFR(date) {
if (typeof date === 'string') {
    date = new Date(date);
}

return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
});
}

// Fonction pour générer un ID unique pour une réservation
function generateReservationId() {
return 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Fonction pour envoyer une notification par email (réelle via EmailJS)
function sendNotificationEmail(reservation, type) {
  // Prépare les variables communes
  const formattedDate = formatDateFR(reservation.dateTime);
  const formattedTime = formatTimeFR(reservation.dateTime);
  const brushing = reservation.brushing ? 'Oui' : 'Non';

  // 1. Email admin
  emailjs.send('service_pb6i83k', 'template_9o6on07', {
    name: reservation.name,
    email: reservation.email,
    phone: reservation.phone,
    service_name: reservation.service,
    service_model: reservation.model,
    reservation_date: formattedDate,
    reservation_time: formattedTime,
    total_price: reservation.totalPrice,
    brushing: brushing,
    notes: reservation.notes || ''
  });

  // 2. Email client
  emailjs.send('service_pb6i83k', 'template_zt7aabh', {
    email: reservation.email,
    name: reservation.name,
    service_name: reservation.service,
    service_model: reservation.model,
    reservation_date: formattedDate,
    reservation_time: formattedTime,
    total_price: reservation.totalPrice,
    brushing: brushing,
    notes: reservation.notes || ''
  });

  return true;
}

// Fonction pour envoyer un SMS de confirmation (simulée)
function sendSmsNotification(reservation, type) {
console.log(`SMS notification (${type}) would be sent to: ${reservation.phone}`);

// Dans une application réelle, cette fonction enverrait un SMS via une API
// Pour l'instant, elle ne fait rien de plus que journaliser l'action

return true; // Succès (simulé)
}

// Fonction pour générer un récapitulatif de réservation
function generateReservationSummary(reservation) {
const date = new Date(reservation.dateTime);
const formattedDate = formatDateFR(date);
const formattedTime = formatTimeFR(date);

let summary = `<div class="reservation-summary">`;
summary += `<h3>Récapitulatif de votre réservation</h3>`;
summary += `<p><strong>Service:</strong> ${reservation.service}</p>`;

if (reservation.model !== 'unique') {
    const modelDisplay = reservation.model.charAt(0).toUpperCase() + reservation.model.slice(1);
    summary += `<p><strong>Modèle/Longueur:</strong> ${modelDisplay}</p>`;
}

if (reservation.brushing) {
    summary += `<p><strong>Option:</strong> Brushing (+5€)</p>`;
}

summary += `<p><strong>Prix total:</strong> ${reservation.totalPrice}€</p>`;
summary += `<p><strong>Date:</strong> ${formattedDate}</p>`;
summary += `<p><strong>Heure:</strong> ${formattedTime}</p>`;

if (reservation.notes) {
    summary += `<p><strong>Notes:</strong> ${reservation.notes}</p>`;
}

summary += `</div>`;

return summary;
}

