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
        if (!canvas || prefersReducedMotion()) return;

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
            if (prefersReducedMotion()) return;
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

    /* ========== Galaxy Shooter ========== */
    function initGalaxyGame() {
        const canvas = document.getElementById('flappy-canvas');
        if (!canvas) return null;

        const scoreEl = document.getElementById('flappy-score');
        const recordEl = document.getElementById('flappy-record');
        const ctx = canvas.getContext('2d');

        const baseW = Number.parseInt(canvas.getAttribute('width') || '400', 10);
        const baseH = Number.parseInt(canvas.getAttribute('height') || '360', 10);

        const STORAGE_KEY = 'galaxy_record';
        let record = Number.parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
        if (recordEl) recordEl.textContent = String(record);

        let rafId = null;
        let running = false;
        let gameOver = false;
        let lastTs = 0;
        let W = baseW, H = baseH, dpr = 1;

        const state = {
            score: 0,
            lives: 3,
            player: { x: 0, y: 0, w: 28, h: 28, vx: 0, vy: 0 },
            bullets: [],
            enemies: [],
            enemyBullets: [],
            explosions: [],
            stars: [],
            keys: { up: false, down: false, left: false, right: false, shoot: false },
            shootCooldown: 0,
            spawnTimer: 0,
            invulnerable: 0
        };

        function resize() {
            const cssW = canvas.clientWidth || baseW;
            const cssH = cssW * (baseH / baseW);
            dpr = window.devicePixelRatio || 1;
            canvas.style.height = cssH + 'px';
            canvas.width = Math.floor(cssW * dpr);
            canvas.height = Math.floor(cssH * dpr);
            W = cssW; H = cssH;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            state.player.w = Math.floor(W * 0.07);
            state.player.h = state.player.w;
            state.player.x = W * 0.12;
            state.player.y = H * 0.5 - state.player.h / 2;
            initStars();
        }

        function initStars() {
            state.stars = [];
            for (let i = 0; i < 50; i++) {
                state.stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    s: Math.random() * 2 + 1,
                    speed: Math.random() * 80 + 40
                });
            }
        }

        function reset() {
            resize();
            state.score = 0;
            state.lives = 3;
            state.bullets = [];
            state.enemies = [];
            state.enemyBullets = [];
            state.explosions = [];
            state.shootCooldown = 0;
            state.spawnTimer = 0;
            state.invulnerable = 0;
            state.player.vx = 0;
            state.player.vy = 0;
            state.player.x = W * 0.12;
            state.player.y = H * 0.5 - state.player.h / 2;
            state.keys = { up: false, down: false, left: false, right: false, shoot: false };
            gameOver = false;
            running = true;
            lastTs = 0;
            rafId = null;
            if (scoreEl) scoreEl.textContent = '0';
        }

        function setKey(key, val) {
            if (key === 'up') state.keys.up = val;
            if (key === 'down') state.keys.down = val;
            if (key === 'left') state.keys.left = val;
            if (key === 'right') state.keys.right = val;
            if (key === 'shoot') state.keys.shoot = val;
        }

        function shoot() {
            if (state.shootCooldown > 0) return;
            state.shootCooldown = 0.12;
            state.bullets.push({
                x: state.player.x + state.player.w,
                y: state.player.y + state.player.h / 2 - 2,
                w: 10,
                h: 4,
                speed: 400
            });
        }

        function drawBackground() {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);
            state.stars.forEach(star => {
                ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.3})`;
                ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.s, star.s);
            });
        }

        function drawPlayer() {
            const x = Math.floor(state.player.x);
            const y = Math.floor(state.player.y);
            const s = state.player.w;
            const flash = state.invulnerable > 0 && Math.floor(state.invulnerable * 10) % 2 === 0;
            if (flash) return;
            ctx.fillStyle = '#00d4ff';
            ctx.fillRect(x + s * 0.3, y, s * 0.4, s * 0.3);
            ctx.fillRect(x, y + s * 0.25, s, s * 0.3);
            ctx.fillRect(x + s * 0.1, y + s * 0.5, s * 0.8, s * 0.25);
            ctx.fillRect(x + s * 0.4, y + s * 0.7, s * 0.2, s * 0.3);
            ctx.fillStyle = '#ff6b35';
            ctx.fillRect(x + s * 0.2, y + s * 0.15, s * 0.2, s * 0.15);
            ctx.fillRect(x + s * 0.6, y + s * 0.15, s * 0.2, s * 0.15);
            ctx.fillStyle = '#fff';
            ctx.fillRect(x + s * 0.35, y + s * 0.35, s * 0.12, s * 0.12);
            ctx.fillRect(x + s * 0.55, y + s * 0.35, s * 0.12, s * 0.12);
            ctx.fillStyle = '#e040fb';
            ctx.fillRect(x + s * 0.45, y + s * 0.1, s * 0.1, s * 0.3);
        }

        function drawBullets() {
            state.bullets.forEach(b => {
                ctx.fillStyle = '#00ff88';
                ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
                ctx.fillStyle = '#88ffcc';
                ctx.fillRect(Math.floor(b.x), Math.floor(b.y + 1), b.w - 2, 2);
            });
        }

        function drawEnemies() {
            state.enemies.forEach(enemy => {
                const x = Math.floor(enemy.x);
                const y = Math.floor(enemy.y);
                const s = enemy.size;
                if (enemy.type === 0) {
                    ctx.fillStyle = '#ff3366';
                    ctx.fillRect(x + s * 0.2, y, s * 0.6, s * 0.25);
                    ctx.fillRect(x, y + s * 0.2, s, s * 0.4);
                    ctx.fillRect(x + s * 0.1, y + s * 0.55, s * 0.3, s * 0.25);
                    ctx.fillRect(x + s * 0.6, y + s * 0.55, s * 0.3, s * 0.25);
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(x + s * 0.25, y + s * 0.3, s * 0.2, s * 0.15);
                    ctx.fillRect(x + s * 0.55, y + s * 0.3, s * 0.2, s * 0.15);
                } else {
                    ctx.fillStyle = '#aa44ff';
                    ctx.fillRect(x + s * 0.15, y, s * 0.7, s * 0.35);
                    ctx.fillRect(x, y + s * 0.25, s, s * 0.35);
                    ctx.fillRect(x + s * 0.3, y + s * 0.55, s * 0.4, s * 0.2);
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(x + s * 0.2, y + s * 0.35, s * 0.25, s * 0.15);
                    ctx.fillRect(x + s * 0.55, y + s * 0.35, s * 0.25, s * 0.15);
                }
            });
        }

        function drawEnemyBullets() {
            state.enemyBullets.forEach(b => {
                ctx.fillStyle = '#ff3366';
                ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
            });
        }

        function drawExplosions() {
            state.explosions.forEach(exp => {
                const x = Math.floor(exp.x);
                const y = Math.floor(exp.y);
                const t = exp.timer / exp.maxTimer;
                ctx.fillStyle = `rgba(255, ${Math.floor(200 * t)}, 0, ${t})`;
                ctx.fillRect(x - exp.size * (1 - t), y - exp.size * (1 - t), exp.size * 2 * t, exp.size * 2 * t);
            });
        }

        function drawUI() {
            ctx.fillStyle = '#fff';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('SCORE:' + state.score, 6, 12);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ff3366';
            ctx.fillText('♥'.repeat(state.lives), W - 6, 12);
        }

        function update(ts) {
            if (!running) return;
            const dt = lastTs ? (ts - lastTs) / 1000 : 0;
            lastTs = ts;

            const accel = 1200;
            const friction = 0.85;
            const maxVel = 280;

            if (state.keys.up) state.player.vy -= accel * dt;
            if (state.keys.down) state.player.vy += accel * dt;
            if (state.keys.left) state.player.vx -= accel * dt;
            if (state.keys.right) state.player.vx += accel * dt;
            if (state.keys.shoot) shoot();

            state.player.vx *= friction;
            state.player.vy *= friction;
            state.player.vx = Math.max(-maxVel, Math.min(maxVel, state.player.vx));
            state.player.vy = Math.max(-maxVel, Math.min(maxVel, state.player.vy));

            state.player.x += state.player.vx * dt;
            state.player.y += state.player.vy * dt;

            state.player.x = Math.max(0, Math.min(W - state.player.w, state.player.x));
            state.player.y = Math.max(0, Math.min(H - state.player.h, state.player.y));

            state.shootCooldown = Math.max(0, state.shootCooldown - dt);
            state.invulnerable = Math.max(0, state.invulnerable - dt);

            state.stars.forEach(star => {
                star.x -= star.speed * dt;
                if (star.x < 0) { star.x = W; star.y = Math.random() * H; }
            });

            state.bullets.forEach(b => { b.x += b.speed * dt; });
            state.bullets = state.bullets.filter(b => b.x < W + 20);

            state.enemyBullets.forEach(b => { b.x -= 180 * dt; b.y += b.vy * dt; });
            state.enemyBullets = state.enemyBullets.filter(b => b.x > -20 && b.y > 0 && b.y < H);

            state.explosions.forEach(exp => { exp.timer -= dt; });
            state.explosions = state.explosions.filter(exp => exp.timer > 0);

            state.spawnTimer += dt;
            const spawnRate = Math.max(0.35, 0.9 - state.score * 0.008);
            if (state.spawnTimer >= spawnRate) {
                state.spawnTimer = 0;
                const size = Math.floor(W * 0.06 + Math.random() * W * 0.04);
                state.enemies.push({
                    x: W + 10,
                    y: Math.random() * (H - size - 16) + 8,
                    size: size,
                    type: Math.floor(Math.random() * 2),
                    speed: 100 + state.score * 1.5 + Math.random() * 30,
                    shootTimer: Math.random() * 2
                });
            }

            state.enemies.forEach(enemy => {
                enemy.x -= enemy.speed * dt;
                enemy.shootTimer -= dt;
                if (enemy.shootTimer <= 0 && enemy.x < W - 40) {
                    enemy.shootTimer = 1.5 + Math.random() * 2;
                    state.enemyBullets.push({
                        x: enemy.x,
                        y: enemy.y + enemy.size / 2 - 2,
                        w: 6,
                        h: 4,
                        vy: (state.player.y - enemy.y) * 0.4
                    });
                }
            });
            state.enemies = state.enemies.filter(e => e.x + e.size > -20);

            const { x: px, y: py, w, h } = state.player;
            state.bullets.forEach(bullet => {
                state.enemies.forEach((enemy, ei) => {
                    if (bullet.x < enemy.x + enemy.size && bullet.x + bullet.w > enemy.x &&
                        bullet.y < enemy.y + enemy.size && bullet.y + bullet.h > enemy.y) {
                        state.explosions.push({
                            x: enemy.x + enemy.size / 2,
                            y: enemy.y + enemy.size / 2,
                            size: enemy.size * 0.5,
                            timer: 0.25,
                            maxTimer: 0.25
                        });
                        state.enemies.splice(ei, 1);
                        bullet.x = W + 100;
                        state.score += 10;
                        if (scoreEl) scoreEl.textContent = String(state.score);
                    }
                });
            });

            if (state.invulnerable <= 0) {
                state.enemyBullets.forEach((bullet, bi) => {
                    if (bullet.x < px + w && bullet.x + bullet.w > px &&
                        bullet.y < py + h && bullet.y + bullet.h > py) {
                        state.enemyBullets.splice(bi, 1);
                        hitPlayer();
                    }
                });
                state.enemies.forEach((enemy, ei) => {
                    const inX = px + w > enemy.x + enemy.size * 0.15 && px < enemy.x + enemy.size * 0.85;
                    const inY = py + h > enemy.y + enemy.size * 0.15 && py < enemy.y + enemy.size * 0.85;
                    if (inX && inY) {
                        state.enemies.splice(ei, 1);
                        hitPlayer();
                    }
                });
            }
        }

        function hitPlayer() {
            state.lives--;
            state.invulnerable = 1.5;
            state.explosions.push({
                x: state.player.x + state.player.w / 2,
                y: state.player.y + state.player.h / 2,
                size: state.player.w * 0.7,
                timer: 0.35,
                maxTimer: 0.35
            });
            if (state.lives <= 0) endGame();
        }

        function endGame() {
            if (gameOver) return;
            gameOver = true;
            running = false;
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            if (state.score > record) {
                record = state.score;
                localStorage.setItem(STORAGE_KEY, String(record));
                if (recordEl) recordEl.textContent = String(record);
            }
        }

        function draw() {
            drawBackground();
            drawBullets();
            drawEnemies();
            drawEnemyBullets();
            drawExplosions();
            drawPlayer();
            drawUI();

            if (gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#ff3366';
                ctx.textAlign = 'center';
                ctx.font = '12px "Press Start 2P", monospace';
                ctx.fillText('GAME OVER', W / 2, H / 2 - 18);
                ctx.fillStyle = '#fff';
                ctx.font = '8px "Press Start 2P", monospace';
                ctx.fillText('SCORE: ' + state.score, W / 2, H / 2 + 5);
                ctx.fillStyle = '#00ff88';
                ctx.fillText((TRANSLATIONS[getLang()] || TRANSLATIONS.es)['arcade.press-start'], W / 2, H / 2 + 22);
            }
        }

        function loop(ts) {
            if (!running) return;
            update(ts);
            draw();
            rafId = requestAnimationFrame(loop);
        }

        function start() {
            if (running) return;
            reset();
            draw();
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(loop);
        }

        function pause() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        }

        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); setKey('up', true); }
            if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); setKey('down', true); }
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); setKey('left', true); }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); setKey('right', true); }
            if (e.code === 'Space' || e.code === 'KeyZ') { e.preventDefault(); setKey('shoot', true); }
            if (e.code === 'Enter' || e.code === 'KeyX' || e.code === 'KeyB') {
                e.preventDefault();
                if (!running) start();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') setKey('up', false);
            if (e.code === 'ArrowDown' || e.code === 'KeyS') setKey('down', false);
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') setKey('left', false);
            if (e.code === 'ArrowRight' || e.code === 'KeyD') setKey('right', false);
            if (e.code === 'Space') setKey('shoot', false);
        });

        function addBtnEvents(btn, key) {
            if (!btn) return;
            const press = () => { btn.classList.add('pressed'); setKey(key, true); };
            const release = () => {
                btn.classList.remove('pressed');
                btn.classList.add('pressing');
                setKey(key, false);
                setTimeout(() => btn.classList.remove('pressing'), 150);
            };
            btn.addEventListener('mousedown', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('mouseleave', release);
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); press(); }, { passive: false });
            btn.addEventListener('touchend', release);
        }

        addBtnEvents(document.getElementById('flappy-up'), 'up');
        addBtnEvents(document.getElementById('flappy-down'), 'down');
        addBtnEvents(document.getElementById('flappy-left'), 'left');
        addBtnEvents(document.getElementById('flappy-right'), 'right');
        addBtnEvents(document.getElementById('flappy-shoot'), 'shoot');

        const bBtn = document.getElementById('flappy-start');
        if (bBtn) {
            bBtn.addEventListener('mousedown', () => { bBtn.classList.add('pressed'); start(); });
            bBtn.addEventListener('mouseup', () => {
                bBtn.classList.remove('pressed');
                bBtn.classList.add('pressing');
                setTimeout(() => bBtn.classList.remove('pressing'), 150);
            });
            bBtn.addEventListener('mouseleave', () => bBtn.classList.remove('pressed'));
            bBtn.addEventListener('touchstart', (e) => { e.preventDefault(); bBtn.classList.add('pressed'); start(); }, { passive: false });
            bBtn.addEventListener('touchend', () => {
                bBtn.classList.remove('pressed');
                bBtn.classList.add('pressing');
                setTimeout(() => bBtn.classList.remove('pressing'), 150);
            });
        }

        canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (!running) start();
        }, { passive: false });

        window.addEventListener('resize', () => { if (running) resize(); });

        resize();
        draw();

        return { start, pause, isPlaying: () => running };
    }

    /* ========== Menú hamburguesa ========== */
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

        const galaxy = initGalaxyGame();

        window.addEventListener('portfolio-theme', (e) => {
            if (e.detail === 'dark') {
                if (galaxy && typeof galaxy.pause === 'function') galaxy.pause();
            }
        });
    });
})();