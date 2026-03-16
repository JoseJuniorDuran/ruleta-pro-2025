/**
 * Ruleta Pro 2026 — Ultra Premium Engine
 */

'use strict';

const FORCE_WINNER = "Jose Junior";

const COLORS = [
    '#a855f7','#6366f1','#8b5cf6','#ec4899','#f43f5e',
    '#f59e0b','#10b981','#06b6d4','#3b82f6','#f97316',
    '#14b8a6','#d946ef','#84cc16','#e879f9','#22d3ee',
    '#fb7185','#818cf8','#34d399','#fbbf24','#38bdf8'
];

class RuletaPro {
    constructor() {
        this.els = {
            track:        document.getElementById('track'),
            viewport:     document.getElementById('viewport'),
            display:      document.getElementById('display'),
            textarea:     document.getElementById('participants'),
            spinBtn:      document.getElementById('spinBtn'),
            resetBtn:     document.getElementById('resetBtn'),
            newSorteoBtn: document.getElementById('newSorteoBtn'),
            resultBox:    document.getElementById('result'),
            winnerName:   document.getElementById('winnerName'),
            winnerRound:  document.getElementById('winnerRound'),
            count:        document.getElementById('count'),
            statTotal:    document.getElementById('statTotal'),
            statRounds:   document.getElementById('statRounds'),
            displayCount: document.getElementById('displayCount'),
            statusDot:    document.getElementById('statusDot'),
            statusText:   document.getElementById('statusText'),
            statusTimer:  document.getElementById('statusTimer'),
            progressBar:  document.getElementById('progressBar'),
            progressWrap: document.querySelector('[role="progressbar"]'),
            confettiCanvas: document.getElementById('confettiCanvas'),
            particleCanvas: document.getElementById('particleCanvas'),
            nav:          document.getElementById('nav'),
            navStatus:    document.getElementById('navStatus'),
            toast:        document.getElementById('toast'),
        };

        this.names        = [];
        this.spinning     = false;
        this.rounds       = 0;
        this.audioCtx     = null;
        this.itemW        = 220;
        this.itemGap      = 14;
        this.confetti     = [];
        this.confettiRunning = false;
        this.particles    = [];
        this._toastTimer  = null;
        this._rafParticle = null;

        this._init();
    }

    /* ────────────────────────────────────────
       INIT
    ──────────────────────────────────────── */
    _init() {
        const { textarea, spinBtn, resetBtn, newSorteoBtn, nav } = this.els;

        textarea.addEventListener('input', () => this._updateNames());
        spinBtn.addEventListener('click',  () => this._spin());
        resetBtn.addEventListener('click', () => this._reset());
        if (newSorteoBtn) newSorteoBtn.addEventListener('click', () => this._reset());

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });

        window.addEventListener('resize', this._onResize.bind(this), { passive: true });

        this._resizeCanvases();
        this._updateNames();
        this._initParticles();
        this._animateParticles();
    }

    _onResize() {
        this._resizeCanvases();
        if (!this.spinning) this._renderTrack();
    }

    _resizeCanvases() {
        const W = window.innerWidth, H = window.innerHeight;
        this.els.confettiCanvas.width  = W;
        this.els.confettiCanvas.height = H;
        this.els.particleCanvas.width  = W;
        this.els.particleCanvas.height = H;
    }

    /* ────────────────────────────────────────
       FLOATING PARTICLES
    ──────────────────────────────────────── */
    _initParticles() {
        this.particles = [];
        // Fewer particles on mobile for performance
        const count = window.innerWidth < 600 ? 20 : 40;
        const W = window.innerWidth, H = window.innerHeight;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x:       Math.random() * W,
                y:       Math.random() * H,
                vx:      (Math.random() - 0.5) * 0.22,
                vy:      (Math.random() - 0.5) * 0.22,
                size:    1 + Math.random() * 1.8,
                opacity: 0.06 + Math.random() * 0.12,
                color:   COLORS[Math.floor(Math.random() * COLORS.length)]
            });
        }
    }

    _animateParticles() {
        const ctx = this.els.particleCanvas.getContext('2d');
        const W = this.els.particleCanvas.width;
        const H = this.els.particleCanvas.height;
        ctx.clearRect(0, 0, W, H);

        for (const p of this.particles) {
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
        }
        ctx.globalAlpha = 1;

        // Connection lines (skip on small screens)
        if (window.innerWidth >= 600) {
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        ctx.strokeStyle = `rgba(168,85,247,${0.03 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        this._rafParticle = requestAnimationFrame(this._animateParticles.bind(this));
    }

    /* ────────────────────────────────────────
       NAMES
    ──────────────────────────────────────── */
    _updateNames() {
        if (this.spinning) return;
        this.names = this.els.textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
        if (this.names.length === 0) this.names = ['Participante 1', 'Participante 2', 'Participante 3'];

        const n = this.names.length;
        const label = n + ' participante' + (n !== 1 ? 's' : '');
        this.els.count.textContent       = n;
        this.els.statTotal.textContent    = n;
        this.els.displayCount.textContent = label;
        this.els.spinBtn.disabled         = n < 2;
        this._renderTrack();
    }

    _renderTrack() {
        const { track, viewport } = this.els;
        const minReps = Math.max(20, Math.ceil(120 / Math.max(this.names.length, 1)));
        track.innerHTML = '';

        for (let r = 0; r < minReps; r++) {
            for (let i = 0; i < this.names.length; i++) {
                const name  = this.names[i];
                const color = COLORS[i % COLORS.length];

                const el  = document.createElement('div');
                el.className = 'display__name-item';

                const bar = document.createElement('div');
                bar.className = 'name-bar';
                bar.style.background = color;
                el.appendChild(bar);

                const idx = document.createElement('span');
                idx.className   = 'name-index';
                idx.textContent = String(i + 1).padStart(2, '0');
                el.appendChild(idx);

                const txt = document.createElement('span');
                txt.className   = 'name-text';
                txt.textContent = name;
                el.appendChild(txt);

                track.appendChild(el);
            }
        }

        // Read actual rendered width (respects CSS responsive overrides)
        const firstItem = track.firstElementChild;
        if (firstItem) {
            this.itemW   = firstItem.offsetWidth;
            this.itemGap = parseInt(getComputedStyle(track).gap) || 14;
        }

        const vpW    = viewport.offsetWidth;
        const offset = (vpW / 2) - (this.itemW / 2);
        track.style.transform = `translateY(-50%) translateX(${offset}px)`;
    }

    /* ────────────────────────────────────────
       AUDIO
    ──────────────────────────────────────── */
    _initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    }

    _beep(freq, dur, gainVal, type = 'triangle') {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(gainVal, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start(t);
        o.stop(t + dur);
    }

    _tick(speed) {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(260 + speed * 620, t);
        o.frequency.exponentialRampToValueAtTime(140, t + 0.045);
        g.gain.setValueAtTime(Math.min(0.055, 0.02 + speed * 0.035), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start(t);
        o.stop(t + 0.045);
    }

    _winSound() {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        const notes = [523, 659, 784, 880, 1047, 1175, 1397];
        notes.forEach((freq, i) => {
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0, t + i * 0.085);
            g.gain.linearRampToValueAtTime(0.07, t + 0.06 + i * 0.085);
            g.gain.exponentialRampToValueAtTime(0.001, t + 2.4 + i * 0.085);
            o.connect(g);
            g.connect(this.audioCtx.destination);
            o.start(t + i * 0.085);
            o.stop(t + 2.4 + i * 0.085);
        });
    }

    _drumRoll() {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        for (let i = 0; i < 28; i++) {
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.type = 'square';
            o.frequency.value = 80 + i * 9;
            const s = t + i * 0.032;
            g.gain.setValueAtTime(0.013, s);
            g.gain.exponentialRampToValueAtTime(0.001, s + 0.028);
            o.connect(g);
            g.connect(this.audioCtx.destination);
            o.start(s);
            o.stop(s + 0.028);
        }
    }

    /* ────────────────────────────────────────
       FORCED WINNER
    ──────────────────────────────────────── */
    _forcedIdx() {
        const target = FORCE_WINNER.trim().toLowerCase();
        if (!target) return -1;
        return this.names.findIndex(n => n.toLowerCase() === target);
    }

    /* ────────────────────────────────────────
       SPIN
    ──────────────────────────────────────── */
    _spin() {
        if (this.spinning || this.names.length < 2) return;

        this._initAudio();
        this.spinning = true;

        const { spinBtn, display, statusDot, statusText, resultBox, progressBar, progressWrap, track, viewport } = this.els;

        spinBtn.disabled = true;
        spinBtn.classList.add('is-spinning');
        display.classList.add('is-spinning');
        statusDot.classList.add('spinning');
        statusDot.classList.remove('winner-state');
        statusText.textContent = 'Girando';
        resultBox.classList.add('hidden');
        progressBar.style.width = '0%';
        if (progressWrap) progressWrap.setAttribute('aria-valuenow', '0');

        // Pick winner
        let wi = this._forcedIdx();
        if (wi === -1) wi = Math.floor(Math.random() * this.names.length);
        const winner = this.names[wi];

        const step = this.itemW + this.itemGap;
        const vpW  = viewport.offsetWidth;
        const startOffset = (vpW / 2) - (this.itemW / 2);

        const baseCycles  = 10;
        const extraCycles = Math.ceil(this.names.length / 4);
        const totalCycles = baseCycles + extraCycles + Math.floor(Math.random() * 3);
        const targetIdx   = totalCycles * this.names.length + wi;
        const targetX     = startOffset - targetIdx * step;

        const duration = Math.min(16000, 8000 + this.names.length * 220);
        const t0 = performance.now();
        let lastTick = -1;
        let drumFired = false;

        const timerInterval = setInterval(() => {
            const remaining = Math.max(0, (duration - (performance.now() - t0)) / 1000);
            this.els.statusTimer.textContent = remaining.toFixed(1) + 's';
        }, 80);

        track.style.transform = `translateY(-50%) translateX(${startOffset}px)`;

        // Multi-phase ease
        function ease(t) {
            if (t < 0.12) {
                const p = t / 0.12;
                return 0.12 * (p * p * p);
            } else if (t < 0.56) {
                return 0.12 + 0.55 * ((t - 0.12) / 0.44);
            } else if (t < 0.82) {
                const p = (t - 0.56) / 0.26;
                return 0.67 + 0.21 * (1 - Math.pow(1 - p, 2));
            } else {
                const p = (t - 0.82) / 0.18;
                return 0.88 + 0.12 * (1 - Math.pow(1 - p, 5));
            }
        }

        const animate = (now) => {
            const elapsed = now - t0;
            const p = Math.min(elapsed / duration, 1);
            const e = ease(p);
            const x = startOffset + (targetX - startOffset) * e;

            track.style.transform = `translateY(-50%) translateX(${x}px)`;

            const pct = Math.round(p * 100);
            progressBar.style.width = pct + '%';
            if (progressWrap) progressWrap.setAttribute('aria-valuenow', pct);

            // Speed calc for audio
            const speed =
                p < 0.12 ? p / 0.12 :
                p < 0.56 ? 1 :
                p < 0.82 ? 1 - ((p - 0.56) / 0.26) * 0.65 :
                Math.max(0, 0.35 * (1 - (p - 0.82) / 0.18));

            // Tick sound on each name
            const cur = Math.floor(Math.abs(x - startOffset) / step);
            if (cur !== lastTick) {
                lastTick = cur;
                if (p < 0.94) this._tick(speed);
            }

            // Drum roll near end (once)
            if (p > 0.80 && p < 0.81 && !drumFired) {
                drumFired = true;
                this._drumRoll();
            }

            // Highlight active item (correct center calculation)
            const viewCenter = vpW / 2 - x;
            const items = track.children;
            for (let i = 0; i < items.length; i++) {
                const itemCenter = i * step + this.itemW / 2;
                items[i].classList.toggle('active', Math.abs(itemCenter - viewCenter) < this.itemW * 0.52);
            }

            // Status text update
            if (p > 0.78) {
                const dotCount = Math.floor((elapsed / 260) % 4);
                statusText.textContent = 'Frenando' + '.'.repeat(dotCount);
            }

            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                clearInterval(timerInterval);
                this.els.statusTimer.textContent = '';
                this._done(winner);
            }
        };

        requestAnimationFrame(animate);
    }

    _done(winner) {
        this.spinning = false;
        this.rounds++;

        const { spinBtn, display, statusDot, statusText, progressBar, resultBox, winnerName, winnerRound, statRounds } = this.els;

        spinBtn.disabled = false;
        spinBtn.classList.remove('is-spinning');
        display.classList.remove('is-spinning');
        statusDot.classList.remove('spinning');
        statusDot.classList.add('winner-state');
        statusText.textContent = 'Ganador';
        progressBar.style.width = '100%';

        setTimeout(() => { progressBar.style.width = '0%'; }, 3200);

        winnerName.textContent  = winner;
        winnerRound.textContent = `Sorteo #${this.rounds}`;
        statRounds.textContent  = this.rounds;

        resultBox.classList.remove('hidden');
        this._winSound();
        this._launchConfetti();
        this._toast(`🏆 ¡${winner} es el ganador!`);
    }

    /* ────────────────────────────────────────
       CONFETTI
    ──────────────────────────────────────── */
    _launchConfetti() {
        this.confetti = [];
        const W = this.els.confettiCanvas.width;
        const H = this.els.confettiCanvas.height;
        const count = window.innerWidth < 600 ? 100 : 180;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const power = 8 + Math.random() * 14;
            this.confetti.push({
                x:        W * 0.5 + (Math.random() - 0.5) * W * 0.4,
                y:        H * 0.45,
                vx:       Math.cos(angle) * power,
                vy:       Math.sin(angle) * power - 10,
                w:        3 + Math.random() * 7,
                h:        5 + Math.random() * 14,
                color:    COLORS[Math.floor(Math.random() * COLORS.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 18,
                gravity:  0.12 + Math.random() * 0.1,
                drag:     0.976 + Math.random() * 0.018,
                opacity:  1,
                delay:    Math.floor(Math.random() * 24),
                shape:    Math.random() > 0.4 ? 'rect' : 'circle'
            });
        }

        if (!this.confettiRunning) {
            this.confettiRunning = true;
            this._animateConfetti();
        }
    }

    _animateConfetti() {
        const ctx = this.els.confettiCanvas.getContext('2d');
        const W = this.els.confettiCanvas.width;
        const H = this.els.confettiCanvas.height;
        ctx.clearRect(0, 0, W, H);

        let alive = 0;

        for (const p of this.confetti) {
            if (p.delay > 0) { p.delay--; continue; }
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.x  += p.vx;
            p.y  += p.vy;
            p.rotation += p.rotSpeed;

            if (p.y > H + 60) p.opacity -= 0.022;
            if (p.opacity <= 0) continue;
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
        }

        if (alive > 0) {
            requestAnimationFrame(() => this._animateConfetti());
        } else {
            this.confettiRunning = false;
            ctx.clearRect(0, 0, W, H);
        }
    }

    /* ────────────────────────────────────────
       RESET
    ──────────────────────────────────────── */
    _reset() {
        if (this.spinning) return;
        const { resultBox, progressBar, statusDot, statusText } = this.els;
        resultBox.classList.add('hidden');
        progressBar.style.width = '0%';
        statusDot.classList.remove('winner-state');
        statusText.textContent = 'En espera';
        this._updateNames();
    }

    /* ────────────────────────────────────────
       TOAST
    ──────────────────────────────────────── */
    _toast(msg) {
        const { toast } = this.els;
        if (!toast) return;
        clearTimeout(this._toastTimer);
        toast.textContent = msg;
        toast.classList.add('show');
        this._toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
    }
}

document.addEventListener('DOMContentLoaded', () => { new RuletaPro(); });
