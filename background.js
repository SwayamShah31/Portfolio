// Animated lines and particles background for portfolio
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const PARTICLE_COUNT = 60;
const LINE_DISTANCE = 160;
const particles = [];
const RED = '#ff1744';
const DARK_RED = '#b71c1c';
const BG = '#111216';

let mouse = { x: null, y: null };

// Add parallax and glow
let parallax = { x: 0, y: 0 };

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

class Particle {
  constructor() {
    this.x = randomBetween(0, width);
    this.y = randomBetween(0, height);
    this.vx = randomBetween(-0.5, 0.5);
    this.vy = randomBetween(-0.5, 0.5);
    this.radius = randomBetween(2, 3.5);
    this.baseColor = RED;
    this.color = this.baseColor;
    this.highlightTimer = 0;
  }
  move() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  updateColor() {
    if (this.highlightTimer > 0) {
      this.highlightTimer--;
      this.color = DARK_RED;
    } else {
      this.color = this.baseColor;
    }
  }
}

function drawLine(p1, p2, highlight = false) {
  const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
  if (dist < LINE_DISTANCE) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = highlight ? DARK_RED : RED;
    ctx.globalAlpha = highlight ? 0.7 : 0.25;
    ctx.lineWidth = highlight ? 2.2 : 1.1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  // Parallax effect
  ctx.translate(parallax.x, parallax.y);
  ctx.fillStyle = BG;
  ctx.fillRect(-parallax.x, -parallax.y, width, height);

  // Draw lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      let highlight = false;
      if (mouse.x !== null && mouse.y !== null) {
        const t = ((mouse.x - p1.x) * (p2.x - p1.x) + (mouse.y - p1.y) * (p2.y - p1.y)) / (Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        if (t >= 0 && t <= 1) {
          const projX = p1.x + t * (p2.x - p1.x);
          const projY = p1.y + t * (p2.y - p1.y);
          const distToLine = Math.hypot(mouse.x - projX, mouse.y - projY);
          if (distToLine < 40) {
            highlight = true;
            p1.highlightTimer = 10;
            p2.highlightTimer = 10;
          }
        }
      }
      drawLine(p1, p2, highlight);
    }
  }

  // Draw and move particles
  for (const p of particles) {
    // Mouse repels particles
    if (mouse.x !== null && mouse.y !== null) {
      const dist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
      if (dist < 60) {
        const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
        p.x += Math.cos(angle) * 1.2;
        p.y += Math.sin(angle) * 1.2;
      }
    }
    p.move();
    p.updateColor();
    // Glow effect
    ctx.save();
    ctx.shadowColor = RED;
    ctx.shadowBlur = 16;
    p.draw();
    ctx.restore();
  }

  ctx.restore();
  requestAnimationFrame(animate);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  // Parallax effect
  parallax.x = (e.clientX - width / 2) * 0.03;
  parallax.y = (e.clientY - height / 2) * 0.03;
});
window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

// Init
resize();
particles.length = 0;
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}
animate(); 