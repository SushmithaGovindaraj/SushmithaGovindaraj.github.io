/**
 * Portfolio - Interactive Features & Animations
 */

// ============================================
// 1. CONSTELLATION NETWORK (Canvas Background)
// ============================================

class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };

    this.cfg = {
      count: 110,
      minSpeed: 0.15,
      maxSpeed: 0.40,
      connectDist: 140,      // px — max line distance
      mouseRadius: 190,      // px — mouse attraction range
      dotMinR: 1.2,
      dotMaxR: 2.8,
      lineWidth: 0.55,
      dotColor: '#2a1550',      // dim resting star
      lineRGB: '147, 51, 234' // purple line color
    };

    this.init();
  }

  init() {
    this.resize();
    this.spawn();

    window.addEventListener('resize', () => {
      this.resize();
      this.spawn();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    // Touch support — constellation reacts on mobile swipe
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      this.mouse.x = t.clientX;
      this.mouse.y = t.clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    }, { passive: true });

    window.addEventListener('click', (e) => this.handleClick(e));

    this.animate();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    this.ctx.scale(dpr, dpr);
  }

  spawn() {
    this.particles = [];
    for (let i = 0; i < this.cfg.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = this.cfg.minSpeed + Math.random() * (this.cfg.maxSpeed - this.cfg.minSpeed);
      const r = this.cfg.dotMinR + Math.random() * (this.cfg.dotMaxR - this.cfg.dotMinR);
      this.particles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        baseR: r,
        pushX: 0,
        pushY: 0
      });
    }
  }

  handleClick(e) {
    const cx = e.clientX;
    const cy = e.clientY;
    const repulse = 280;

    this.particles.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist >= repulse || dist === 0) return;

      const force = (1 - dist / repulse) * 5;
      const nx = dx / dist;
      const ny = dy / dist;

      gsap.killTweensOf(p, 'pushX,pushY');
      gsap.to(p, {
        pushX: p.pushX + nx * force * 40,
        pushY: p.pushY + ny * force * 40,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(p, {
            pushX: 0,
            pushY: 0,
            duration: 1.6,
            ease: 'elastic.out(1, 0.4)'
          });
        }
      });
    });
  }

  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    const { connectDist, mouseRadius, lineRGB, lineWidth } = this.cfg;
    const connSq = connectDist * connectDist;
    const mouseRSq = mouseRadius * mouseRadius;

    // ---- Update positions ----
    this.particles.forEach(p => {
      // Mouse attraction
      const mdx = this.mouse.x - p.x;
      const mdy = this.mouse.y - p.y;
      const mdsq = mdx * mdx + mdy * mdy;

      if (mdsq < mouseRSq && mdsq > 0) {
        const md = Math.sqrt(mdsq);
        const pull = (1 - md / mouseRadius) * 0.018;
        p.vx += (mdx / md) * pull;
        p.vy += (mdy / md) * pull;
      }

      // Friction — gradually damp velocity back toward natural drift speed
      p.vx *= 0.995;
      p.vy *= 0.995;

      // Speed floor — ensure particle never fully stops
      const mspd = Math.hypot(p.vx, p.vy);
      if (mspd < this.cfg.minSpeed && mspd > 0) {
        p.vx = (p.vx / mspd) * this.cfg.minSpeed;
        p.vy = (p.vy / mspd) * this.cfg.minSpeed;
      }

      // Speed cap
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > this.cfg.maxSpeed * 2) {
        p.vx = (p.vx / spd) * this.cfg.maxSpeed * 2;
        p.vy = (p.vy / spd) * this.cfg.maxSpeed * 2;
      }

      // Integrate
      p.x += p.vx + p.pushX * 0.12;
      p.y += p.vy + p.pushY * 0.12;

      // Bounce
      if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
      if (p.x > this.W) { p.x = this.W; p.vx = -Math.abs(p.vx); }
      if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
      if (p.y > this.H) { p.y = this.H; p.vy = -Math.abs(p.vy); }
    });

    // ---- Draw lines ----
    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dsq = dx * dx + dy * dy;
        if (dsq > connSq) continue;

        const t = 1 - Math.sqrt(dsq) / connectDist;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${lineRGB}, ${(t * 0.4).toFixed(2)})`;
        ctx.lineWidth = lineWidth * t;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // ---- Draw particles ----
    this.particles.forEach(p => {
      const mdx = this.mouse.x - p.x;
      const mdy = this.mouse.y - p.y;
      const mdsq = mdx * mdx + mdy * mdy;

      let color, drawR;

      if (mdsq < mouseRSq) {
        const t = 1 - Math.sqrt(mdsq) / mouseRadius;
        const alpha = 0.3 + t * 0.7;
        color = t > 0.5
          ? `rgba(233, 213, 255, ${alpha.toFixed(2)})`   // near: lavender-white
          : `rgba(147, 51, 234, ${alpha.toFixed(2)})`;   // mid: purple
        drawR = p.baseR * (1 + t * 1.3);
      } else {
        color = this.cfg.dotColor;
        drawR = p.baseR;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(drawR, 0.5), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Alias so existing init code still works
const DotGrid = ParticleNetwork;

// ============================================
// 2. TERMINAL TYPING EFFECT
// ============================================
class TerminalTyping {
  constructor(element, outputElement) {
    this.element = element;
    this.outputElement = outputElement;
    this.commands = [
      '> initializing_portfolio...',
      '> loading_robotics_engineer.profile',
      '> architecting_intelligent_systems',
      '> integrating_robotic_autonomy',
      '> pioneering_industrial_innovation',
      '> systems_online ✓',
      '> welcome_to_sushmitha_govindaraj_portfolio'
    ];
    this.currentChar = 0;
    this.typingSpeed = 50;
    this.pauseDuration = 800;
    this.startTyping();
  }

  async startTyping() {
    for (const command of this.commands) {
      await this.typeCommand(command);
      await this.pause(this.pauseDuration);
      this.addToOutput(command);
    }
  }

  typeCommand(command) {
    return new Promise(resolve => {
      this.currentChar = 0;
      const interval = setInterval(() => {
        this.element.textContent = command.slice(0, this.currentChar + 1);
        this.currentChar++;
        if (this.currentChar >= command.length) {
          clearInterval(interval);
          resolve();
        }
      }, this.typingSpeed);
    });
  }

  addToOutput(command) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.style.color = command.includes('✓') ? '#A855F7' : '#7D8590';
    line.textContent = command;
    this.outputElement.appendChild(line);
    this.element.textContent = '';
  }

  pause(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}

// ============================================
// 3. SCROLL REVEAL ANIMATIONS
// ============================================
class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('[data-reveal]');
    this.observer = new IntersectionObserver(
      entries => this.handleIntersection(entries),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    this.init();
  }

  init() {
    this.elements.forEach(el => this.observer.observe(el));
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        this.observer.unobserve(entry.target);
      }
    });
  }
}

// ============================================
// 4. SMOOTH SCROLL NAVIGATION
// ============================================
class SmoothScroll {
  constructor() {
    this.links = document.querySelectorAll('[data-scroll]');
    this.init();
  }

  init() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      });
    });
  }
}

// ============================================
// 5. PROJECT CARD GLITCH EFFECT
// ============================================
class GlitchEffect {
  constructor() {
    this.cards = document.querySelectorAll('.project-card');
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      card.addEventListener('mouseenter', () => this.applyGlitch(card));
    });
  }

  applyGlitch(card) {
    const glitchDuration = 300;
    const glitchIntensity = 2;
    let frame = 0;
    const maxFrames = 5;

    const glitchInterval = setInterval(() => {
      if (frame >= maxFrames) {
        clearInterval(glitchInterval);
        card.style.transform = '';
        return;
      }
      const offsetX = (Math.random() - 0.5) * glitchIntensity;
      const offsetY = (Math.random() - 0.5) * glitchIntensity;
      card.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      frame++;
    }, glitchDuration / maxFrames);
  }
}

// ============================================
// 6. ACTIVE NAVIGATION HIGHLIGHTING
// ============================================
class ActiveNav {
  constructor() {
    this.sections = document.querySelectorAll('section[id]');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.updateActiveLink());
    this.updateActiveLink();
  }

  updateActiveLink() {
    const scrollPosition = window.scrollY + 150;
    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        this.navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

// ============================================
// 7. KEYBOARD ACCESSIBILITY
// ============================================
class KeyboardNav {
  constructor() {
    this.focusableElements = document.querySelectorAll(
      'a, button, input, [tabindex]:not([tabindex="-1"])'
    );
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAllModals();
    });

    this.focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.style.outline = '2px solid var(--color-primary)';
        element.style.outlineOffset = '2px';
      });
      element.addEventListener('blur', () => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      });
    });
  }

  closeAllModals() { }
}

// ============================================
// 8. PERFORMANCE OPTIMIZATION
// ============================================
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    if (window.innerWidth < 768) {
      const canvas = document.getElementById('particles-canvas');
      if (canvas) canvas.style.display = 'none';
    }
    this.lazyLoadImages();
    this.debounceScrollEvents();
  }

  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  }

  debounceScrollEvents() {
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { }, 100);
    }, { passive: true });
  }
}

// ============================================
// 9. INITIALIZE ALL SYSTEMS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize constellation background (skip on mobile or reduced motion)
  if (window.innerWidth >= 768 && !prefersReducedMotion) {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) new ParticleNetwork(canvas);
  }

  // Initialize terminal typing effect
  const typingElement = document.getElementById('typing-effect');
  const outputElement = document.getElementById('terminal-output');
  if (typingElement && outputElement) {
    new TerminalTyping(typingElement, outputElement);
  }

  new ScrollReveal();
  new SmoothScroll();

  if (!prefersReducedMotion) new GlitchEffect();

  new ActiveNav();
  new KeyboardNav();
  new PerformanceOptimizer();

  console.log('%c[Portfolio] Constellation system initialized', 'color: #A855F7; font-weight: bold;');
});

// ============================================
// 10. EXPORT FOR TESTING (Optional)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ParticleNetwork,
    TerminalTyping,
    ScrollReveal,
    SmoothScroll,
    GlitchEffect,
    ActiveNav,
    KeyboardNav,
    PerformanceOptimizer
  };
}
