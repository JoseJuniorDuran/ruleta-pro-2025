# 🎰 Ruleta Pro 2025 — Sorteo Premium

Plataforma de sorteos premium con slot machine vertical, animación cinematográfica y confetti.

## 🚀 Cómo Subir a GitHub y Actualizar en el Navegador

### Paso 1: Reemplazar archivos en tu proyecto
Copia estos archivos a tu proyecto existente, reemplazando los anteriores:
```
public/
├── index.html          ← Reemplazar
├── css/
│   └── styles.css      ← Reemplazar
└── js/
    └── app.js          ← Reemplazar
```

### Paso 2: Subir a GitHub
Abre la terminal/CMD en la carpeta de tu proyecto y ejecuta:
```bash
cd tu-carpeta-del-proyecto

git add .
git commit -m "Rediseño premium: slot machine vertical + animación extendida"
git push origin main
```

### Paso 3: Actualizar en Firebase (el navegador)
```bash
firebase deploy
```

¡Listo! Tu sitio se actualizará en **https://ruletapro2025.web.app**

---

## ⚙️ Configurar Ganador Forzado
Edita `public/js/app.js`, línea 14:
```javascript
const FORCE_WINNER = "Jose Junior";  // Cambia el nombre aquí
```
Para sorteo aleatorio real, déjalo vacío: `const FORCE_WINNER = "";`

## ✨ Características
- **Slot Machine Vertical**: Los nombres se deslizan hacia abajo con física realista
- **Animación escalable**: Duración se ajusta automáticamente según cantidad de participantes (8-15 segundos)
- **Multi-fase easing**: Aceleración → Crucero → Desaceleración dramática
- **Timer en vivo**: Cuenta regresiva visible durante el giro
- **Barra de progreso**: Indicador visual del estado del sorteo
- **Audio sintetizado**: Ticks, drum roll y fanfarria de victoria
- **Confetti con canvas**: 150 partículas con física real
- **Responsive**: Funciona en móvil, tablet y escritorio
- **Hero cinematográfico**: Animaciones staggered al cargar la página

## 🛠️ Tecnologías
- HTML5, CSS3, JavaScript ES6+
- Canvas API (confetti)
- Web Audio API (sonidos)
- Firebase Hosting

## 👨‍💻 Autor
**Jose Junior Duran Contreras**

© 2025 Ruleta Pro. Todos los derechos reservados.
