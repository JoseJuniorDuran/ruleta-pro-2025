/**
 * Ruleta Pro 2025 — Premium Slot Engine v3
 * 
 * KEY IMPROVEMENT: Spin duration now SCALES with number of participants.
 * - More names = longer spin, so the audience sees EVERY name scroll past
 * - Minimum 8 seconds, up to 14+ seconds for large lists
 * - Multi-phase easing: fast → cruise → dramatic slowdown
 * - Real-time timer display so viewers feel the suspense
 */

const FORCE_WINNER = "Jose Junior";

const COLORS = [
    '#5afa9e', '#818cf8', '#f59e0b', '#ef4444', '#38bdf8',
    '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#22d3ee',
    '#fbbf24', '#6ee7b7', '#c084fc', '#fb7185', '#67e8f9'
];

class RuletaPro {
    constructor() {
        // DOM references
        this.track = document.getElementById('track');
        this.machine = document.getElementById('machine');
        this.textarea = document.getElementById('participants');
        this.spinBtn = document.getElementById('spinBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.resultBox = document.getElementById('result');
        this.winnerEl = document.getElementById('winnerName');
        this.countEl = document.getElementById('count');
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.statusTimer = document.getElementById('statusTimer');
        this.progressBar = document.getElementById('progressBar');
        this.confettiCanvas = document.getElementById('confettiCanvas');
        this.confettiCtx = this.confettiCanvas.getContext('2d');
        this.nav = document.getElementById('nav');

        // State
        this.names = [];
        this.spinning = false;
        this.audioCtx = null;
        this.itemH = 74;
        this.confettiPieces = [];
        this.confettiRunning = false;

        this._init();
    }

    _init() {
        this.textarea.addEventListener('input', () => this._updateNames());
        this.spinBtn.addEventListener('click', () => this._spin());
        this.resetBtn.addEventListener('click', () => this._reset());

        // Nav scroll
        window.addEventListener('scroll', () => {
            this.nav.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });

        // Responsive
        this._syncItemH();
        window.addEventListener('resize', () => {
            this._syncItemH();
            this._resizeConfetti();
        });

        this._resizeConfetti();
        this._updateNames();
    }

    _syncItemH() {
        const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--item-h'), 10);
        if (v) this.itemH = v;
    }

    _resizeConfetti() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
    }

    // ─── Names Management ───
    _updateNames() {
        if (this.spinning) return;
        this.names = this.textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
        if (!this.names.length) this.names = ['Participante 1', 'Participante 2', 'Participante 3'];
        this.countEl.textContent = this.names.length;
        this._renderTrack();
    }

    _renderTrack() {
        // Enough repetitions so the slot can scroll through many full cycles
        // More names = more reps needed for longer spins
        const minReps = Math.max(15, Math.ceil(80 / this.names.length));
        this.track.innerHTML = '';

        for (let r = 0; r < minReps; r++) {
            this.names.forEach((name, i) => {
                const el = document.createElement('div');
                el.className = 'slot__item';
                el.textContent = name;
                el.setAttribute('data-index', String(i + 1).padStart(2, '0'));

                const bar = document.createElement('span');
                bar.className = 'slot__item-bar';
                bar.style.background = COLORS[i % COLORS.length];
                el.appendChild(bar);

                this.track.appendChild(el);
            });
        }

        const mH = this.machine.offsetHeight;
        const center = (mH / 2) - (this.itemH / 2);
        this.track.style.transform = `translateY(${center}px)`;
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

        // Higher pitch when going fast, lower when slow
        const baseFreq = 300 + speed * 500;
        o.frequency.setValueAtTime(baseFreq, t);
        o.frequency.exponentialRampToValueAtTime(150, t + 0.03);

        const vol = Math.min(0.05, 0.02 + speed * 0.03);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start(t);
        o.stop(t + 0.03);
    }

    _winSound() {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        const notes = [523, 659, 784, 880, 1047];
        notes.forEach((freq, i) => {
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0, t + i * 0.1);
            g.gain.linearRampToValueAtTime(0.07, t + 0.08 + i * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, t + 2 + i * 0.1);
            o.connect(g);
            g.connect(this.audioCtx.destination);
            o.start(t + i * 0.1);
            o.stop(t + 2 + i * 0.1);
        });
    }

    _drumRoll() {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        // Quick repeated taps
        for (let i = 0; i < 20; i++) {
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.type = 'square';
            o.frequency.value = 100 + i * 8;
            const startT = t + i * 0.04;
            g.gain.setValueAtTime(0.015, startT);
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

    // ─── SPIN — The Main Event ───
    _spin() {
        if (this.spinning || this.names.length < 2) return;
        this._initAudio();
        this.spinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.classList.add('is-spinning');
        this.machine.classList.add('is-spinning');
        this.statusDot.classList.add('spinning');
        this.statusText.textContent = 'Girando';
        this.resultBox.classList.add('hidden');
        this.progressBar.style.width = '0%';

        // Pick winner
        let wi = this._forcedIdx();
        if (wi === -1) wi = Math.floor(Math.random() * this.names.length);
        const winner = this.names[wi];

        // Calculate scroll target
        const mH = this.machine.offsetHeight;
        const center = (mH / 2) - (this.itemH / 2);

        // KEY: Number of full list cycles scales with participant count
        // This ensures EVERY name is seen multiple times
        const baseCycles = 8;
        const extraCycles = Math.ceil(this.names.length / 5);
        const totalCycles = baseCycles + extraCycles + Math.floor(Math.random() * 3);

        const targetIdx = totalCycles * this.names.length + wi;
        const targetY = center - (targetIdx * this.itemH);
        const startY = center;

        // KEY: Duration scales with names count
        // Base: 8 seconds. +0.3s per participant. Max: 15 seconds.
        const baseDuration = 8000;
        const perNameExtra = 300;
        const duration = Math.min(15000, baseDuration + this.names.length * perNameExtra);

        const t0 = performance.now();
        let lastTick = -1;
        let timerInterval = null;

        // Start real-time timer display
        const updateTimer = () => {
            const elapsed = performance.now() - t0;
            const remaining = Math.max(0, (duration - elapsed) / 1000);
            this.statusTimer.textContent = remaining.toFixed(1) + 's';
        };
        timerInterval = setInterval(updateTimer, 80);

        // Reset track position
        this.track.style.transform = `translateY(${startY}px)`;

        // ─── Multi-Phase Easing ───
        // Phase 1 (0-15%):   Accelerate fast
        // Phase 2 (15-60%):  Cruise at top speed
        // Phase 3 (60-85%):  Start slowing
        // Phase 4 (85-100%): Dramatic slowdown with tension
        const customEase = (t) => {
            if (t < 0.15) {
                // Fast acceleration (quadratic in)
                const p = t / 0.15;
                return 0.15 * (p * p);
            } else if (t < 0.6) {
                // Cruise (linear-ish, slight curve)
                const p = (t - 0.15) / 0.45;
                return 0.15 + 0.55 * p;
            } else if (t < 0.85) {
                // Gradual slowdown
                const p = (t - 0.6) / 0.25;
                return 0.7 + 0.2 * (1 - Math.pow(1 - p, 2));
            } else {
                // Dramatic final slowdown (quintic ease-out)
                const p = (t - 0.85) / 0.15;
                return 0.9 + 0.1 * (1 - Math.pow(1 - p, 5));
            }
        };

        const animate = (now) => {
            const elapsed = now - t0;
            const p = Math.min(elapsed / duration, 1);
            const e = customEase(p);

            const y = startY + (targetY - startY) * e;
            this.track.style.transform = `translateY(${y}px)`;

            // Progress bar
            this.progressBar.style.width = (p * 100) + '%';

            // Speed for audio pitch (0 = stopped, 1 = max)
            const speed = p < 0.15 ? p / 0.15 :
                          p < 0.6 ? 1 :
                          p < 0.85 ? 1 - ((p - 0.6) / 0.25) * 0.6 :
                          Math.max(0, 0.4 * (1 - (p - 0.85) / 0.15));

            // Audio ticks — on each name pass
            const cur = Math.floor(Math.abs(y - center) / this.itemH);
            if (cur !== lastTick) {
                lastTick = cur;
                if (p < 0.95) this._tick(speed);
            }

            // Drum roll in final seconds
            if (p > 0.82 && p < 0.83) {
                this._drumRoll();
            }

            // Highlight active item
            const items = this.track.children;
            const centerPos = -y + center;
            for (let i = 0; i < items.length; i++) {
                const d = Math.abs(i * this.itemH - centerPos);
                items[i].classList.toggle('active', d < this.itemH * 0.5);
            }

            // Update status dots animation
            if (p > 0.8) {
                const dots = '.';
                const count = Math.floor((elapsed / 300) % 4);
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
        this.machine.classList.remove('is-spinning');
        this.statusDot.classList.remove('spinning');
        this.statusText.textContent = '¡Ganador!';
        this.progressBar.style.width = '100%';

        // Flash the progress bar
        setTimeout(() => {
            this.progressBar.style.width = '0%';
            this.statusText.textContent = 'Listo';
        }, 3000);

        this.winnerEl.textContent = winner;
        this.resultBox.classList.remove('hidden');

        // Smooth scroll to result
        setTimeout(() => {
            this.resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);

        this._winSound();
        this._launchConfetti();
    }

    // ─── Canvas Confetti ───
    _launchConfetti() {
        this.confettiPieces = [];
        const count = 150;
        const W = this.confettiCanvas.width;
        const H = this.confettiCanvas.height;

        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const power = 8 + Math.random() * 12;
            this.confettiPieces.push({
                x: W * 0.5 + (Math.random() - 0.5) * W * 0.3,
                y: H * 0.45,
                vx: Math.cos(angle) * power,
                vy: Math.sin(angle) * power - 8,
                w: 3 + Math.random() * 6,
                h: 5 + Math.random() * 12,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 18,
                gravity: 0.15 + Math.random() * 0.1,
                drag: 0.975 + Math.random() * 0.02,
                opacity: 1,
                delay: Math.random() * 20,
                shape: Math.random() > 0.4 ? 'rect' : 'circle',
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

            if (p.y > H + 50) p.opacity -= 0.03;
            if (p.opacity <= 0) return;
            alive++;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
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
        this.textarea.value = "Jose Junior\nMaria\nPepe\nLucia\nCarlos\nAna\nSofia\nMiguel\nValentina\nDiego\nCarmen\nFernando\nIsabella\nAndres";
        this.resultBox.classList.add('hidden');
        this.progressBar.style.width = '0%';
        this._updateNames();
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => new RuletaPro());
