// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            if (this.getAttribute('href') === '#inicio') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
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

// Advanced scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Initialize animations for different element types
function initializeAnimations() {
    // Section titles - slide down from top
    document.querySelectorAll('.section-title').forEach((el, index) => {
        el.classList.add('animate-title');
        observer.observe(el);
    });

    // About content - fade and slide up
    document.querySelectorAll('.about-content').forEach((el, index) => {
        el.classList.add('animate-fade-up');
        observer.observe(el);
    });

    // Project cards - staggered slide in from different directions
    document.querySelectorAll('.project-card').forEach((el, index) => {
        const animations = [
            'animate-slide-left', 'animate-slide-right', 
            'animate-slide-up', 'animate-slide-left', 
            'animate-slide-right', 'animate-zoom-in'
        ];
        el.classList.add(animations[index % 6]);
        el.style.animationDelay = (index * 0.15) + 's';
        observer.observe(el);
    });

    // Skill categories - zoom in effect
    document.querySelectorAll('.skill-category').forEach((el, index) => {
        el.classList.add('animate-zoom-in');
        el.style.animationDelay = (index * 0.1) + 's';
        observer.observe(el);
    });

    // Timeline items - alternate slide animations
    document.querySelectorAll('.timeline-item').forEach((el, index) => {
        if (index % 2 === 0) {
            el.classList.add('animate-slide-right');
        } else {
            el.classList.add('animate-slide-left');
        }
        el.style.animationDelay = (index * 0.3) + 's';
        observer.observe(el);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    
    // Add fade-in effect to hero content
    const heroContent = document.querySelector('.hero .container');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 1s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    const speed = scrolled * 0.2;
    if (parallax) {
        parallax.style.transform = 'translateY(' + speed + 'px)';
    }
});

// Enhanced hover effects for project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.filter = 'brightness(1.1)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.filter = 'brightness(1)';
    });
});

// Performance optimization
function throttle(func, wait) {
    let timeout;
    return function executedFunction() {
        const later = () => {
            clearTimeout(timeout);
            func();
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScroll = throttle(() => {
    // Scroll optimizado
}, 100);

window.addEventListener('scroll', throttledScroll);