// mobile-enhancements.js
// Améliorations de l'expérience mobile pour FcHairsLyon

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation des améliorations mobile...");
    
    // Activer le menu mobile
    setupMobileMenu();
    
    // Améliorer les interactions tactiles
    enhanceTouchInteractions();
    
    // Améliorations spécifiques pour l'admin
    if (window.location.pathname.includes('/admin/')) {
        enhanceAdminMobile();
    } else {
        // Améliorations pour le site principal
        enhanceMainSiteMobile();
    }
    
    // Améliorer les formulaires pour mobile
    enhanceMobileForms();
    
    // Ajouter un indicateur de navigation
    addNavigationIndicator();
    
    // Ajouter système de notification toast
    setupToastNotifications();
    
    console.log("Améliorations mobile activées!");
});

// Configurer le menu mobile
function setupMobileMenu() {
    // Vérifier si nous sommes sur mobile
    if (window.innerWidth > 768) return;
    
    console.log("Configuration du menu mobile...");
    
    // Si le menu hamburger n'existe pas, le créer
    if (!document.querySelector('.mobile-menu-toggle')) {
        const header = document.querySelector('header');
        if (header) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'mobile-menu-toggle';
            menuToggle.setAttribute('aria-label', 'Menu');
            menuToggle.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;
            header.appendChild(menuToggle);
            
            // Créer l'overlay du menu
            const menuOverlay = document.createElement('div');
            menuOverlay.className = 'menu-overlay';
            document.body.appendChild(menuOverlay);
            
            // Gérer les événements du menu
            const navMenu = document.querySelector('nav ul');
            
            if (menuToggle && navMenu) {
                menuToggle.addEventListener('click', function() {
                    navMenu.classList.toggle('show-menu');
                    menuOverlay.classList.toggle('active');
                    this.classList.toggle('active');
                });
                
                // Fermer le menu quand on clique sur l'overlay
                menuOverlay.addEventListener('click', function() {
                    navMenu.classList.remove('show-menu');
                    menuOverlay.classList.remove('active');
                    menuToggle.classList.remove('active');
                });
                
                // Fermer le menu quand on clique sur un lien
                const navLinks = navMenu.querySelectorAll('a');
                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        navMenu.classList.remove('show-menu');
                        menuOverlay.classList.remove('active');
                        menuToggle.classList.remove('active');
                    });
                });
            }
        }
    }
}

// Améliorer les interactions tactiles
function enhanceTouchInteractions() {
    // Améliorer les cartes de service
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.classList.add('touch-highlight');
        
        // Ajouter effet de pression
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
    
    // Améliorer les boutons
    const buttons = document.querySelectorAll('.btn, .form-button, .service-select, .action-button');
    buttons.forEach(button => {
        button.classList.add('touch-highlight');
        
        // Ajouter feedback tactile si disponible
        button.addEventListener('click', function() {
            if (navigator.vibrate) {
                navigator.vibrate(30); // Vibration très légère
            }
        });
    });
    
    // Améliorer les cases à cocher
    const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    checkboxes.forEach(checkbox => {
        // Augmenter la taille de la zone tactile
        const parent = checkbox.parentElement;
        if (parent && parent.tagName === 'LABEL') {
            parent.style.padding = '10px';
            parent.style.display = 'inline-block';
        }
    });
}

// Améliorations spécifiques pour l'administration sur mobile
function enhanceAdminMobile() {
    console.log("Application des améliorations pour l'administration mobile...");
    
    // Améliorer la barre latérale
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // Ajouter le bouton de menu pour l'administration
        if (!document.querySelector('.mobile-menu-toggle-admin')) {
            const menuButton = document.createElement('button');
            menuButton.className = 'mobile-menu-toggle-admin';
            menuButton.innerHTML = '<i class="fas fa-bars"></i>';
            menuButton.setAttribute('aria-label', 'Menu admin');
            document.body.appendChild(menuButton);
            
            // Créer l'overlay pour le menu admin
            const menuOverlay = document.createElement('div');
            menuOverlay.className = 'menu-overlay';
            document.body.appendChild(menuOverlay);
            
            // Gérer l'ouverture/fermeture du menu
            const menuBtn = document.querySelector('.mobile-menu-toggle-admin');
            const overlay = document.querySelector('.menu-overlay');
            if (menuBtn && overlay) {
                menuBtn.style.display = 'flex';
                overlay.style.display = 'none';
                menuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('show-sidebar');
                    overlay.classList.toggle('active');
                    overlay.style.display = overlay.classList.contains('active') ? 'block' : 'none';
                    // Change icon
                    const icon = menuBtn.querySelector('i');
                    if (sidebar.classList.contains('show-sidebar')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
                overlay.addEventListener('click', function() {
                    sidebar.classList.remove('show-sidebar');
                    overlay.classList.remove('active');
                    overlay.style.display = 'none';
                    // Reset icon
                    const icon = menuBtn.querySelector('i');
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                });
                // Fermer le menu quand on clique sur un lien du menu
                sidebar.querySelectorAll('.menu-item').forEach(item => {
                    item.addEventListener('click', function() {
                        sidebar.classList.remove('show-sidebar');
                        overlay.classList.remove('active');
                        overlay.style.display = 'none';
                        const icon = menuBtn.querySelector('i');
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                });
            });
            }
        }
    }
    
    // Rendre les tableaux responsifs
    const tables = document.querySelectorAll('table:not(.responsive-table)');
    tables.forEach(table => {
        makeTableResponsive(table);
    });
    
    // Améliorer l'interface des disponibilités
    enhanceAvailabilityInterface();
}

// Rendre un tableau responsive
function makeTableResponsive(table) {
    if (!table) return;
    
    // Ajouter la classe responsive
    table.classList.add('responsive-table');
    
    // Obtenir les en-têtes
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    
    // Ajouter les attributs data pour chaque cellule
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (index < headers.length) {
                cell.setAttribute('data-label', headers[index]);
            }
        });
    });
}

// Améliorer l'interface de gestion des disponibilités
function enhanceAvailabilityInterface() {
    setTimeout(() => {
        // Améliorer la sélection des dates
        const calendarDays = document.querySelectorAll('.calendar-day:not(.past)');
        calendarDays.forEach(day => {
            // Agrandir la zone de clic
            day.style.minHeight = '40px';
            
            // Ajouter un effet de press
            day.addEventListener('touchstart', function() {
                this.style.backgroundColor = 'rgba(255, 224, 232, 0.5)';
            });
            
            day.addEventListener('touchend', function() {
                this.style.backgroundColor = '';
            });
        });
        
        // Améliorer la grille d'heures
        const hoursContainer = document.getElementById('hours-container');
        if (hoursContainer) {
            // Observer les modifications pour améliorer les cases à cocher ajoutées dynamiquement
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        const checkboxes = hoursContainer.querySelectorAll('.hour-checkbox');
                        checkboxes.forEach(function(checkbox) {
                            const label = checkbox.closest('label');
                            if (label) {
                                label.style.padding = '12px 5px';
                                label.style.display = 'flex';
                                label.style.alignItems = 'center';
                                label.style.justifyContent = 'center';
                                
                                // Ajouter un effet de press
                                label.addEventListener('touchstart', function() {
                                    this.style.backgroundColor = 'rgba(255, 224, 232, 0.5)';
                                });
                                
                                label.addEventListener('touchend', function() {
                                    this.style.backgroundColor = '';
                                });
                            }
                        });
                    }
                });
            });
            
            observer.observe(hoursContainer, { childList: true, subtree: true });
        }
        
        // Améliorer le bouton de sauvegarde
        const saveButton = document.getElementById('save-availability');
        if (saveButton) {
            saveButton.style.padding = '15px';
            saveButton.style.fontSize = '16px';
            saveButton.style.fontWeight = 'bold';
            
            // Ajouter un gestionnaire amélioré
            const originalClickHandler = saveButton.onclick;
            saveButton.onclick = function(e) {
                // Ajouter l'effet de traitement
                this.classList.add('processing');
                this.textContent = 'Enregistrement en cours...';
                
                // Essayer d'appeler le gestionnaire original
                if (typeof originalClickHandler === 'function') {
                    originalClickHandler.call(this, e);
                }
                
                // Afficher un toast de succès après un court délai
                setTimeout(() => {
                    showToast('Enregistrement réussi!', 'success');
                    this.classList.remove('processing');
                    this.textContent = 'Enregistrer';
                }, 1000);
            };
        }
    }, 1000);
}

// Améliorer les formulaires pour mobile
function enhanceMobileForms() {
    // Optimiser les champs date sur mobile
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // Assurer que le format est lisible sur mobile
        input.style.paddingRight = '30px';
        
        // S'assurer que les dates s'affichent correctement
        if (!input.min) {
            const today = new Date().toISOString().split('T')[0];
            input.min = today;
        }
    });
    
    // Optimiser les champs téléphone
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        // Définir le type de clavier pour téléphone
        input.setAttribute('inputmode', 'numeric');
        
        // Ajouter un placeholder si absent
        if (!input.placeholder) {
            input.placeholder = '06 xx xx xx xx';
        }
        
        // Formatter le numéro automatiquement
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                // Format français : XX XX XX XX XX
                value = value.match(/.{1,2}/g)?.join(' ') || value;
            }
            
            // Limiter à 10 chiffres (14 caractères avec espaces)
            if (value.length > 14) {
                value = value.substring(0, 14);
            }
            
            e.target.value = value;
        });
    });
    
    // Optimiser les boutons de formulaire
    const formButtons = document.querySelectorAll('.form-button');
    formButtons.forEach(button => {
        // Ajouter un gestionnaire pour l'état de traitement
        button.addEventListener('click', function() {
            const form = this.closest('form');
            if (form && form.checkValidity()) {
                this.classList.add('processing');
                const originalText = this.textContent;
                this.textContent = 'Traitement en cours...';
                
                // Rétablir l'état initial après un délai
                setTimeout(() => {
                    this.classList.remove('processing');
                    this.textContent = originalText;
                }, 3000);
            }
        });
    });
}

// Améliorations pour le site principal sur mobile
function enhanceMainSiteMobile() {
    console.log("Application des améliorations pour le site principal sur mobile...");
    
    // Améliorer les onglets
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length > 0) {
        // Rendre les onglets scrollables sur mobile
        const tabsContainer = document.querySelector('.tabs');
        if (tabsContainer) {
            tabsContainer.style.overflowX = 'auto';
            tabsContainer.style.WebkitOverflowScrolling = 'touch';
            tabsContainer.style.scrollSnapType = 'x mandatory';
            
            // Ajouter le scroll snap à chaque onglet
            tabButtons.forEach(button => {
                button.style.scrollSnapAlign = 'start';
                button.style.flexShrink = '0';
                
                // Indices visuels pour indiquer qu'on peut scroller
                tabsContainer.style.paddingBottom = '5px';
                tabsContainer.style.marginBottom = '15px';
            });
        }
    }
    
    // Améliorer la grille de services
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        // Ajouter une animation d'entrée aux cartes
        const serviceCards = servicesGrid.querySelectorAll('.service-card');
        serviceCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            // Animation séquentielle
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Améliorer les réservations
    enhanceReservations();
}

// Améliorer l'affichage et l'interaction avec les réservations
function enhanceReservations() {
    const reservationItems = document.querySelectorAll('.reservation-item');
    reservationItems.forEach(item => {
        // Améliorer l'aspect sur mobile
        if (window.innerWidth <= 768) {
            // Réorganiser les éléments
            const reservationInfo = item.querySelector('.reservation-info');
            const reservationPrice = item.querySelector('.reservation-price');
            const reservationActions = item.querySelector('.reservation-actions');
            
            if (reservationInfo && reservationPrice && reservationActions) {
                // Réorganiser le prix et les actions
                item.style.position = 'relative';
                reservationPrice.style.position = 'absolute';
                reservationPrice.style.top = '15px';
                reservationPrice.style.right = '15px';
                
                reservationActions.style.position = 'absolute';
                reservationActions.style.bottom = '15px';
                reservationActions.style.right = '15px';
            }
        }
    });
}

// Ajouter un indicateur de navigation
function addNavigationIndicator() {
    // Ne s'applique qu'au site principal
    if (window.location.pathname.includes('/admin/')) return;
    
    // Indicateur pour montrer la section active
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');
    
    if (sections.length > 0 && navLinks.length > 0) {
        // Observer le défilement pour mettre à jour la navigation
        window.addEventListener('scroll', function() {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }
}

// Configurer le système de notification toast
function setupToastNotifications() {
    // Créer le conteneur pour les toasts si nécessaire
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Fonction globale pour afficher des toasts
    window.showToast = function(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Animation d'entrée
        setTimeout(() => toast.classList.add('show'), 10);

        // Animation de sortie
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            
            // Supprimer après l'animation
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    };
}

// Détection de la connectivité
function monitorConnectivity() {
    // Vérifier si l'API navigator.onLine est disponible
    if ('onLine' in navigator) {
        function updateOnlineStatus() {
            if (navigator.onLine) {
                // En ligne - synchroniser les données
                if (window.AvailabilityServiceWithSync) {
                    window.AvailabilityServiceWithSync.syncFromCloud();
                }
                showToast('Connexion rétablie', 'success');
            } else {
                // Hors ligne
                showToast('Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.', 'warning', 5000);
            }
        }
        
        // Attacher les écouteurs d'événements
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }
}

// Amélioration du scrolling
function enhanceScrolling() {
    // Défilement fluide pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Ignorer les liens #
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Défilement fluide avec un petit décalage pour la navigation fixe
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Mise à jour de l'URL sans recharger la page
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Ajouter un bouton de retour en haut sur les longues pages
    if (document.body.scrollHeight > window.innerHeight * 2) {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.setAttribute('aria-label', 'Retour en haut');
        
        // Ajouter les styles
        backToTopBtn.style.position = 'fixed';
        backToTopBtn.style.bottom = '20px';
        backToTopBtn.style.right = '20px';
        backToTopBtn.style.zIndex = '999';
        backToTopBtn.style.width = '40px';
        backToTopBtn.style.height = '40px';
        backToTopBtn.style.borderRadius = '50%';
        backToTopBtn.style.backgroundColor = 'var(--primary)';
        backToTopBtn.style.color = 'var(--secondary)';
        backToTopBtn.style.border = 'none';
        backToTopBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.visibility = 'hidden';
        backToTopBtn.style.transition = 'opacity 0.3s, visibility 0.3s';
        
        document.body.appendChild(backToTopBtn);
        
        // Gérer l'affichage selon le défilement
        window.addEventListener('scroll', function() {
            if (window.scrollY > window.innerHeight) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
            }
        });
        
        // Retour en haut au clic
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialiser les améliorations supplémentaires
enhanceScrolling();
monitorConnectivity();

// Fonction utilitaire pour détecter le type d'appareil
function detectDeviceType() {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) {
        return 'android';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
        return 'ios';
    } else if (window.innerWidth <= 768) {
        return 'mobile';
    } else if (window.innerWidth <= 1024) {
        return 'tablet';
    } else {
        return 'desktop';
    }
}

// Appliquer des corrections spécifiques à certains appareils
(function() {
    const deviceType = detectDeviceType();
    
    if (deviceType === 'ios') {
        // Corrections spécifiques pour iOS
        document.documentElement.style.setProperty('--webkit-overflow-scrolling', 'touch');
        
        // Corriger le "zoom" sur les inputs pour iOS
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.fontSize = '16px';
        });
        
        // Corriger le comportement de défilement
        document.addEventListener('touchmove', function(e) {
            // Permettre le défilement dans les zones scrollables
            if (e.target.closest('.scrollable')) {
                e.stopPropagation();
            }
        }, { passive: false });
    }
    
    if (deviceType === 'android') {
        // Corrections spécifiques pour Android
        // Ajouter une classe pour les ajustements CSS spécifiques
        document.documentElement.classList.add('android-device');
        
        // Corriger certains problèmes d'affichage
        const inputs = document.querySelectorAll('input[type="date"], input[type="time"]');
        inputs.forEach(input => {
            // Améliorer l'apparence des sélecteurs de date sur Android
            input.style.paddingRight = '30px';
            input.style.backgroundPosition = 'calc(100% - 10px) center';
        });
    }
})();