(function () {
    'use strict';

    const THEME_KEY = 'portfolio-theme';
    const html = document.documentElement;
    const metaTheme = document.getElementById('meta-theme-color');

    const prefersReducedMotion = () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ========== Tema ========== */
    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'light' ? '#f6f3ee' : '#0b0d11');
        }
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}

        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo oscuro');
            btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
        }
        window.dispatchEvent(new CustomEvent('portfolio-theme', { detail: theme }));
    }

    function initTheme() {
        let theme = 'dark';
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'light' || saved === 'dark') theme = saved;
        } catch (e) {}
        applyTheme(theme);

        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.addEventListener('click', () => {
                const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(next);
            });
        }
    }

    /* ========== Partículas galaxia (solo modo oscuro) ========== */
    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let stars = [];
        let rafId = null;
        let running = false;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const count = Math.min(140, Math.floor((canvas.width * canvas.height) / 14000));
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.4 + 0.3,
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: (Math.random() - 0.5) * 0.15,
                    tw: Math.random() * Math.PI * 2,
                    tws: 0.015 + Math.random() * 0.02
                });
            }
        }

        function draw() {
            if (html.getAttribute('data-theme') !== 'dark') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                running = false;
                return;
            }

            ctx.fillStyle = '#0b0d11';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach((s) => {
                s.x += s.vx;
                s.y += s.vy;
                s.tw += s.tws;
                if (s.x < 0) s.x = canvas.width;
                if (s.x > canvas.width) s.x = 0;
                if (s.y < 0) s.y = canvas.height;
                if (s.y > canvas.height) s.y = 0;

                const alpha = 0.35 + Math.sin(s.tw) * 0.35;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(227, 168, 87, ${alpha})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(111, 147, 179, ${alpha * 0.12})`;
                ctx.fill();
            });

            if (running) rafId = requestAnimationFrame(draw);
        }

        function start() {
            resize();
            running = true;
            draw();
        }

        function stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
        }

        window.addEventListener('resize', resize);

        window.addEventListener('portfolio-theme', (e) => {
            if (e.detail === 'dark') start();
            else { stop(); ctx.clearRect(0, 0, canvas.width, canvas.height); }
        });

        if (html.getAttribute('data-theme') === 'dark') start();
    }

    /* ========== Máquina de escribir ========== */
    function runTypewriter() {
        const el = document.getElementById('typewriter-text');
        const caret = document.getElementById('typewriter-caret');
        if (!el) return;

        const full = el.getAttribute('data-full') || 'Jorge Gastón Murúa';

        if (prefersReducedMotion()) {
            el.textContent = full;
            if (caret) caret.classList.add('is-done');
            return;
        }

        let i = 0;
        el.textContent = '';

        function tick() {
            if (i < full.length) {
                el.textContent = full.slice(0, i + 1);
                i++;
                setTimeout(tick, 48 + Math.random() * 45);
            } else if (caret) {
                caret.classList.add('is-done');
            }
        }
        setTimeout(tick, 350);
    }

    /* ========== Scroll suave ========== */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const smooth = prefersReducedMotion() ? 'auto' : 'smooth';
            if (href === '#inicio') { window.scrollTo({ top: 0, behavior: smooth }); return; }
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: smooth, block: 'start' });
        });
    });

    /* ========== Animaciones de sección al scroll ========== */
    function initSectionAnimations() {
        if (prefersReducedMotion()) {
            document.querySelectorAll('.section-scroll').forEach((s) => s.classList.add('section-in-view'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('section-in-view');
                });
            },
            { threshold: 0.02, rootMargin: '0px 0px -8% 0px' }
        );

        document.querySelectorAll('.section-scroll').forEach((s) => observer.observe(s));
    }

    function onScrollNav() {
        let current = '';
        document.querySelectorAll('section').forEach((section) => {
            if (section.getBoundingClientRect().top <= 120) current = section.getAttribute('id');
        });
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    window.addEventListener('scroll', onScrollNav);
    window.addEventListener('scroll', updateSectionIndicator);

    document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('mouseenter', function () {
            if (prefersReducedMotion()) return;
            this.style.filter = 'brightness(1.08)';
        });
        card.addEventListener('mouseleave', function () { this.style.filter = ''; });
    });

    function initHamburger() {
        const btn = document.getElementById('nav-hamburger');
        const links = document.getElementById('nav-links');
        const backdrop = document.getElementById('nav-backdrop');
        if (!btn || !links) return;

        function openMenu() {
            links.classList.add('is-open');
            btn.classList.add('is-open');
            if (backdrop) backdrop.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Cerrar menú');
        }

        function closeMenu() {
            links.classList.remove('is-open');
            btn.classList.remove('is-open');
            if (backdrop) backdrop.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Abrir menú');
        }

        btn.addEventListener('click', () => {
            links.classList.contains('is-open') ? closeMenu() : openMenu();
        });

        if (backdrop) backdrop.addEventListener('click', closeMenu);

        links.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    /* ========== i18n ========== */
    const LANG_KEY = 'portfolio-lang';

    const TRANSLATIONS = {
        es: {
            'section.inicio': 'Inicio', 'section.sobre-mi': 'Sobre mí', 'section.proyectos': 'Proyectos',
            'section.habilidades': 'Habilidades', 'section.experiencia': 'Experiencia',
            'section.educacion': 'Educación',
            'section.contacto': 'Contacto', 'section.arcade': 'Arcade',
            'nav.inicio': 'Inicio', 'nav.sobre-mi': 'Sobre mí', 'nav.proyectos': 'Proyectos',
            'nav.habilidades': 'Habilidades', 'nav.experiencia': 'Experiencia',
            'nav.educacion': 'Educación', 'nav.contacto': 'Contacto',
            'hero.subtitle': 'Técnico Superior en Desarrollo de Software',
            'hero.availability': 'Full Stack Developer · Abierto a nuevas oportunidades',
            'hero.cv': '<i class="fas fa-download"></i> Descargar CV',
            'about.title': 'Sobre mí',
            'about.p1': 'Soy <b>Técnico Superior en Desarrollo de Software</b>, graduado en diciembre 2024. Vengo del <b>sector logístico</b>, donde acumulé <b>más de 10 años de experiencia</b> en operaciones, coordinación y resolución de problemas en entornos dinámicos.',
            'about.p2': 'Me estoy especializando en <b>automatizaciones con n8n</b>, <b>IA con Claude</b>, <b>marketing digital con IA</b> y <b>ciberseguridad</b>. Tengo un <b>emprendimiento de impresión 3D</b> que hago crecer mediante automatizaciones para optimizar procesos y escalar el negocio.',
            'about.p3': 'Busco sumarme como <b>Developer</b> a un equipo donde pueda aportar esa mirada operativa y mi capacidad de aprendizaje constante. Mientras tanto, sigo construyendo y haciendo crecer mis propios proyectos en producción.',
            'about.p4': 'Merlo, Zona Oeste - Buenos Aires, Argentina.',
            'projects.title': 'Proyectos principales',
            'proj.gtresia.desc': 'Agencia propia de automatización con inteligencia artificial para PyMEs. Landing, flujos de automatización con n8n y agentes de IA para procesos de negocio reales, en producción.',
            'proj.gtresd.desc': 'Emprendimiento propio de impresión 3D personalizada. Tienda online con catálogo de productos, pedidos a medida y presencia en redes y Mercado Libre.',
            'proj.gtresd.stat': '5.0 en reseñas de Google',
            'link.sitio': 'Sitio web',
            'proj.chat.desc': 'Sistema de chat en tiempo real desarrollado en Python para la cursada de Programación sobre redes. Implementa comunicación cliente-servidor con sockets y manejo de múltiples usuarios simultáneos.',
            'proj.api.desc': 'Aplicación Python que consume APIs externas e integra los datos con base de datos MariaDB. Incluye procesamiento de datos, conexiones a APIs REST y gestión de base de datos.',
            'proj.api.link2': 'Base de datos',
            'proj.gustashop.desc': 'E-commerce completo con React desarrollado como SPA (Single Page Application). Incluye carrito de compras, gestión de productos, componentes reutilizables y estado global optimizado.',
            'proj.gustashop.link1': 'Código fuente', 'proj.gustashop.link2': 'Sitio live',
            'proj.crud.desc': 'Sistema completo de autenticación y gestión de usuarios desarrollado en PHP. Implementa operaciones CRUD, sistema de login seguro, validaciones y manejo de sesiones.',
            'proj.techstore.desc': 'E-commerce de tecnología desarrollado con JavaScript y React. Catálogo de productos tech, carrito interactivo, gestión de productos y diseño responsive moderno.',
            'proj.techstore.link2': 'Tienda online',
            'link.demo': 'Demo', 'link.demo-login': 'Demo login',
            'skills.title': 'Habilidades técnicas', 'skills.languages': 'Lenguajes',
            'skills.frameworks': 'Frameworks y librerías', 'skills.databases': 'Bases de datos',
            'skills.tools': 'Herramientas y plataformas', 'skills.ai': 'Automatización e IA',
            'skills.other': 'Otras áreas',
            'exp.title': 'Experiencia laboral',
            'exp.gtresde.title': 'Fundador — GTresD (Impresión 3D)',
            'exp.gtresde.desc': 'Emprendimiento propio de impresión 3D. Diseño, producción y venta de piezas impresas en 3D. Optimización de procesos mediante automatizaciones para escalar el negocio.',
            'exp.lesber.title': 'Chofer y operario',
            'exp.lesber.desc': 'Optimización de rutas, resolución de problemas en tiempo real, interacción con clientes y gestión de carga y descarga.',
            'exp.jom.title': 'Cadete de logística',
            'exp.jom.desc': 'Gestión y organización de paquetes, uso de software de seguimiento, atención y resolución de incidencias con clientes.',
            'edu.title': 'Educación y formación',
            'edu.tsds.title': 'Técnico Superior en Desarrollo de Software',
            'edu.tsds.desc': 'Formación integral en desarrollo de software con énfasis en metodologías ágiles y tecnologías modernas.',
            'edu.n8n.desc': 'Automatización de flujos de trabajo y procesos con n8n.',
            'edu.cyber.desc': 'Seguridad informática, protección de sistemas y análisis de vulnerabilidades.',
            'edu.marketing.desc': 'Estrategias de marketing digital potenciadas con inteligencia artificial.',
            'edu.qa.desc': 'Testing manual y automatizado de software.',
            'edu.nodejs.desc': 'Desarrollo backend con JavaScript y Node.js.',
            'edu.react.desc': 'Desarrollo de interfaces de usuario con React.',
            'edu.php.desc': 'Desarrollo backend con PHP y bases de datos MySQL.',
            'edu.iot.title': 'Curso de IoT y robótica',
            'edu.iot.desc': 'Internet de las Cosas e introducción a la robótica con aplicaciones prácticas.',
            'edu.aws.title': 'Fundamentos de AWS',
            'edu.aws.desc': 'Computación en la nube y servicios de Amazon Web Services.',
            'edu.goals.title': 'Metas 2026',
            'edu.goal1': 'Dominar Inteligencia Artificial completamente',
            'edu.goal2': 'Certificaciones en IA y automatizaciones',
            'edu.goal3': 'Especializarse en Ciberseguridad',
            'edu.goal4': 'Sumarme a un equipo de desarrollo',
            'contact.title': 'Contacto',
            'contact.subtitle': '¿Tu equipo busca sumar a alguien con este perfil? Escribime y coordinamos una charla.',
            'contact.hablemos': 'Hablemos',
            'contact.location': 'Merlo, Zona Oeste · Buenos Aires, Argentina',
            'contact.wa': 'WhatsApp directo',
            'form.nombre': 'Nombre', 'form.nombre.ph': 'Tu nombre completo',
            'form.email': 'Email', 'form.asunto': 'Asunto', 'form.asunto.ph': '¿De qué se trata?',
            'form.mensaje': 'Mensaje', 'form.mensaje.ph': 'Contame tu proyecto o consulta...',
            'form.submit': '<i class="fas fa-paper-plane"></i> Enviar mensaje',
            'form.sending': '<i class="fas fa-spinner fa-spin"></i> Enviando...',
            'form.success': '¡Mensaje enviado! Te respondo en menos de 24 horas.',
            'form.error.server': 'Hubo un error al enviar. Probá contactarme por WhatsApp.',
            'form.error.network': 'Sin conexión. Probá contactarme por WhatsApp.',
            'arcade.title': 'Arcade', 'arcade.score': 'Puntaje:', 'arcade.record': 'Récord:',
            'arcade.instructions': 'Flechas/WASD + ESPACIO para disparar',
            'arcade.press-start': 'PRESIONA START',
            'footer.p1': '© 2026 Jorge Gastón Murúa. Desarrollado con dedicación.',
            'footer.p2': '¿Trabajamos juntos? Contactame por email o LinkedIn.'
        },
        en: {
            'section.inicio': 'Home', 'section.sobre-mi': 'About Me', 'section.proyectos': 'Projects',
            'section.habilidades': 'Skills', 'section.experiencia': 'Experience',
            'section.educacion': 'Education',
            'section.contacto': 'Contact', 'section.arcade': 'Arcade',
            'nav.inicio': 'Home', 'nav.sobre-mi': 'About Me', 'nav.proyectos': 'Projects',
            'nav.habilidades': 'Skills', 'nav.experiencia': 'Experience',
            'nav.educacion': 'Education', 'nav.contacto': 'Contact',
            'hero.subtitle': 'Advanced Software Development Technician',
            'hero.availability': 'Full Stack Developer · Open to new opportunities',
            'hero.cv': '<i class="fas fa-download"></i> Download CV',
            'about.title': 'About Me',
            'about.p1': 'I am an <b>Advanced Software Development Technician</b>, graduated in December 2024. I come from the <b>logistics sector</b>, where I accumulated <b>over 10 years of experience</b> in operations, coordination and problem-solving in dynamic environments.',
            'about.p2': 'I am specializing in <b>n8n automations</b>, <b>AI with Claude</b>, <b>digital marketing with AI</b> and <b>cybersecurity</b>. I run a <b>3D printing business</b> that I grow through automations to optimize processes and scale the business.',
            'about.p3': "I'm looking to join a team as a <b>Developer</b>, where I can bring that operational mindset and constant drive to learn. In the meantime, I keep building and growing my own projects in production.",
            'about.p4': 'Merlo, West Zone - Buenos Aires, Argentina.',
            'projects.title': 'Main Projects',
            'proj.gtresia.desc': 'My own AI automation agency for small and medium businesses. Landing page, n8n automation flows and AI agents for real business processes, in production.',
            'proj.gtresd.desc': 'My own custom 3D printing venture. Online store with product catalog, made-to-order pieces and presence on social media and Mercado Libre.',
            'proj.gtresd.stat': '5.0 on Google reviews',
            'link.sitio': 'Website',
            'proj.chat.desc': 'Real-time chat system developed in Python for the Networking Programming course. Implements client-server communication with sockets and handles multiple simultaneous users.',
            'proj.api.desc': 'Python application that consumes external APIs and integrates data with a MariaDB database. Includes data processing, REST API connections and database management.',
            'proj.api.link2': 'Database',
            'proj.gustashop.desc': 'Full e-commerce with React developed as a SPA (Single Page Application). Includes shopping cart, product management, reusable components and optimized global state.',
            'proj.gustashop.link1': 'Source code', 'proj.gustashop.link2': 'Live site',
            'proj.crud.desc': 'Complete authentication and user management system developed in PHP. Implements CRUD operations, secure login system, validations and session handling.',
            'proj.techstore.desc': 'Tech e-commerce developed with JavaScript and React. Tech product catalog, interactive cart, product management and modern responsive design.',
            'proj.techstore.link2': 'Online store',
            'link.demo': 'Demo', 'link.demo-login': 'Login demo',
            'skills.title': 'Technical Skills', 'skills.languages': 'Languages',
            'skills.frameworks': 'Frameworks & Libraries', 'skills.databases': 'Databases',
            'skills.tools': 'Tools & Platforms', 'skills.ai': 'Automation & AI',
            'skills.other': 'Other Areas',
            'exp.title': 'Work Experience',
            'exp.gtresde.title': 'Founder — GTresD (3D Printing)',
            'exp.gtresde.desc': 'Own 3D printing venture. Design, production and sale of 3D printed parts. Process optimization through automations to scale the business.',
            'exp.lesber.title': 'Driver & Operator',
            'exp.lesber.desc': 'Route optimization, real-time problem solving, customer interaction and load/unload management.',
            'exp.jom.title': 'Logistics Assistant',
            'exp.jom.desc': 'Package management and organization, use of tracking software, customer service and incident resolution.',
            'edu.title': 'Education & Training',
            'edu.tsds.title': 'Advanced Software Development Technician',
            'edu.tsds.desc': 'Comprehensive software development training with emphasis on agile methodologies and modern technologies.',
            'edu.n8n.desc': 'Workflow and process automation with n8n.',
            'edu.cyber.desc': 'Computer security, system protection and vulnerability analysis.',
            'edu.marketing.desc': 'Digital marketing strategies powered by artificial intelligence.',
            'edu.qa.desc': 'Manual and automated software testing.',
            'edu.nodejs.desc': 'Backend development with JavaScript and Node.js.',
            'edu.react.desc': 'User interface development with React.',
            'edu.php.desc': 'Backend development with PHP and MySQL databases.',
            'edu.iot.title': 'IoT & Robotics Course',
            'edu.iot.desc': 'Internet of Things and introduction to robotics with practical applications.',
            'edu.aws.title': 'AWS Fundamentals',
            'edu.aws.desc': 'Cloud computing and Amazon Web Services.',
            'edu.goals.title': '2026 Goals',
            'edu.goal1': 'Master Artificial Intelligence completely',
            'edu.goal2': 'AI and automation certifications',
            'edu.goal3': 'Specialize in Cybersecurity',
            'edu.goal4': 'Join a development team',
            'contact.title': 'Contact',
            'contact.subtitle': "Is your team looking to add someone with this profile? Reach out and let's talk.",
            'contact.hablemos': "Let's Talk",
            'contact.location': 'Merlo, West Zone · Buenos Aires, Argentina',
            'contact.wa': 'Direct WhatsApp',
            'form.nombre': 'Name', 'form.nombre.ph': 'Your full name',
            'form.email': 'Email', 'form.asunto': 'Subject', 'form.asunto.ph': 'What is it about?',
            'form.mensaje': 'Message', 'form.mensaje.ph': 'Tell me about your project or inquiry...',
            'form.submit': '<i class="fas fa-paper-plane"></i> Send message',
            'form.sending': '<i class="fas fa-spinner fa-spin"></i> Sending...',
            'form.success': "Message sent! I'll reply within 24 hours.",
            'form.error.server': 'There was an error sending. Try contacting me via WhatsApp.',
            'form.error.network': 'No connection. Try contacting me via WhatsApp.',
            'arcade.title': 'Arcade', 'arcade.score': 'Score:', 'arcade.record': 'Record:',
            'arcade.instructions': 'Arrows/WASD + SPACE to shoot',
            'arcade.press-start': 'PRESS START',
            'footer.p1': '© 2026 Jorge Gastón Murúa. Built with dedication.',
            'footer.p2': 'Want to work together? Contact me via email or LinkedIn.'
        }
    };

    function getLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'es';
    }

    function applyLang(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const t = TRANSLATIONS[lang];
            if (t && t[key] !== undefined) el.textContent = t[key];
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.dataset.i18nHtml;
            const t = TRANSLATIONS[lang];
            if (t && t[key] !== undefined) el.innerHTML = t[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            const t = TRANSLATIONS[lang];
            if (t && t[key] !== undefined) el.placeholder = t[key];
        });
        document.documentElement.lang = lang === 'es' ? 'es-AR' : 'en';
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
        const esOpt = document.getElementById('lang-opt-es');
        const enOpt = document.getElementById('lang-opt-en');
        if (esOpt) esOpt.classList.toggle('lang-opt--active', lang === 'es');
        if (enOpt) enOpt.classList.toggle('lang-opt--active', lang === 'en');
        updateSectionIndicator();
    }

    function initLang() {
        let lang = 'es';
        try {
            const saved = localStorage.getItem(LANG_KEY);
            if (saved === 'es' || saved === 'en') lang = saved;
        } catch (e) {}
        applyLang(lang);
        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.addEventListener('click', () => {
                applyLang(getLang() === 'es' ? 'en' : 'es');
            });
        }
    }

    /* ========== Indicador de sección ========== */
    function updateSectionIndicator() {
        const indicator = document.getElementById('section-indicator');
        if (!indicator) return;
        const lang = getLang();
        let current = 'inicio';
        document.querySelectorAll('section').forEach(section => {
            if (section.getBoundingClientRect().top <= 120) {
                current = section.getAttribute('id') || current;
            }
        });
        indicator.textContent = (TRANSLATIONS[lang] && TRANSLATIONS[lang]['section.' + current]) || current;
    }

    /* ========== Formulario de contacto ========== */
    function initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = form.querySelector('.form-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = (TRANSLATIONS[getLang()] || TRANSLATIONS.es)['form.sending'];
            btn.disabled = true;

            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    form.reset();
                    const t = TRANSLATIONS[getLang()] || TRANSLATIONS.es;
                    showFormMsg(form, 'success', t['form.success']);
                } else {
                    const t = TRANSLATIONS[getLang()] || TRANSLATIONS.es;
                    showFormMsg(form, 'error', t['form.error.server']);
                }
            } catch {
                const t = TRANSLATIONS[getLang()] || TRANSLATIONS.es;
                showFormMsg(form, 'error', t['form.error.network']);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    function showFormMsg(form, type, text) {
        const existing = form.querySelector('.form-msg');
        if (existing) existing.remove();
        const msg = document.createElement('div');
        msg.className = `form-msg form-msg--${type}`;
        msg.textContent = text;
        form.appendChild(msg);
        setTimeout(() => msg.remove(), 6000);
    }

    /* ========== Init ========== */
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initLang();
        initHamburger();
        initParticles();
        runTypewriter();
        initSectionAnimations();
        onScrollNav();
        updateSectionIndicator();
        initContactForm();
    });
})();