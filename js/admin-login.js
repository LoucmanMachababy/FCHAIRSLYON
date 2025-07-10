// Code pour gérer la connexion à l'interface d'administration
// === Connexion admin avec identifiants dynamiques ===
const ADMIN_STORAGE_KEY = 'fchairs_admin_credentials';
function getAdminCredentials() {
  const creds = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (creds) return JSON.parse(creds);
  return { username: 'admin', password: 'admin123' };
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("Script admin-login.js chargé");
    const adminLoginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    
    if (adminLoginForm) {
        console.log("Formulaire de connexion trouvé");
        // Identifiants par défaut (à modifier pour un environnement de production)
        const DEFAULT_USERNAME = "admin";
        const DEFAULT_PASSWORD = "admin";
        
        adminLoginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("Soumission du formulaire");
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const creds = getAdminCredentials();
            
            console.log("Vérification des identifiants");
            // Vérification des identifiants
            if (username === creds.username && password === creds.password) {
                // Identifiants corrects, on stocke l'état de connexion
                console.log("Identifiants corrects");
                try {
                    sessionStorage.setItem('admin-logged-in', '1');
                    console.log("Session stockée:", sessionStorage.getItem('admin-logged-in'));
                    
                    // Redirection vers la page d'administration
                    console.log("Redirection en cours...");
                    
                    // Tentative avec chemin relatif simple
                    window.location.href = 'admin.html';
                } catch(e) {
                    console.error("Erreur lors de la redirection:", e);
                }
            } else {
                // Identifiants incorrects, afficher un message d'erreur
                console.log("Identifiants incorrects");
                loginError.style.display = 'block';
                
                // Effacer le mot de passe
                document.getElementById('password').value = '';
            }
        });
    } else {
        console.log("Formulaire de connexion non trouvé");
    }
    
    // Vérifier si l'utilisateur est déjà connecté
    function checkAdminAuth() {
        const isLoggedIn = sessionStorage.getItem('admin-logged-in');
        console.log("État de connexion:", isLoggedIn);
        
        // Si on est sur la page admin mais pas connecté, rediriger vers l'accueil
        if (window.location.pathname.includes('/admin/admin.html') && !isLoggedIn) {
            console.log("Redirection vers la page d'accueil (non connecté)");
            window.location.href = '../index.html#admin';
        }
    }
    
    // Exécuter la vérification
    checkAdminAuth();
});