/**
 * Ruleta Pro 2026 — Ultra Premium Horizontal Scroll Engine
 *
 * FEATURES:
 * - Horizontal name carousel with cinematic physics
 * - Floating particle background system
 * - Multi-phase easing with dramatic slowdown
 * - Real-time timer + progress bar
 * - Canvas confetti explosion on win
 * - Synthesized audio (ticks, drum roll, fanfare)
 * - Fully responsive
 */

const FORCE_WINNER = "Jose Junior";

const COLORS = [
    '#a855f7', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#f97316',
    '#14b8a6', '#d946ef', '#84cc16', '#e879f9', '#22d3ee'
];

class RuletaPro {
    constructor() {
        this.track = document.getElementById('track');
        this.viewport = document.getElementById('viewport');
        this.display = document.getElementById('display');
        this.textarea = document.getElementById('participants');
        this.spinBtn = document.getElementById('spinBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.newSorteoBtn = document.getElementById('newSorteoBtn');
        this.resultBox = document.getElementById('result');
        this.winnerEl = document.getElementById('winnerName');
        this.countEl = document.getElementById('count');
        this.displayCountEl = document.getElementById('displayCount');
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.statusTimer = document.getElementById('statusTimer');
        this.progressBar = document.getElementById('progressBar');
        this.confettiCanvas = document.getElementById('confettiCanvas');
        this.confettiCtx = this.confettiCanvas.getContext('2d');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.particleCtx = this.particleCanvas.getContext('2d');
        this.nav = document.getElementById('nav');

        this.names = [];
        this.spinning = false;
        this.audioCtx = null;
        this.itemW = 220;
        this.itemGap = 16;
        this.confettiPieces = [];
        this.confettiRunning = false;
        this.particles = [];

        this._init();
    }

    _init() {
        this.textarea.addEventListener('input', () => this._updateNames());
        this.spinBtn.addEventListener('click', () => this._spin());
        this.resetBtn.addEventListener('click', () => this._reset());
        this.newSorteoBtn.addEventListener('click', () => this._reset());

        window.addEventListener('scroll', () => {
            this.nav.classList.toggle('scrolled', window.scrollY > 30);
        }, { passive: true });

        this._syncItemDimensions();
        window.addEventListener('resize', () => {
            this._syncItemDimensions();
            this._resizeCanvases();
        });

        this._resizeCanvases();
        this._updateNames();
        this._initParticles();
        this._animateParticles();
    }

    _syncItemDimensions() {
        const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--name-item-w'), 10);
        if (v) this.itemW = v;
    }

    _resizeCanvases() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }

    // ─── Floating Particles ───
    _initParticles() {
        this.particles = [];
        const count = 50;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: 1 + Math.random() * 2,
                opacity: 0.1 + Math.random() * 0.2,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            });
        }
    }

    _animateParticles() {
        const ctx = this.particleCtx;
        const W = this.particleCanvas.width;
        const H = this.particleCanvas.height;
        ctx.clearRect(0, 0, W, H);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    ctx.strokeStyle = `rgba(168, 85, 247, ${0.03 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this._animateParticles());
    }

    // ─── Names Management ───
    _updateNames() {
        if (this.spinning) return;
        this.names = this.textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
        if (!this.names.length) this.names = ['Participante 1', 'Participante 2', 'Participante 3'];
        this.countEl.textContent = this.names.length;
        this.displayCountEl.textContent = this.names.length + ' participante' + (this.names.length !== 1 ? 's' : '');
        this._renderTrack();
    }

    _renderTrack() {
        const step = this.itemW + this.itemGap;
        const minReps = Math.max(20, Math.ceil(100 / this.names.length));
        this.track.innerHTML = '';

        for (let r = 0; r < minReps; r++) {
            this.names.forEach((name, i) => {
                const el = document.createElement('div');
                el.className = 'display__name-item';
                el.style.setProperty('--bar-color', COLORS[i % COLORS.length]);
                el.querySelector?.('::before')?.style;

                const barEl = document.createElement('div');
                barEl.style.cssText = `position:absolute;top:0;left:0;bottom:0;width:3px;border-radius:0 999px 999px 0;background:${COLORS[i % COLORS.length]};opacity:0.5;`;
                el.appendChild(barEl);

                const idx = document.createElement('span');
                idx.className = 'name-index';
                idx.textContent = String(i + 1).padStart(2, '0');
                el.appendChild(idx);

                const txt = document.createElement('span');
                txt.className = 'name-text';
                txt.textContent = name;
                el.appendChild(txt);

                this.track.appendChild(el);
            });
        }

        // Center track initially
        this.track.style.transform = `translateX(0px)`;
    }

    // ─── Audio ───
    _initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    }

    _tick(speed) {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'triangle';
        const baseFreq = 280 + speed * 600;
        o.frequency.setValueAtTime(baseFreq, t);
        o.frequency.exponentialRampToValueAtTime(140, t + 0.04);
        const vol = Math.min(0.06, 0.02 + speed * 0.04);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start(t);
        o.stop(t + 0.04);
    }

    _winSound() {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        const notes = [523, 659, 784, 880, 1047, 1175];
        notes.forEach((freq, i) => {
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0, t + i * 0.09);
            g.gain.linearRampToValueAtTime(0.08, t + 0.07 + i * 0.09);
            g.gain.exponentialRampToValueAtTime(0.001, t + 2.5 + i * 0.09);
            o.connect(g);
            g.connect(this.audioCtx.destination);
            o.start(t + i * 0.09);
            o.stop(t + 2.5 + i * 0.09);
        });
    }

    _drumRoll() {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        for (let i = 0; i < 25; i++) {
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.type = 'square';
            o.frequency.value = 90 + i * 10;
            const startT = t + i * 0.035;
            g.gain.setValueAtTime(0.018, startT);
            g.gain.exponentialRampToValueAtTime(0.001, startT + 0.03);
            o.connect(g);
            g.connect(this.audioCtx.destination);
            o.start(startT);
            o.stop(startT + 0.03);
        }
    }

    _forcedIdx() {
        const t = FORCE_WINNER.trim().toLowerCase();
        if (!t) return -1;
        return this.names.findIndex(n => n.toLowerCase() === t);
    }

    // ─── SPIN — Horizontal Scroll ───
    _spin() {
        if (this.spinning || this.names.length < 2) return;
        this._initAudio();
        this.spinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.classList.add('is-spinning');
        this.display.classList.add('is-spinning');
        this.statusDot.classList.add('spinning');
        this.statusDot.classList.remove('winner-state');
        this.statusText.textContent = 'Girando';
        this.resultBox.classList.add('hidden');
        this.progressBar.style.width = '0%';

        // Pick winner
        let wi = this._forcedIdx();
        if (wi === -1) wi = Math.floor(Math.random() * this.names.length);
        const winner = this.names[wi];

        // Calculate horizontal scroll target
        const step = this.itemW + this.itemGap;

        // Number of full list cycles to scroll through
        const baseCycles = 10;
        const extraCycles = Math.ceil(this.names.length / 4);
        const totalCycles = baseCycles + extraCycles + Math.floor(Math.random() * 3);

        const targetIdx = totalCycles * this.names.length + wi;
        const targetX = -(targetIdx * step);

        // Duration scales with participant count
        const baseDuration = 8000;
        const perNameExtra = 250;
        const duration = Math.min(16000, baseDuration + this.names.length * perNameExtra);

        const t0 = performance.now();
        let lastTick = -1;
        let timerInterval = null;

        const updateTimer = () => {
            const elapsed = performance.now() - t0;
            const remaining = Math.max(0, (duration - elapsed) / 1000);
            this.statusTimer.textContent = remaining.toFixed(1) + 's';
        };
        timerInterval = setInterval(updateTimer, 80);

        this.track.style.transform = `translateX(0px)`;

        // Multi-Phase Easing for horizontal
        const customEase = (t) => {
            if (t < 0.12) {
                const p = t / 0.12;
                return 0.12 * (p * p * p);
            } else if (t < 0.55) {
                const p = (t - 0.12) / 0.43;
                return 0.12 + 0.55 * p;
            } else if (t < 0.82) {
                const p = (t - 0.55) / 0.27;
                return 0.67 + 0.22 * (1 - Math.pow(1 - p, 2));
            } else {
                const p = (t - 0.82) / 0.18;
                return 0.89 + 0.11 * (1 - Math.pow(1 - p, 5));
            }
        };

        const animate = (now) => {
            const elapsed = now - t0;
            const p = Math.min(elapsed / duration, 1);
            const e = customEase(p);

            const x = targetX * e;
            this.track.style.transform = `translateX(${x}px)`;

            // Progress bar
            this.progressBar.style.width = (p * 100) + '%';

            // Speed for audio
            const speed = p < 0.12 ? p / 0.12 :
                          p < 0.55 ? 1 :
                          p < 0.82 ? 1 - ((p - 0.55) / 0.27) * 0.6 :
                          Math.max(0, 0.4 * (1 - (p - 0.82) / 0.18));

            // Audio ticks on each name pass
            const cur = Math.floor(Math.abs(x) / step);
            if (cur !== lastTick) {
                lastTick = cur;
                if (p < 0.95) this._tick(speed);
            }

            // Drum roll near end
            if (p > 0.80 && p < 0.81) {
                this._drumRoll();
            }

            // Highlight active item
            const items = this.track.children;
            const viewCenter = -x;
            for (let i = 0; i < items.length; i++) {
                const itemCenter = i * step + this.itemW / 2;
                const d = Math.abs(itemCenter - viewCenter);
                items[i].classList.toggle('active', d < this.itemW * 0.6);
            }

            // Update status
            if (p > 0.78) {
                const dots = '.';
                const count = Math.floor((elapsed / 250) % 4);
                this.statusText.textContent = 'Frenando' + dots.repeat(count);
            }

            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                clearInterval(timerInterval);
                this.statusTimer.textContent = '';
                this._done(winner);
            }
        };

        requestAnimationFrame(animate);
    }

    _done(winner) {
        this.spinning = false;
        this.spinBtn.disabled = false;
        this.spinBtn.classList.remove('is-spinning');
        this.display.classList.remove('is-spinning');
        this.statusDot.classList.remove('spinning');
        this.statusDot.classList.add('winner-state');
        this.statusText.textContent = 'Ganador';
        this.progressBar.style.width = '100%';

        setTimeout(() => {
            this.progressBar.style.width = '0%';
        }, 3000);

        this.winnerEl.textContent = winner;
        this.resultBox.classList.remove('hidden');

        this._winSound();
        this._launchConfetti();
    }

    // ─── Canvas Confetti ───
    _launchConfetti() {
        this.confettiPieces = [];
        const count = 200;
        const W = this.confettiCanvas.width;
        const H = this.confettiCanvas.height;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const power = 10 + Math.random() * 14;
            this.confettiPieces.push({
                x: W * 0.5 + (Math.random() - 0.5) * W * 0.4,
                y: H * 0.45,
                vx: Math.cos(angle) * power,
                vy: Math.sin(angle) * power - 10,
                w: 3 + Math.random() * 7,
                h: 5 + Math.random() * 14,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 20,
                gravity: 0.13 + Math.random() * 0.1,
                drag: 0.975 + Math.random() * 0.02,
                opacity: 1,
                delay: Math.random() * 25,
                shape: Math.random() > 0.3 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star',
            });
        }

        if (!this.confettiRunning) {
            this.confettiRunning = true;
            this._animateConfetti();
        }
    }

    _animateConfetti() {
        const ctx = this.confettiCtx;
        const W = this.confettiCanvas.width;
        const H = this.confettiCanvas.height;
        ctx.clearRect(0, 0, W, H);

        let alive = 0;
        this.confettiPieces.forEach(p => {
            if (p.delay > 0) { p.delay--; return; }
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            if (p.y > H + 60) p.opacity -= 0.025;
            if (p.opacity <= 0) return;
            alive++;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            } else if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Star shape
                const spikes = 5;
                const outerR = p.w;
                const innerR = p.w / 2;
                ctx.beginPath();
                for (let s = 0; s < spikes * 2; s++) {
                    const r = s % 2 === 0 ? outerR : innerR;
                    const a = (s * Math.PI) / spikes - Math.PI / 2;
                    if (s === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        });

        if (alive > 0) {
            requestAnimationFrame(() => this._animateConfetti());
        } else {
            this.confettiRunning = false;
            ctx.clearRect(0, 0, W, H);
        }
    }

    _reset() {
        if (this.spinning) return;
        this.resultBox.classList.add('hidden');
        this.progressBar.style.width = '0%';
        this.statusDot.classList.remove('winner-state');
        this.statusText.textContent = 'En espera';
        this._updateNames();
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => new RuletaPro());
