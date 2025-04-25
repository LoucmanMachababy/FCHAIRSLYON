// cleanup-demo-data.js
// Ce script supprime toutes les données de démonstration (faux clients et statistiques)

// Fonction à exécuter au chargement
function cleanupDemoData() {
    console.log("Nettoyage des données de démonstration...");
    
    // 1. Supprimer les réservations de démonstration
    localStorage.removeItem('reservations');
    console.log("✓ Réservations de démonstration supprimées");
    
    // 2. Supprimer les clients de démonstration
    localStorage.removeItem('clients');
    console.log("✓ Clients de démonstration supprimés");
    
    // 3. Nettoyer les données de statistiques
    localStorage.removeItem('stats');
    console.log("✓ Statistiques de démonstration supprimées");
    
    // 4. Disponibilités
    // Si vous voulez conserver vos disponibilités actuelles, commentez cette ligne
    localStorage.removeItem('fchairs_availabilities');
    console.log("✓ Disponibilités de démonstration supprimées");
    
    // 5. Nettoyer d'autres données potentielles de démo
    const keysToClean = [
        'demo_data',
        'sample_data',
        'test_reservations',
        'monthly_stats',
        'demo_config'
    ];
    
    keysToClean.forEach(key => {
        localStorage.removeItem(key);
    });
    
    console.log("✓ Autres données de démonstration supprimées");
    console.log("Nettoyage terminé! La page va maintenant se recharger.");
    
    // Actualiser la page pour refléter les changements
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Exécuter immédiatement
cleanupDemoData();