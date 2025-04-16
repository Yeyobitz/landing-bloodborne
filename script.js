// --- Preloader --- 
const preloader = document.getElementById('preloader');

window.addEventListener('load', () => {
    if (preloader) { 
        preloader.classList.add('hidden');
    }
});

// --- Navbar Scrollspy ---
const sections = document.querySelectorAll('main section[id]'); // Selecciona secciones con ID
const navLinks = document.querySelectorAll('.navbar-links a');

window.addEventListener('scroll', () => {
    let current = 'hero'; // Por defecto, la sección hero al inicio

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
         // Activar cuando la sección esté visible en la mitad superior de la pantalla
        if (pageYOffset >= (sectionTop - window.innerHeight / 2)) {
            current = section.getAttribute('id');
        }
    });

     // Asegurarse de que 'hero' esté activo si estamos muy arriba
     if (pageYOffset < window.innerHeight * 0.4) {
          current = 'hero';
     }

    navLinks.forEach(link => {
        link.classList.remove('active');
        // Comprobar si el href del link (quitando #) coincide con el ID actual
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

 // Inicializar al cargar la página (por si se carga a mitad)
 window.dispatchEvent(new Event('scroll'));

// --- Lightbox Logic ---
const galleryLinks = document.querySelectorAll('.gallery-link');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');

galleryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevenir navegación
        const imageUrl = link.getAttribute('href');
        lightboxImage.setAttribute('src', imageUrl);
        lightboxOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden'; // Evitar scroll del fondo
    });
});

const closeLightbox = () => {
    lightboxOverlay.classList.remove('visible');
     document.body.style.overflow = ''; // Restaurar scroll del fondo
};

lightboxClose.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', (e) => {
    // Cerrar solo si se hace clic en el fondo (overlay), no en la imagen/contenido
    if (e.target === lightboxOverlay) {
        closeLightbox();
    }
});

 // Opcional: Cerrar con la tecla Escape
 document.addEventListener('keydown', (e) => {
     if (e.key === 'Escape' && lightboxOverlay.classList.contains('visible')) {
         closeLightbox();
     }
 }); 

// --- Scroll Reveal Animations --- 
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: Stop observing the element once it's visible
            // observer.unobserve(entry.target);
        }
        // Optional: If you want elements to hide again when scrolled out
        // else {
        //     entry.target.classList.remove('visible');
        // }
    });
}, {
    root: null, // relative to document viewport 
    rootMargin: '0px',
    threshold: 0.1 // trigger animation when 10% of the element is visible
});

revealElements.forEach(el => {
    revealObserver.observe(el);
}); 

// --- Lore Data Loading and Modal Logic --- 
document.addEventListener('DOMContentLoaded', () => {
    // Get all required elements first
    const characterGrid = document.getElementById('characterGrid');
    const zoneGrid = document.getElementById('zoneGrid');
    const infoModal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const quoteTextElement = document.getElementById('quoteText');
    const quoteAttributionElement = document.getElementById('quoteAttribution');
    const quotePrevBtn = document.getElementById('quotePrev');
    const quoteNextBtn = document.getElementById('quoteNext');
    const quoteCarouselWrapper = document.querySelector('.quote-carousel-wrapper');

    // Basic check if elements exist
    if (!characterGrid || !zoneGrid || !infoModal || !quoteTextElement || !quoteAttributionElement) {
        console.error('Core elements for lore/modal/quotes not found!');
        return;
    }

    // --- Modal Functions (Keep as they are) ---
    const openModal = (title, contentHtml) => {
        modalTitle.textContent = title;
        modalBody.innerHTML = contentHtml;
        infoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        infoModal.style.display = 'none';
        document.body.style.overflow = '';
    };

    modalClose.addEventListener('click', closeModal);
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) { closeModal(); }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && infoModal.style.display === 'flex') { closeModal(); }
    });

    // --- Quote Carousel Variables and Functions ---
    let quotes = [];
    let currentQuoteIndex = 0;
    let quoteInterval = null;
    const quoteChangeInterval = 7000;
    const fadeDuration = 400; // Matches CSS

    // Function for TRANSITIONS between quotes
    const displayQuoteTransition = (index) => {
        if (!quotes || quotes.length === 0) return;

        quoteTextElement.classList.add('fade-out');
        quoteAttributionElement.classList.add('fade-out');

        setTimeout(() => {
            currentQuoteIndex = index;
            const quote = quotes[currentQuoteIndex];
            quoteTextElement.textContent = `"${quote.frase}"`;
            quoteAttributionElement.textContent = `- ${quote.personaje || 'Desconocido'}`;

            quoteTextElement.classList.remove('fade-out');
            quoteAttributionElement.classList.remove('fade-out');
        }, fadeDuration);
    };

    const nextQuote = () => {
        if (!quotes || quotes.length === 0) return;
        const newIndex = (currentQuoteIndex + 1) % quotes.length;
        displayQuoteTransition(newIndex);
    };

    const prevQuote = () => {
        if (!quotes || quotes.length === 0) return;
        const newIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
        displayQuoteTransition(newIndex);
    };

    const startQuoteRotation = () => {
        if (quoteInterval) clearInterval(quoteInterval);
        // Use the transition function for subsequent automatic changes
        quoteInterval = setInterval(nextQuote, quoteChangeInterval);
    };

    const stopQuoteRotation = () => {
        clearInterval(quoteInterval);
    };

    // --- Single Data Fetching and Population ---
    fetch('lore.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Populate Characters - Updated with more detailed design
            if (data.personajes) {
                characterGrid.innerHTML = ''; // Clear any existing content
                data.personajes.forEach(char => {
                    const charItem = document.createElement('div');
                    charItem.classList.add('character-item', 'reveal');
                    
                    // Map of character names to image URLs
                    const characterImages = {
                        'el cazador (protagonista)': 'https://i.imgur.com/FtcMuPe.jpg',
                        'gehrman, el primer cazador': 'https://i.imgur.com/m0H33bS.jpg',
                        'la muñeca': 'https://i.imgur.com/oQxHlcO.jpg',
                        'laurence, el primer vicario': 'https://i.imgur.com/gjmLiYG.jpg',
                        'maestro willem': 'https://i.imgur.com/fXJRaWX.jpg',
                        'micolash, huésped de la pesadilla': 'https://i.imgur.com/HMt9YD9.jpg',
                        'lady maria de la torre del reloj astral': 'https://i.imgur.com/x8MrHrZ.jpg',
                        'ludwig, el acólito sagrado': 'https://i.imgur.com/8wdNGdz.jpg',
                        'huérfano de kos': 'https://i.imgur.com/V3MhTZ2.jpg',
                        'presencia lunar (flora)': 'https://i.imgur.com/XOLtXxe.jpg',
                        'mergo': 'https://i.imgur.com/D9Kgwtj.jpg',
                        'yharnam, la reina pthumeria': 'https://i.imgur.com/UdwXLCz.jpg',
                        'annalise, la reina de la sangre vil': 'https://i.imgur.com/4vP9pHF.jpg',
                        'mártir logarius': 'https://i.imgur.com/3Yp6NQ0.jpg',
                        'alfred, discípulo de logarius': 'https://i.imgur.com/jBiNpOW.jpg',
                        'eileen la cuervo': 'https://i.imgur.com/iFjjBOa.jpg',
                        'padre djura': 'https://i.imgur.com/V4kldCM.jpg',
                        'padre gascoigne': 'https://i.imgur.com/FvPTzjg.jpg',
                        'iosefka (y su impostora)': 'https://i.imgur.com/2YYVgJO.jpg',
                        'arianna': 'https://i.imgur.com/0E6kEr1.jpg',
                        'adella, la monja de la iglesia': 'https://i.imgur.com/L7t9Gja.jpg',
                        'oedon, el gran sin forma': 'https://i.imgur.com/YDspxvt.jpg',
                        'amygdala': 'https://i.imgur.com/uVnpMUE.jpg',
                        'ebrietas, hija del cosmos': 'https://i.imgur.com/q9CNHfI.jpg',
                        'rom, la araña vacua': 'https://i.imgur.com/c3ojvP3.jpg',
                        'nodriza de mergo': 'https://i.imgur.com/c3gFSXZ.jpg'
                    };
                    
                    // Try to find a matching image or use fallback
                    const normalizedName = char.nombre.toLowerCase();
                    const charImageUrl = characterImages[normalizedName] || 'https://i.imgur.com/FtcMuPe.jpg';
                    
                    // Extraer un breve resumen para la tarjeta (primera oración de la historia)
                    const briefDesc = char.historia.split('.')[0] + '.';
                    
                    charItem.innerHTML = `
                        <img class="character-image" src="${charImageUrl}" alt="${char.nombre}">
                        <div class="character-content">
                            <h3 class="character-name">${char.nombre}</h3>
                            <p class="character-desc">${briefDesc}</p>
                            <button class="character-button">Detalles</button>
                        </div>
                    `;
                    
                    // Add click event to the details button
                    const detailsBtn = charItem.querySelector('.character-button');
                    detailsBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const content = `
                            <div class="character-details">
                                <h4>Historia</h4>
                                <p>${char.historia}</p>
                                <h4>Relaciones</h4>
                                <p>${char.relaciones}</p>
                                <h4>Rol en el Juego</h4>
                                <p>${char.rol}</p>
                            </div>
                        `;
                        openModal(char.nombre, content);
                    });
                    
                    // Add hover effect to entire card
                    charItem.addEventListener('mouseenter', () => {
                        charItem.classList.add('hover');
                    });
                    
                    charItem.addEventListener('mouseleave', () => {
                        charItem.classList.remove('hover');
                    });
                    
                    characterGrid.appendChild(charItem);
                    revealObserver.observe(charItem);
                });
            } else {
                characterGrid.innerHTML = '<p class="error-message">No se encontraron datos de personajes.</p>';
            }

            // Populate Zones - Updated with more detailed design
            if (data.zonas) {
                zoneGrid.innerHTML = ''; // Clear any existing content
                data.zonas.forEach(zone => {
                    const zoneItem = document.createElement('div');
                    zoneItem.classList.add('zone-item', 'reveal');
                    
                    // Get zone image name from zone name (convert to lowercase, replace spaces)
                    const imageFileName = zone.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[,.'()]/g, '');
                    const imagePath = `public/images/zones/${imageFileName}.jpg`;
                    
                    // Map of specific zone names to known image URLs for better visuals
                    const zoneImages = {
                        'yharnam central': 'https://static1.thegamerimages.com/wordpress/wp-content/uploads/2020/08/Bloodborne-Central-Yharnam.jpg',
                        'distrito de la catedral': 'https://bloodborne.wiki.fextralife.com/file/Bloodborne/cathedral_ward_area_bloodborne_wiki_guide.jpg',
                        'vieja yharnam': 'https://cdnb.artstation.com/p/assets/images/images/001/210/358/large/james-paick-bloodborne-old-yharnam-concept-art-james-paick-01.jpg',
                        'bosque prohibido': 'https://bloodborne.wiki.fextralife.com/file/Bloodborne/forbidden_woods_area_bloodborne_wiki_guide.jpg',
                        'byrgenwerth': 'https://bloodborne.wiki.fextralife.com/file/Bloodborne/byrgenwerth_area_bloodborne_wiki_guide.jpg',
                        'castillo cainhurst': 'https://bloodborne.wiki.fextralife.com/file/Bloodborne/cainhurst_castle_area_bloodborne_wiki_guide.jpg',
                        'pesadilla de mensis': 'https://bloodborne.wiki.fextralife.com/file/Bloodborne/nightmare_of_mensis_area_bloodborne_wiki_guide1.jpg',
                        'pesadilla del cazador': 'https://bloodborne.wiki.fextralife.com/file/Bloodborne/hunters_nightmare_area_bloodborne_wiki_guide2.jpg',
                        'sueño del cazador': 'https://bloodborne.wiki.fextralife.com/file/Bloodborne/hunters_dream_hub_bloodborne_wiki_guide_walkthrough.jpg'
                    };
                    
                    // Try to find a matching image or use fallback
                    const normalizedName = zone.nombre.toLowerCase();
                    const zoneImageUrl = zoneImages[normalizedName] || 'https://static1.thegamerimages.com/wordpress/wp-content/uploads/2020/08/Bloodborne-Central-Yharnam.jpg';
                    
                    zoneItem.innerHTML = `
                        <img class="zone-image" src="${zoneImageUrl}" alt="${zone.nombre}">
                        <div class="zone-content">
                            <h3 class="zone-name">${zone.nombre}</h3>
                            <p class="zone-desc">${zone.descripcion}</p>
                            <button class="zone-button">Detalles</button>
                        </div>
                    `;
                    
                    // Add click event to the details button
                    const detailsBtn = zoneItem.querySelector('.zone-button');
                    detailsBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent the card click from triggering
                        const content = `
                            <div class="zone-details">
                                <h4>Descripción</h4>
                                <p>${zone.descripcion}</p>
                                <h4>Historia</h4>
                                <p>${zone.historia}</p>
                                <h4>Conexiones</h4>
                                <p>${zone.conexiones}</p>
                                <h4>Importancia</h4>
                                <p>${zone.importancia}</p>
                            </div>
                        `;
                        openModal(zone.nombre, content);
                    });
                    
                    // Add hover effect to entire card
                    zoneItem.addEventListener('mouseenter', () => {
                        zoneItem.classList.add('hover');
                    });
                    
                    zoneItem.addEventListener('mouseleave', () => {
                        zoneItem.classList.remove('hover');
                    });
                    
                    zoneGrid.appendChild(zoneItem);
                    revealObserver.observe(zoneItem);
                });
            } else {
                 zoneGrid.innerHTML = '<p class="error-message">No se encontraron datos de zonas.</p>';
            }

            // Initialize Quotes
            quotes = data.citas;
            if (quotes && quotes.length > 0) {
                // --- MODIFIED: Set initial quote directly without fade ---
                currentQuoteIndex = 0;
                const initialQuote = quotes[currentQuoteIndex];
                quoteTextElement.textContent = `"${initialQuote.frase}"`;
                quoteAttributionElement.textContent = `- ${initialQuote.personaje || 'Desconocido'}`;
                 // Ensure initial visibility (remove fade class if somehow present)
                quoteTextElement.classList.remove('fade-out');
                quoteAttributionElement.classList.remove('fade-out');
                // --------------------------------------------------------

                startQuoteRotation(); // Start automatic rotation AFTER setting initial text

                // Add button listeners
                if(quotePrevBtn) {
                    quotePrevBtn.addEventListener('click', () => {
                        prevQuote();
                        stopQuoteRotation();
                        startQuoteRotation();
                    });
                }
                if(quoteNextBtn) {
                    quoteNextBtn.addEventListener('click', () => {
                        nextQuote();
                        stopQuoteRotation();
                        startQuoteRotation();
                    });
                }

                // Pause rotation on hover
                if (quoteCarouselWrapper) {
                    quoteCarouselWrapper.addEventListener('mouseenter', stopQuoteRotation);
                    quoteCarouselWrapper.addEventListener('mouseleave', startQuoteRotation);
                }

            } else {
                quoteTextElement.textContent = 'No se pudieron cargar las citas.';
                quoteAttributionElement.textContent = '';
                 if(quotePrevBtn) quotePrevBtn.style.display = 'none'; // Hide buttons if no quotes
                 if(quoteNextBtn) quoteNextBtn.style.display = 'none';
            }

            // Add event listeners for navigation buttons if they exist
            if (quotePrevBtn && quoteNextBtn) {
                quotePrevBtn.addEventListener('click', () => {
                    prevQuote();
                    stopQuoteRotation(); // Stop auto rotation on manual nav
                });
                quoteNextBtn.addEventListener('click', () => {
                    nextQuote();
                    stopQuoteRotation(); // Stop auto rotation on manual nav
                });
                 // Optional: Restart rotation if mouse leaves the carousel area
                quoteCarouselWrapper.addEventListener('mouseleave', startQuoteRotation);
                quoteCarouselWrapper.addEventListener('mouseenter', stopQuoteRotation); // Pause on hover
            }

            // --- Theory Section Modal Logic --- 
            const theoryTitles = document.querySelectorAll('#teorias .theory-title');
            if (theoryTitles.length > 0) {
                theoryTitles.forEach(titleElement => {
                    titleElement.addEventListener('click', () => {
                        const parentItem = titleElement.closest('.theory-item');
                        if (parentItem) {
                            const descriptionElement = parentItem.querySelector('p');
                            if (descriptionElement) {
                                const title = titleElement.textContent;
                                const descriptionHtml = descriptionElement.innerHTML; // Get innerHTML to preserve potential formatting
                                openModal(title, descriptionHtml);
                            }
                        }
                    });
                });
            } else {
                console.warn('No theory titles found to attach listeners.');
            }

        })
        .catch(error => {
            console.error('Error fetching lore data:', error);
            // Display user-friendly error messages
            if (characterGrid) characterGrid.innerHTML = '<p class="error-message">Error al cargar personajes.</p>';
            if (zoneGrid) zoneGrid.innerHTML = '<p class="error-message">Error al cargar zonas.</p>';
            if (quoteTextElement) quoteTextElement.textContent = 'Error al cargar citas.';
            if (quoteAttributionElement) quoteAttributionElement.textContent = '';
        });
}); 