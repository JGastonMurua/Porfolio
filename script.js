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
            metaTheme.setAttribute('content', theme === 'light' ? '#f0f4ff' : '#0a0a0f');
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

            ctx.fillStyle = '#0a0a0f';
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
                ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 102, 255, ${alpha * 0.12})`;
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

    /* ========== Contador de visitas ========== */
    async function loadVisitCounter() {
        const el = document.getElementById('visit-counter');
        if (!el) return;

        const fallback = () => {
            const prev = Number.parseInt(localStorage.getItem('visit-fallback') || '0', 10);
            const next = prev + 1;
            localStorage.setItem('visit-fallback', String(next));
            el.textContent = `${(TRANSLATIONS[getLang()] || TRANSLATIONS.es)['footer.visits']} ${next}`;
        };

        try {
            const res = await fetch(`https://api.countapi.xyz/hit/jgastonmurua-portfolio/visits?amount=1`, { cache: 'no-store' });
            const data = await res.json();
            const value = data && typeof data.value !== 'undefined' ? data.value : null;
            if (value === null) return fallback();
            el.textContent = `${(TRANSLATIONS[getLang()] || TRANSLATIONS.es)['footer.visits']} ${value}`;
        } catch (e) { fallback(); }
    }

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
            'section.educacion': 'Educación', 'section.servicios': 'Servicios',
            'section.contacto': 'Contacto', 'section.arcade': 'Arcade',
            'nav.inicio': 'Inicio', 'nav.sobre-mi': 'Sobre mí', 'nav.proyectos': 'Proyectos',
            'nav.habilidades': 'Habilidades', 'nav.experiencia': 'Experiencia',
            'nav.educacion': 'Educación', 'nav.servicios': 'Servicios', 'nav.contacto': 'Contacto',
            'hero.subtitle': 'Técnico Superior en Desarrollo de Software',
            'hero.cv': '<i class="fas fa-download"></i> Descargar CV',
            'about.title': 'Sobre mí',
            'about.p1': 'Soy <b>Técnico Superior en Desarrollo de Software</b>, graduado en diciembre 2024. Vengo del <b>sector logístico</b>, donde acumulé <b>más de 10 años de experiencia</b> en operaciones, coordinación y resolución de problemas en entornos dinámicos.',
            'about.p2': 'Me estoy especializando en <b>automatizaciones con n8n</b>, <b>IA con Claude</b>, <b>marketing digital con IA</b> y <b>ciberseguridad</b>. Tengo un <b>emprendimiento de impresión 3D</b> que hago crecer mediante automatizaciones para optimizar procesos y escalar el negocio.',
            'about.p3': 'Busco oportunidades como <b>Developer Junior</b> y ofrezco <b>servicios freelance de desarrollo web y automatizaciones</b> para quienes necesiten soluciones técnicas claras, mantenibles y alineadas a sus objetivos.',
            'about.p4': 'Merlo, Zona Oeste - Buenos Aires, Argentina.',
            'projects.title': 'Proyectos principales',
            'proj.chat.desc': 'Sistema de chat en tiempo real desarrollado en Python para la cursada de Programación sobre redes. Implementa comunicación cliente-servidor con sockets y manejo de múltiples usuarios simultáneos.',
            'proj.api.desc': 'Aplicación Python que consume APIs externas e integra los datos con base de datos MariaDB. Incluye procesamiento de datos, conexiones a APIs REST y gestión de base de datos.',
            'proj.api.link2': 'Base de datos',
            'proj.gustashop.desc': 'E-commerce completo con React desarrollado como SPA (Single Page Application). Incluye carrito de compras, gestión de productos, componentes reutilizables y estado global optimizado.',
            'proj.gustashop.link1': 'Código fuente', 'proj.gustashop.link2': 'Sitio live',
            'proj.crud.desc': 'Sistema completo de autenticación y gestión de usuarios desarrollado en PHP. Implementa operaciones CRUD, sistema de login seguro, validaciones y manejo de sesiones.',
            'proj.techstore.desc': 'E-commerce de tecnología desarrollado con JavaScript y React. Catálogo de productos tech, carrito interactivo, gestión de productos y diseño responsive moderno.',
            'proj.techstore.link1': 'Repositorio', 'proj.techstore.link2': 'Tienda online',
            'proj.portfolio.desc': 'Portafolio personal desarrollado para mostrar proyectos, habilidades y experiencia profesional. Diseño responsive, animaciones fluidas y optimizado para conversión.',
            'proj.portfolio.link1': 'Ver portfolio', 'proj.portfolio.link2': 'Sitio web',
            'link.ver-codigo': 'Ver código', 'link.demo': 'Demo', 'link.demo-login': 'Demo login',
            'skills.title': 'Habilidades técnicas', 'skills.languages': 'Lenguajes',
            'skills.frameworks': 'Frameworks y librerías', 'skills.databases': 'Bases de datos',
            'skills.tools': 'Herramientas', 'skills.ai': 'Automatización e IA',
            'skills.methodologies': 'Metodologías', 'skills.specialties': 'Especialidades',
            'skills.platforms': 'Plataformas y hosting',
            'exp.title': 'Experiencia laboral',
            'exp.gtresde.title': 'Fundador — GTresde (Impresión 3D)',
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
            'edu.goal4': 'Consolidar servicios freelance de automatización',
            'services.title': 'Servicios',
            'services.subtitle': 'Soluciones a medida para tu negocio. Trabajamos juntos desde la idea hasta el resultado.',
            'srv.landing.title': 'Landing Page Profesional',
            'srv.landing.desc': 'Sitio web de una página optimizado para convertir visitas en clientes. Diseño responsive, rápido y con SEO incluido.',
            'srv.ecommerce.title': 'E-commerce Completo',
            'srv.ecommerce.desc': 'Tienda online con catálogo, carrito, pagos y panel de administración. Lista para vender desde el primer día.',
            'srv.n8n.title': 'Automatizaciones con n8n',
            'srv.n8n.desc': 'Automatizá procesos repetitivos: emails, reportes, sincronización entre sistemas, notificaciones y más.',
            'srv.chatbot.title': 'Chatbot con IA',
            'srv.chatbot.desc': 'Asistente inteligente para tu negocio integrado con Claude o GPT. Responde consultas, califica leads y atiende 24/7.',
            'srv.api.title': 'Integración de APIs',
            'srv.api.desc': 'Conectá tus herramientas y sistemas entre sí. Integraciones con cualquier API REST: pagos, CRM, logística, redes sociales.',
            'srv.maintenance.title': 'Mantenimiento Web',
            'srv.maintenance.desc': 'Soporte técnico mensual para tu sitio: actualizaciones, backups, corrección de errores y mejoras continuas.',
            'srv.cta': 'Consultar',
            'contact.title': 'Contacto',
            'contact.subtitle': '¿Tenés un proyecto en mente? Contame de qué se trata y te respondo en menos de 24 horas.',
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
            'footer.p2': '¿Trabajamos juntos? Contactame por email o LinkedIn.',
            'footer.visits': 'Visitas al sitio:'
        },
        en: {
            'section.inicio': 'Home', 'section.sobre-mi': 'About Me', 'section.proyectos': 'Projects',
            'section.habilidades': 'Skills', 'section.experiencia': 'Experience',
            'section.educacion': 'Education', 'section.servicios': 'Services',
            'section.contacto': 'Contact', 'section.arcade': 'Arcade',
            'nav.inicio': 'Home', 'nav.sobre-mi': 'About Me', 'nav.proyectos': 'Projects',
            'nav.habilidades': 'Skills', 'nav.experiencia': 'Experience',
            'nav.educacion': 'Education', 'nav.servicios': 'Services', 'nav.contacto': 'Contact',
            'hero.subtitle': 'Advanced Software Development Technician',
            'hero.cv': '<i class="fas fa-download"></i> Download CV',
            'about.title': 'About Me',
            'about.p1': 'I am an <b>Advanced Software Development Technician</b>, graduated in December 2024. I come from the <b>logistics sector</b>, where I accumulated <b>over 10 years of experience</b> in operations, coordination and problem-solving in dynamic environments.',
            'about.p2': 'I am specializing in <b>n8n automations</b>, <b>AI with Claude</b>, <b>digital marketing with AI</b> and <b>cybersecurity</b>. I run a <b>3D printing business</b> that I grow through automations to optimize processes and scale the business.',
            'about.p3': 'I am looking for opportunities as a <b>Junior Developer</b> and offer <b>freelance web development and automation services</b> for those who need clear, maintainable technical solutions aligned with their goals.',
            'about.p4': 'Merlo, West Zone - Buenos Aires, Argentina.',
            'projects.title': 'Main Projects',
            'proj.chat.desc': 'Real-time chat system developed in Python for the Networking Programming course. Implements client-server communication with sockets and handles multiple simultaneous users.',
            'proj.api.desc': 'Python application that consumes external APIs and integrates data with a MariaDB database. Includes data processing, REST API connections and database management.',
            'proj.api.link2': 'Database',
            'proj.gustashop.desc': 'Full e-commerce with React developed as a SPA (Single Page Application). Includes shopping cart, product management, reusable components and optimized global state.',
            'proj.gustashop.link1': 'Source code', 'proj.gustashop.link2': 'Live site',
            'proj.crud.desc': 'Complete authentication and user management system developed in PHP. Implements CRUD operations, secure login system, validations and session handling.',
            'proj.techstore.desc': 'Tech e-commerce developed with JavaScript and React. Tech product catalog, interactive cart, product management and modern responsive design.',
            'proj.techstore.link1': 'Repository', 'proj.techstore.link2': 'Online store',
            'proj.portfolio.desc': 'Personal portfolio developed to showcase projects, skills and professional experience. Responsive design, smooth animations and optimized for conversion.',
            'proj.portfolio.link1': 'View portfolio', 'proj.portfolio.link2': 'Website',
            'link.ver-codigo': 'View code', 'link.demo': 'Demo', 'link.demo-login': 'Login demo',
            'skills.title': 'Technical Skills', 'skills.languages': 'Languages',
            'skills.frameworks': 'Frameworks & Libraries', 'skills.databases': 'Databases',
            'skills.tools': 'Tools', 'skills.ai': 'Automation & AI',
            'skills.methodologies': 'Methodologies', 'skills.specialties': 'Specialties',
            'skills.platforms': 'Platforms & Hosting',
            'exp.title': 'Work Experience',
            'exp.gtresde.title': 'Founder — GTresde (3D Printing)',
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
            'edu.goal4': 'Consolidate freelance automation services',
            'services.title': 'Services',
            'services.subtitle': 'Custom solutions for your business. We work together from idea to result.',
            'srv.landing.title': 'Professional Landing Page',
            'srv.landing.desc': 'One-page website optimized to convert visitors into clients. Responsive design, fast and with SEO included.',
            'srv.ecommerce.title': 'Full E-commerce',
            'srv.ecommerce.desc': 'Online store with catalog, cart, payments and admin panel. Ready to sell from day one.',
            'srv.n8n.title': 'n8n Automations',
            'srv.n8n.desc': 'Automate repetitive processes: emails, reports, system sync, notifications and more.',
            'srv.chatbot.title': 'AI Chatbot',
            'srv.chatbot.desc': 'Intelligent assistant for your business integrated with Claude or GPT. Answers queries, qualifies leads and operates 24/7.',
            'srv.api.title': 'API Integration',
            'srv.api.desc': 'Connect your tools and systems together. Integrations with any REST API: payments, CRM, logistics, social networks.',
            'srv.maintenance.title': 'Web Maintenance',
            'srv.maintenance.desc': 'Monthly technical support for your site: updates, backups, bug fixes and continuous improvements.',
            'srv.cta': 'Inquire',
            'contact.title': 'Contact',
            'contact.subtitle': "Got a project in mind? Tell me about it and I'll get back to you within 24 hours.",
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
            'footer.p2': 'Want to work together? Contact me via email or LinkedIn.',
            'footer.visits': 'Site visits:'
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
        loadVisitCounter();
        initContactForm();

        const galaxy =
    window.addEventListener('portfolio-theme', (e) => {
            if (e.detail === 'dark') {
                if (galaxy && typeof galaxy.pause === 'function') galaxy.pause();
            }
        });
    });
})();