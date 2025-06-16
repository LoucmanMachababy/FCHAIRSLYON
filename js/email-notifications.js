// Service de Notifications par Email pour FcHairsLyon

class EmailNotificationService {
    constructor() {
        // Configuration de base
        this.adminEmail = 'manoushka779@gmail.com';
        this.supportEmail = 'support@fchairslyon.com';
    }

    // Modèles d'emails
    generateEmailTemplate(type, data) {
        switch(type) {
            case 'reservation_confirmation':
                return {
                    subject: 'Confirmation de votre réservation - FcHairsLyon',
                    body: `
                        Bonjour ${data.name},

                        Votre réservation a été confirmée :

                        Détails de la réservation :
                        - Service : ${data.service}
                        - Modèle : ${data.model}
                        - Date : ${new Date(data.dateTime).toLocaleDateString('fr-FR')}
                        - Heure : ${new Date(data.dateTime).toLocaleTimeString('fr-FR')}
                        - Prix : ${data.totalPrice}€

                        Merci de votre confiance,
                        L'équipe FcHairsLyon
                    `
                };

            case 'reservation_reminder':
                return {
                    subject: 'Rappel de votre rendez-vous - FcHairsLyon',
                    body: `
                        Bonjour ${data.name},

                        Un rappel pour votre rendez-vous :

                        Détails de la réservation :
                        - Service : ${data.service}
                        - Modèle : ${data.model}
                        - Date : ${new Date(data.dateTime).toLocaleDateString('fr-FR')}
                        - Heure : ${new Date(data.dateTime).toLocaleTimeString('fr-FR')}

                        À bientôt,
                        L'équipe FcHairsLyon
                    `
                };

            case 'reservation_cancellation':
                return {
                    subject: 'Annulation de votre réservation - FcHairsLyon',
                    body: `
                        Bonjour ${data.name},

                        Votre réservation a été annulée :

                        Détails de la réservation :
                        - Service : ${data.service}
                        - Date : ${new Date(data.dateTime).toLocaleDateString('fr-FR')}
                        - Heure : ${new Date(data.dateTime).toLocaleTimeString('fr-FR')}

                        Si cette annulation n'est pas de votre fait, merci de nous contacter.

                        L'équipe FcHairsLyon
                    `
                };

            default:
                throw new Error('Type de notification non reconnu');
        }
    }

    // Méthode pour envoyer un email (simulation)
    async sendEmail(recipient, type, data) {
        try {
            // Dans une implémentation réelle, vous utiliseriez une API d'envoi d'emails
            const emailTemplate = this.generateEmailTemplate(type, data);

            // Simulation d'envoi d'email
            console.log('Email envoyé:', {
                to: recipient,
                subject: emailTemplate.subject,
                body: emailTemplate.body
            });

            // TODO: Remplacer par un vrai service d'envoi d'email
            // Options possibles :
            // - Nodemailer avec Gmail/SMTP
            // - SendGrid
            // - Mailgun
            // - Amazon SES

            return {
                success: true,
                message: 'Email envoyé avec succès'
            };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            return {
                success: false,
                message: 'Échec de l\'envoi de l\'email'
            };
        }
    }

    // Méthode pour envoyer des notifications administratives
    async sendAdminNotification(type, data) {
        try {
            const emailTemplate = {
                subject: 'Notification Administrative - FcHairsLyon',
                body: `
                    Nouvelle notification administrative :

                    Type : ${type}
                    Détails : ${JSON.stringify(data, null, 2)}

                    Cordialement,
                    Système de notification FcHairsLyon
                `
            };

            console.log('Notification admin:', {
                to: this.adminEmail,
                subject: emailTemplate.subject,
                body: emailTemplate.body
            });

            return {
                success: true,
                message: 'Notification administrative envoyée'
            };
        } catch (error) {
            console.error('Erreur de notification admin:', error);
            return {
                success: false,
                message: 'Échec de l\'envoi de la notification admin'
            };
        }
    }

    // Méthode utilitaire pour valider un email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
}

// Créer une instance du service
const emailNotificationService = new EmailNotificationService();

// Exemple d'utilisation
function exampleUsage() {
    // Données de réservation de test
    const reservationData = {
        name: 'Marie Dupont',
        service: 'Braids',
        model: 'long',
        dateTime: new Date().toISOString(),
        totalPrice: 50
    };

    // Envoyer une confirmation de réservation
    emailNotificationService.sendEmail(
        'client@example.com', 
        'reservation_confirmation', 
        reservationData
    );

    // Envoyer une notification admin
    emailNotificationService.sendAdminNotification(
        'nouvelle_reservation', 
        reservationData
    );
}

// Exporter le service (pas besoin de 'export default' en mode non-module)
window.emailNotificationService = emailNotificationService;