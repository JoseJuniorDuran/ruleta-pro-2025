const FORCE_WINNER = "Jose Junior";

class Engine {
    constructor() {
        // Referencias a elementos del DOM
        this.c = document.getElementById('wheelCanvas');
        this.x = this.c.getContext('2d');
        this.f = document.querySelector('.wheel-frame');
        this.pi = document.getElementById('participants');
        this.sb = document.getElementById('spinBtn');
        this.rb = document.getElementById('resetBtn');
        this.bx = document.getElementById('result');
        this.wd = document.getElementById('winnerName');
        this.cb = document.getElementById('count');

        // Estado de la ruleta
        this.p = [];
        this.cl = ['#FF0055', '#00CCFF', '#FFCC00', '#00FF99', '#9900FF', '#FF6600'];
        this.is = false;
        this.cr = 0;
        this.ac = null;

        this._i();
    }

    _i() {
        this.pi.addEventListener('input', () => this._u());
        this.sb.addEventListener('click', () => this._s());
        this.rb.addEventListener('click', () => this._r());
        // Debounce para resize (optimización móvil)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this._d(), 100);
        });

        // Valores por defecto en el textarea (sin tildes para evitar problemas de encoding)
        this.pi.value = "Juan\nMaria\nPepe\nLucia\nCarlos\nAna";
        this._u();
    }

    _u() {
        if (this.is) return;

        const t = this.pi.value;
        this.p = t.split('\n').map(l => l.trim()).filter(l => l);
        if (this.p.length === 0) this.p = ['1', '2', '3', '4'];

        this.cb.textContent = this.p.length;
        this._d();
    }

    _d() {
        const d = window.devicePixelRatio || 1;
        const r = this.c.parentElement.getBoundingClientRect();
        this.c.width = r.width * d;
        this.c.height = r.height * d;

        // Reiniciar transform para no acumular escalas en redibujados
        this.x.setTransform(d, 0, 0, d, 0, 0);

        const s = r.width;
        const cx = s / 2;
        const cy = s / 2;
        const rad = s / 2;
        const st = (2 * Math.PI) / this.p.length;

        this.x.clearRect(0, 0, s, s);

        this.p.forEach((n, i) => {
            const sa = i * st;
            const ea = (i + 1) * st;

            this.x.beginPath();
            this.x.moveTo(cx, cy);
            this.x.arc(cx, cy, rad, sa, ea);
            this.x.fillStyle = this.cl[i % this.cl.length];
            this.x.fill();
            this.x.lineWidth = 2;
            this.x.strokeStyle = "rgba(0,0,0,0.2)";
            this.x.stroke();

            // Texto del segmento
            this.x.save();
            this.x.translate(cx, cy);
            this.x.rotate(sa + st / 2);
            this.x.textAlign = "right";
            this.x.fillStyle = "#fff";
            this.x.shadowColor = "rgba(0,0,0,0.5)";
            this.x.shadowBlur = 4;
            const maxTextWidth = Math.max(40, st * (rad - 30) * 0.8);
            const { size, text } = this._fitText(n, maxTextWidth);
            this.x.font = `bold ${size}px 'Outfit', sans-serif`;
            this.x.fillText(text, rad - 30, 8);
            this.x.restore();
        });
    }

    // Ajusta tamaño y recorta texto para que encaje en el segmento
    _fitText(text, maxWidth) {
        const minSize = 10;
        let size = 24;
        let label = text;

        while (size > minSize) {
            this.x.font = `bold ${size}px 'Outfit', sans-serif`;
            if (this.x.measureText(label).width <= maxWidth) break;
            size -= 1;
        }

        if (this.x.measureText(label).width > maxWidth) {
            while (label.length > 1 && this.x.measureText(`${label}...`).width > maxWidth) {
                label = label.slice(0, -1);
            }
            if (label.length > 1) label = `${label}...`;
        }

        return { size, text: label };
    }

    _ia() {
        if (!this.ac) {
            this.ac = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ac.state === 'suspended') {
            this.ac.resume();
        }
    }

    _pt() {
        if (!this.ac) return;

        const o = this.ac.createOscillator();
        const g = this.ac.createGain();

        o.frequency.setValueAtTime(800, this.ac.currentTime);
        o.frequency.exponentialRampToValueAtTime(100, this.ac.currentTime + 0.05);

        g.gain.setValueAtTime(0.05, this.ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ac.currentTime + 0.05);

        o.connect(g);
        g.connect(this.ac.destination);
        o.start();
        o.stop(this.ac.currentTime + 0.05);
    }

    _pw() {
        if (!this.ac) return;

        const n = [523.25, 659.25, 783.99, 1046.50];
        const t = this.ac.currentTime;

        n.forEach((f, i) => {
            const o = this.ac.createOscillator();
            const g = this.ac.createGain();

            o.frequency.value = f;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.1, t + 0.1 + i * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, t + 2);

            o.connect(g);
            g.connect(this.ac.destination);
            o.start(t + i * 0.1);
            o.stop(t + 2);
        });
    }

    // Busca el índice del nombre forzado si está presente
    _forcedWinnerIndex() {
        const target = FORCE_WINNER.trim().toLowerCase();
        return this.p.findIndex(p => p.toLowerCase() === target);
    }

    _s() {
        if (this.is) return;
        if (this.p.length < 2) return;

        this._ia();
        this.is = true;
        this.sb.disabled = true;
        this.bx.classList.add('hidden');

        const sd = 360 / this.p.length;

        let wi = this._forcedWinnerIndex();
        if (wi === -1) {
            wi = Math.floor(Math.random() * this.p.length);
        }

        const ro = Math.random() * (sd - 2) + 1;
        const tr = 360 - (wi * sd) - ro;
        const fs = 360 * (5 + Math.floor(Math.random() * 5));
        const cm = this.cr % 360;

        let d = tr - cm;
        if (d < 0) d += 360;

        const fr = this.cr + fs + d;
        const du = 5000;
        const sr = this.cr;
        const cir = fr - sr;
        const st = performance.now();

        // Variables para la lógica de audio físico
        const segmentAngle = 360 / this.p.length;
        let lastSegmentIndex = -1;

        const a = (ct) => {
            const el = ct - st;

            if (el < du) {
                const t = el / du;
                const e = 1 - Math.pow(1 - t, 4); // suavizado ease-out
            });
        });
