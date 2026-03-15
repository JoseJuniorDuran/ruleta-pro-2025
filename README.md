# Ruleta Pro 2026 — Sorteo Premium Ultra

Plataforma de sorteos premium con carrusel horizontal cinematografico, particulas flotantes y confetti.

## Como Subir a GitHub y Actualizar

### Paso 1: Reemplazar archivos
```
public/
  index.html
  css/
    styles.css
  js/
    app.js
```

### Paso 2: Subir a GitHub
```bash
git add .
git commit -m "Rediseno ultra premium: carrusel horizontal + particulas + glass morphism"
git push origin main
```

### Paso 3: Deploy en Firebase
```bash
firebase deploy
```

Tu sitio se actualizara en **https://ruletapro2025.web.app**

---

## Configurar Ganador Forzado
Edita `public/js/app.js`, linea 14:
```javascript
const FORCE_WINNER = "Jose Junior";  // Cambia el nombre aqui
```
Para sorteo aleatorio real, dejalo vacio: `const FORCE_WINNER = "";`

## Caracteristicas
- **Carrusel Horizontal**: Los nombres se deslizan horizontalmente con fisica cinematografica
- **Particulas Flotantes**: Red de particulas animadas en el fondo con conexiones dinamicas
- **Glass Morphism**: Interfaz con efecto cristal premium
- **Layout Split-Panel**: Controles a la izquierda, display a la derecha
- **Multi-fase easing**: Aceleracion, crucero, desaceleracion dramatica
- **Timer en vivo**: Cuenta regresiva visible durante el giro
- **Barra de progreso**: Indicador visual con gradiente animado
- **Audio sintetizado**: Ticks, drum roll y fanfarria de victoria
- **Confetti avanzado**: 200 particulas con formas variadas (rectangulos, circulos, estrellas)
- **Corona de ganador**: Revelacion cinematografica con spotlight y corona SVG
- **Responsive**: Adaptable a movil, tablet y escritorio
- **Dark luxury theme**: Paleta purpura/indigo con acentos dorados

## Tecnologias
- HTML5, CSS3 (Glass Morphism, Grid Layout), JavaScript ES6+
- Canvas API (confetti + particulas)
- Web Audio API (sonidos sintetizados)
- Firebase Hosting

## Autor
**Jose Junior Duran Contreras**

2026 Ruleta Pro. Todos los derechos reservados.
