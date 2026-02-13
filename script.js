/**
 * Cybernetic Precision Portfolio
 * Interactive Features & Animations
 */

// ============================================
// 1. PARTICLE SYSTEM (Canvas Background)
// ============================================
// ============================================
// 1. DOT GRID SYSTEM (New Background)
// ============================================

// Helper: Hex to RGB
function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

class DotGrid {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.wrapper = canvas.parentElement;

    // Configuration (from user request)
    this.config = {
      dotSize: 4,
      gap: 15,
      baseColor: '#271E37', // Dark Purple
      activeColor: '#5227FF', // Bright Blue/Purple
      proximity: 120,
      activeProximity: 280, // Extended range for mouse influence
      shockRadius: 250,
      shockStrength: 5,
      resistance: 750,
      returnDuration: 1.5,
      speedTrigger: 100,
      maxSpeed: 5000
    };

    this.dots = [];
    this.pointer = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 0,
      lastTime: 0,
      lastX: 0,
      lastY: 0
    };

    this.baseRgb = hexToRgb(this.config.baseColor);
    this.activeRgb = hexToRgb(this.config.activeColor);

    this.init();
  }

  init() {
    this.resize();
    this.buildGrid();

    // Event Listeners
    window.addEventListener('resize', () => {
      this.resize();
      this.buildGrid();
    });

    // Throttled mouse move for Physics calculation
    let lastMove = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastMove < 20) return; // 50fps throttle
      lastMove = now;
      this.handleMouseMove(e);
    }, { passive: true });

    // Click interaction
    window.addEventListener('click', (e) => this.handleClick(e));

    // Start Animation Loop
    this.animate();
  }

  resize() {
    // Use window size for background coverage
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(dpr, dpr);
  }

  buildGrid() {
    const { dotSize, gap } = this.config;

    const cols = Math.floor((this.width + gap) / (dotSize + gap));
    const rows = Math.floor((this.height + gap) / (dotSize + gap));
    const cell = dotSize + gap;

    // Center the grid
    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;
    const startX = (this.width - gridW) / 2 + dotSize / 2;
    const startY = (this.height - gridH) / 2 + dotSize / 2;

    this.dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        this.dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          _inertiaApplied: false
        });
      }
    }
  }

  handleMouseMove(e) {
    const now = performance.now();
    const dt = this.pointer.lastTime ? now - this.pointer.lastTime : 16;

    const dx = e.clientX - this.pointer.lastX;
    const dy = e.clientY - this.pointer.lastY;

    let vx = (dx / dt) * 1000;
    let vy = (dy / dt) * 1000;

    let speed = Math.hypot(vx, vy);
    if (speed > this.config.maxSpeed) {
      const scale = this.config.maxSpeed / speed;
      vx *= scale;
      vy *= scale;
      speed = this.config.maxSpeed;
    }

    this.pointer.lastTime = now;
    this.pointer.lastX = e.clientX;
    this.pointer.lastY = e.clientY;
    this.pointer.vx = vx;
    this.pointer.vy = vy;
    this.pointer.speed = speed;
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;

    // Apply Inertia to dots nearby
    this.dots.forEach(dot => {
      const dist = Math.hypot(dot.cx - this.pointer.x, dot.cy - this.pointer.y);

      if (speed > this.config.speedTrigger && dist < this.config.proximity && !dot._inertiaApplied) {
        dot._inertiaApplied = true;

        // Calculate push target (Simulating inertia throw)
        const pushX = (dot.cx - this.pointer.x) * 0.2 + vx * 0.05;
        const pushY = (dot.cy - this.pointer.y) * 0.2 + vy * 0.05;

        // GSAP Animation replacing InertiaPlugin
        gsap.killTweensOf(dot);
        gsap.to(dot, {
          xOffset: pushX,
          yOffset: pushY,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: this.config.returnDuration,
              ease: "elastic.out(1, 0.5)"
            });
            dot._inertiaApplied = false;
          }
        });
      }
    });
  }

  handleClick(e) {
    const cx = e.clientX;
    const cy = e.clientY;

    this.dots.forEach(dot => {
      const dist = Math.hypot(dot.cx - cx, dot.cy - cy);

      if (dist < this.config.shockRadius && !dot._inertiaApplied) {
        dot._inertiaApplied = true;
        gsap.killTweensOf(dot);

        const falloff = Math.max(0, 1 - dist / this.config.shockRadius);
        const pushX = (dot.cx - cx) * this.config.shockStrength * falloff;
        const pushY = (dot.cy - cy) * this.config.shockStrength * falloff;

        // Shockwave then return
        gsap.to(dot, {
          xOffset: pushX,
          yOffset: pushY,
          duration: 0.5,
          ease: "power3.out",
          onComplete: () => {
            gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: this.config.returnDuration,
              ease: "elastic.out(1, 0.5)"
            });
            dot._inertiaApplied = false;
          }
        });
      }
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const proxSq = this.config.activeProximity * this.config.activeProximity;
    const { dotSize, baseColor } = this.config;
    const radius = dotSize / 2;

    this.dots.forEach(dot => {
      const ox = dot.cx + dot.xOffset;
      const oy = dot.cy + dot.yOffset;

      // Interaction Color Calculation
      let style = baseColor;

      // Check distance to mouse for color
      if (this.pointer.x !== 0 && this.pointer.y !== 0) {
        const dx = dot.cx - this.pointer.x;
        const dy = dot.cy - this.pointer.y;
        const dsq = dx * dx + dy * dy;

        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / this.config.activeProximity;

          // Smooth color interpolation
          const r = Math.round(this.baseRgb.r + (this.activeRgb.r - this.baseRgb.r) * t);
          const g = Math.round(this.baseRgb.g + (this.activeRgb.g - this.baseRgb.g) * t);
          const b = Math.round(this.baseRgb.b + (this.activeRgb.b - this.baseRgb.b) * t);
          style = `rgb(${r},${g},${b})`;
        }
      }

      // Draw Dot
      this.ctx.fillStyle = style;
      this.ctx.beginPath();
      this.ctx.arc(ox, oy, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

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
      '> importing sensor_fusion',
      '> systems_online ✓',
      '> welcome_to_sushmitha_govindaraj_portfolio'
    ];
    this.currentCommand = 0;
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
    line.style.color = command.includes('✓') ? '#00FF41' : '#7D8590';
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
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.init();
  }

  init() {
    this.elements.forEach(element => {
      this.observer.observe(element);
    });
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
          const offset = 80; // Account for fixed nav
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
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
    // Trap focus in modals (if added later)
    document.addEventListener('keydown', (e) => {
      // Escape key handling
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Add visible focus indicators
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

  closeAllModals() {
    // Placeholder for future modal functionality
  }
}

// ============================================
// 8. PERFORMANCE OPTIMIZATION
// ============================================
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Disable particle system on mobile for performance
    if (window.innerWidth < 768) {
      const canvas = document.getElementById('particles-canvas');
      if (canvas) {
        canvas.style.display = 'none';
      }
    }

    // Lazy load images (if added)
    this.lazyLoadImages();

    // Debounce scroll events
    this.debounceScrollEvents();
  }

  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
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
      scrollTimeout = setTimeout(() => {
        // Trigger scroll-dependent functions
        console.log('Scroll settled');
      }, 100);
    }, { passive: true });
  }
}

// ============================================
// 9. INITIALIZE ALL SYSTEMS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize particle system (skip on mobile or if reduced motion is preferred)
  if (window.innerWidth >= 768 && !prefersReducedMotion) {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
      new DotGrid(canvas);
    }
  }

  // Initialize terminal typing effect
  const typingElement = document.getElementById('typing-effect');
  const outputElement = document.getElementById('terminal-output');
  if (typingElement && outputElement) {
    new TerminalTyping(typingElement, outputElement);
  }

  // Initialize scroll reveal
  new ScrollReveal();

  // Initialize smooth scroll
  new SmoothScroll();

  // Initialize glitch effects (skip if reduced motion)
  if (!prefersReducedMotion) {
    new GlitchEffect();
  }

  // Initialize active navigation
  new ActiveNav();

  // Initialize keyboard navigation
  new KeyboardNav();

  // Initialize performance optimizations
  new PerformanceOptimizer();

  // Log initialization (remove in production)
  console.log('%c[Portfolio] Systems initialized successfully', 'color: #00FF41; font-weight: bold;');
  console.log('%c[Portfolio] Terminal Green palette loaded', 'color: #00FF41;');
  console.log('%c[Portfolio] DotGrid system:', window.innerWidth >= 768 ? 'Active' : 'Disabled (mobile)', 'color: #00D9FF;');
});

// ============================================
// 10. EXPORT FOR TESTING (Optional)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DotGrid,
    TerminalTyping,
    ScrollReveal,
    SmoothScroll,
    GlitchEffect,
    ActiveNav,
    KeyboardNav,
    PerformanceOptimizer
  };
}
