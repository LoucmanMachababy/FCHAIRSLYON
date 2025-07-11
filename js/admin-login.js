// Code pour gérer la connexion à l'interface d'administration
// === Connexion admin avec Firebase Auth ===
// Charger la config Firebase
if (window.FCHAIRSLYON_FIREBASE_CONFIG) {
  firebase.initializeApp(window.FCHAIRSLYON_FIREBASE_CONFIG);
}

const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function() {
    console.log("Script admin-login.js chargé");
    const adminLoginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    
    if (adminLoginForm) {
        console.log("Formulaire de connexion trouvé");
        adminLoginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("Soumission du formulaire");
            
            const email = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    // Connexion réussie
                    console.log('Connexion réussie, redirection vers admin/admin.html');
                    window.location.href = 'admin/admin.html'; // Chemin relatif compatible Netlify et local
                })
                .catch((error) => {
                    loginError.style.display = 'block';
                    loginError.textContent = 'Identifiants incorrects ou compte inexistant.';
                    document.getElementById('password').value = '';
                });
        });
    } else {
        console.log("Formulaire de connexion non trouvé");
    }
});