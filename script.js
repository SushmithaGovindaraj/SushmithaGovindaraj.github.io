/**
 * Cybernetic Precision Portfolio
 * Interactive Features & Animations
 */

// ============================================
// 1. PARTICLE SYSTEM (Canvas Background)
// ============================================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 80;
    this.connectionDistance = 120;
    this.mouse = { x: null, y: null };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Create particles
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((particle, i) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary check
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      // Mouse interaction
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx += (dx / distance) * force * 0.02;
          particle.vy += (dy / distance) * force * 0.02;
        }
      }

      // Damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 107, 107, 0.6)'; // Coral
      this.ctx.fill();

      // Draw connections
      this.particles.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          const opacity = (1 - distance / this.connectionDistance) * 0.3;
          this.ctx.strokeStyle = `rgba(91, 159, 237, ${opacity})`; // Blue
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
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
      '> importing autonomous_systems',
      '> importing deep_learning',
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
      new ParticleSystem(canvas);
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
  console.log('%c[Portfolio] Particle system:', window.innerWidth >= 768 ? 'Active' : 'Disabled (mobile)', 'color: #00D9FF;');
});

// ============================================
// 10. EXPORT FOR TESTING (Optional)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ParticleSystem,
    TerminalTyping,
    ScrollReveal,
    SmoothScroll,
    GlitchEffect,
    ActiveNav,
    KeyboardNav,
    PerformanceOptimizer
  };
}
