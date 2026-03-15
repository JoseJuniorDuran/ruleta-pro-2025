/**
 * Ruleta Pro 2026 — Ultra Premium Horizontal Scroll Engine
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
        if (this.newSorteoBtn) {
            this.newSorteoBtn.addEventListener('click', () => this._reset());
        }

        window.addEventListener('scroll', () => {
            this.nav.classList.toggle('scrolled', window.scrollY > 30);
        }, { passive: true });

        window.addEventListener('resize', () => {
            this._resizeCanvases();
        });

        this._resizeCanvases();
        this._updateNames();
        this._initParticles();
        this._animateParticles();
    }

    _resizeCanvases() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }

    /* ── Floating Particles ── */
    _initParticles() {
        this.particles = [];
        var count = 40;
        var W = window.innerWidth;
        var H = window.innerHeight;
        for (var i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                size: 1 + Math.random() * 1.5,
                opacity: 0.08 + Math.random() * 0.12,
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
            });
        }
    }

    _animateParticles() {
        var ctx = this.particleCtx;
        var W = this.particleCanvas.width;
        var H = this.particleCanvas.height;
        ctx.clearRect(0, 0, W, H);

        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];
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

        // Connection lines
        for (var i = 0; i < this.particles.length; i++) {
            for (var j = i + 1; j < this.particles.length; j++) {
                var dx = this.particles[i].x - this.particles[j].x;
                var dy = this.particles[i].y - this.particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    ctx.strokeStyle = 'rgba(168, 85, 247, ' + (0.03 * (1 - dist / 100)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(this._animateParticles.bind(this));
    }

    /* ── Names ── */
    _updateNames() {
        if (this.spinning) return;
        this.names = this.textarea.value.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
        if (this.names.length === 0) this.names = ['Participante 1', 'Participante 2', 'Participante 3'];
        this.countEl.textContent = this.names.length;
        this.displayCountEl.textContent = this.names.length + ' participante' + (this.names.length !== 1 ? 's' : '');
        this._renderTrack();
    }

    _renderTrack() {
        var minReps = Math.max(20, Math.ceil(100 / this.names.length));
        this.track.innerHTML = '';

        for (var r = 0; r < minReps; r++) {
            for (var i = 0; i < this.names.length; i++) {
                var name = this.names[i];
                var color = COLORS[i % COLORS.length];

                var el = document.createElement('div');
                el.className = 'display__name-item';

                // Color bar
                var bar = document.createElement('div');
                bar.className = 'name-bar';
                bar.style.background = color;
                el.appendChild(bar);

                // Index number
                var idx = document.createElement('span');
                idx.className = 'name-index';
                idx.textContent = String(i + 1).padStart(2, '0');
                el.appendChild(idx);

                // Name text
                var txt = document.createElement('span');
                txt.className = 'name-text';
                txt.textContent = name;
                el.appendChild(txt);

                this.track.appendChild(el);
            }
        }

        // Center the first item in the viewport
        var vpW = this.viewport.offsetWidth;
        var offset = (vpW / 2) - (this.itemW / 2);
        this.track.style.transform = 'translateY(-50%) translateX(' + offset + 'px)';
    }

    /* ── Audio ── */
    _initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    }

    _tick(speed) {
        if (!this.audioCtx) return;
        var t = this.audioCtx.currentTime;
        var o = this.audioCtx.createOscillator();
        var g = this.audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(280 + speed * 600, t);
        o.frequency.exponentialRampToValueAtTime(140, t + 0.04);
        g.gain.setValueAtTime(Math.min(0.05, 0.02 + speed * 0.03), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start(t);
        o.stop(t + 0.04);
    }

    _winSound() {
        if (!this.audioCtx) return;
        var t = this.audioCtx.currentTime;
        var notes = [523, 659, 784, 880, 1047, 1175];
        for (var i = 0; i < notes.length; i++) {
            var o = this.audioCtx.createOscillator();
            var g = this.audioCtx.createGain();
            o.type = 'sine';
            o.frequency.value = notes[i];
            g.gain.setValueAtTime(0, t + i * 0.09);
            g.gain.linearRampToValueAtTime(0.07, t + 0.07 + i * 0.09);
            g.gain.exponentialRampToValueAtTime(0.001, t + 2.5 + i * 0.09);
            o.connect(g);
            g.connect(this.audioCtx.destination);
            o.start(t + i * 0.09);
            o.stop(t + 2.5 + i * 0.09);
        }
    }

    _drumRoll() {
        if (!this.audioCtx) return;
        var t = this.audioCtx.currentTime;
        for (var i = 0; i < 25; i++) {
            var o = this.audioCtx.createOscillator();
            var g = this.audioCtx.createGain();
            o.type = 'square';
            o.frequency.value = 90 + i * 10;
            var s = t + i * 0.035;
            g.gain.setValueAtTime(0.015, s);
            g.gain.exponentialRampToValueAtTime(0.001, s + 0.03);
            o.connect(g);
            g.connect(this.audioCtx.destination);
            o.start(s);
            o.stop(s + 0.03);
        }
    }

    _forcedIdx() {
        var target = FORCE_WINNER.trim().toLowerCase();
        if (!target) return -1;
        for (var i = 0; i < this.names.length; i++) {
            if (this.names[i].toLowerCase() === target) return i;
        }
        return -1;
    }

    /* ── SPIN ── */
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
        var wi = this._forcedIdx();
        if (wi === -1) wi = Math.floor(Math.random() * this.names.length);
        var winner = this.names[wi];

        var step = this.itemW + this.itemGap; // 236px per item
        var vpW = this.viewport.offsetWidth;
        var startOffset = (vpW / 2) - (this.itemW / 2);

        // Scroll through many full cycles
        var baseCycles = 10;
        var extraCycles = Math.ceil(this.names.length / 4);
        var totalCycles = baseCycles + extraCycles + Math.floor(Math.random() * 3);
        var targetIdx = totalCycles * this.names.length + wi;
        var targetX = startOffset - (targetIdx * step);

        // Duration scales with participants
        var duration = Math.min(16000, 8000 + this.names.length * 250);

        var t0 = performance.now();
        var lastTick = -1;
        var self = this;

        var timerInterval = setInterval(function() {
            var elapsed = performance.now() - t0;
            var remaining = Math.max(0, (duration - elapsed) / 1000);
            self.statusTimer.textContent = remaining.toFixed(1) + 's';
        }, 80);

        this.track.style.transform = 'translateY(-50%) translateX(' + startOffset + 'px)';

        // Multi-phase easing
        function customEase(t) {
            if (t < 0.12) {
                var p = t / 0.12;
                return 0.12 * (p * p * p);
            } else if (t < 0.55) {
                var p = (t - 0.12) / 0.43;
                return 0.12 + 0.55 * p;
            } else if (t < 0.82) {
                var p = (t - 0.55) / 0.27;
                return 0.67 + 0.22 * (1 - Math.pow(1 - p, 2));
            } else {
                var p = (t - 0.82) / 0.18;
                return 0.89 + 0.11 * (1 - Math.pow(1 - p, 5));
            }
        }

        function animate(now) {
            var elapsed = now - t0;
            var p = Math.min(elapsed / duration, 1);
            var e = customEase(p);
            var x = startOffset + (targetX - startOffset) * e;

            self.track.style.transform = 'translateY(-50%) translateX(' + x + 'px)';
            self.progressBar.style.width = (p * 100) + '%';

            // Speed for audio
            var speed = p < 0.12 ? p / 0.12 :
                        p < 0.55 ? 1 :
                        p < 0.82 ? 1 - ((p - 0.55) / 0.27) * 0.6 :
                        Math.max(0, 0.4 * (1 - (p - 0.82) / 0.18));

            // Tick sound on each name
            var cur = Math.floor(Math.abs(x) / step);
            if (cur !== lastTick) {
                lastTick = cur;
                if (p < 0.95) self._tick(speed);
            }

            // Drum roll near end
            if (p > 0.80 && p < 0.81) {
                self._drumRoll();
            }

            // Highlight active item
            var items = self.track.children;
            var viewCenter = startOffset - x;
            for (var i = 0; i < items.length; i++) {
                var itemCenter = i * step + self.itemW / 2;
                var d = Math.abs(itemCenter - viewCenter);
                if (d < self.itemW * 0.6) {
                    items[i].classList.add('active');
                } else {
                    items[i].classList.remove('active');
                }
            }

            // Status text
            if (p > 0.78) {
                var dots = '.';
                var dotCount = Math.floor((elapsed / 250) % 4);
                self.statusText.textContent = 'Frenando' + dots.repeat(dotCount);
            }

            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                clearInterval(timerInterval);
                self.statusTimer.textContent = '';
                self._done(winner);
            }
        }

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

        var self = this;
        setTimeout(function() {
            self.progressBar.style.width = '0%';
        }, 3000);

        this.winnerEl.textContent = winner;
        this.resultBox.classList.remove('hidden');
        this._winSound();
        this._launchConfetti();
    }

    /* ── Confetti ── */
    _launchConfetti() {
        this.confettiPieces = [];
        var count = 180;
        var W = this.confettiCanvas.width;
        var H = this.confettiCanvas.height;

        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var power = 10 + Math.random() * 14;
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
                shape: Math.random() > 0.4 ? 'rect' : 'circle'
            });
        }

        if (!this.confettiRunning) {
            this.confettiRunning = true;
            this._animateConfetti();
        }
    }

    _animateConfetti() {
        var ctx = this.confettiCtx;
        var W = this.confettiCanvas.width;
        var H = this.confettiCanvas.height;
        ctx.clearRect(0, 0, W, H);

        var alive = 0;
        var self = this;

        for (var i = 0; i < this.confettiPieces.length; i++) {
            var p = this.confettiPieces[i];
            if (p.delay > 0) { p.delay--; continue; }
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            if (p.y > H + 60) p.opacity -= 0.025;
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
            requestAnimationFrame(function() { self._animateConfetti(); });
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

document.addEventListener('DOMContentLoaded', function() {
    new RuletaPro();
});
