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