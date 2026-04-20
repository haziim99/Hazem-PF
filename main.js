/**
 * ════════════════════════════════════════════════════════
 *  HAZEM MOSTAFA PORTFOLIO — main.js
 *  Pure Vanilla JavaScript — no frameworks
 *  Modules: Cursor · Loader · Theme · Particles · Typewriter
 *           Reveal · SkillBars · Timeline · ProjectFilter
 *           Modal · Form · Nav · GSAP
 * ════════════════════════════════════════════════════════
 */

'use strict';

/* ══════════════════════════════════════
   UTILITY HELPERS
══════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══════════════════════════════════════
   MODULE: CUSTOM CURSOR
══════════════════════════════════════ */
function initCursor() {
  const dot  = $('#cursor');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0; // mouse position
  let rx = 0, ry = 0; // ring (lagging) position

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // Dot snaps immediately
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring lazily follows with lerp
  function lerp(a, b, t) { return a + (b - a) * t; }
  function animateRing() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

/* ══════════════════════════════════════
   MODULE: LOADING SCREEN
══════════════════════════════════════ */
function initLoader() {
  const loader   = $('#loader');
  const bar      = $('#loader-bar');
  const txt      = $('#loader-text');
  if (!loader) return;

  const steps = [
    { pct: 30,  msg: 'Initializing...' },
    { pct: 55,  msg: 'Loading modules...' },
    { pct: 78,  msg: 'Compiling styles...' },
    { pct: 92,  msg: 'Almost ready...' },
    { pct: 100, msg: 'Done!' }
  ];
  let step = 0;

  // Step through the progress bar
  const iv = setInterval(() => {
    if (step >= steps.length) { clearInterval(iv); return; }
    bar.style.width  = steps[step].pct + '%';
    txt.textContent  = steps[step].msg;
    step++;
  }, 260);

  // Dismiss after ~1.5 s
  window.addEventListener('load', () => {
    setTimeout(() => {
      bar.style.width = '100%';
      setTimeout(() => {
        loader.style.transition = 'opacity 0.5s ease';
        loader.style.opacity    = '0';
        setTimeout(() => {
          loader.style.display = 'none';
          initAfterLoad(); // kick off post-load animations
        }, 500);
      }, 350);
    }, 1200);
  });
}

/* ══════════════════════════════════════
   MODULE: THEME TOGGLE (dark / light)
══════════════════════════════════════ */
function initTheme() {
  const btn  = $('#theme-toggle');
  const html = document.documentElement;

  // Restore persisted preference
  const saved = localStorage.getItem('hm-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn && btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hm-theme', next);
  });
}

/* ══════════════════════════════════════
   MODULE: PARTICLE NETWORK (hero canvas)
══════════════════════════════════════ */
function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const PARTICLE_COUNT = 70;
  const MAX_LINK_DIST  = 120;
  const particles      = [];

  // Colour palette for particles
  const colours = [
    'rgba(168,85,247,',
    'rgba(34,211,238,',
    'rgba(244,114,182,',
    'rgba(59,130,246,'
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Spawn particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.5 + 0.5,
      c:  colours[Math.floor(Math.random() * colours.length)],
      a:  Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Move & draw dots
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + p.a + ')';
      ctx.fill();
    });

    // Draw connecting lines for nearby pairs
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_LINK_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(168,85,247,' + (0.07 * (1 - dist / MAX_LINK_DIST)) + ')';
          ctx.lineWidth   = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════
   MODULE: TYPEWRITER (rotating hero roles)
══════════════════════════════════════ */
function initTypewriter() {
  const el = $('#rotating-text');
  if (!el) return;

  const roles = [
    'Angular Specialist',
    'NgRx Architect',
    'Full Stack Engineer',
    'ASP.NET Developer',
    'Node.js Engineer',
    'UI/UX Enthusiast'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let deleting  = false;

  function type() {
    const target = roles[roleIndex];

    if (!deleting) {
      el.textContent = target.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === target.length) {
        // Pause at full word
        deleting = true;
        setTimeout(type, 2400);
        return;
      }
    } else {
      el.textContent = target.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting   = false;
        roleIndex  = (roleIndex + 1) % roles.length;
      }
    }
    setTimeout(type, deleting ? 55 : 90);
  }
  type();
}

/* ══════════════════════════════════════
   MODULE: SCROLL REVEAL
   Uses IntersectionObserver for performance
══════════════════════════════════════ */
function initScrollReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   MODULE: ANIMATED SKILL BARS
══════════════════════════════════════ */
function initSkillBars() {
  const categories = $$('.skill-category');
  if (!categories.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.skill-fill', entry.target).forEach(bar => {
          // Slight stagger per bar
          const idx = [...$$('.skill-fill', entry.target)].indexOf(bar);
          setTimeout(() => {
            bar.style.width = (bar.dataset.width || 0) + '%';
          }, idx * 80);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  categories.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   MODULE: TIMELINE ENTRANCE
══════════════════════════════════════ */
function initTimeline() {
  const items = $$('.timeline-item');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger each item
        const idx = items.indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateX(0)';
          entry.target.style.transition =
            'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)';
        }, idx * 150);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   MODULE: PROJECT FILTER TABS
══════════════════════════════════════ */
function initProjectFilter() {
  const btns  = $$('.filter-btn');
  const cards = $$('.project-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.category === filter;

        if (match) {
          card.classList.remove('hidden');
          // Re-trigger entrance animation
          card.style.opacity   = '0';
          card.style.transform = 'translateY(30px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(.4,0,.2,1)';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          }, i * 60);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ══════════════════════════════════════
   MODULE: PROJECT MODAL
══════════════════════════════════════ */

/** Full project data — single source of truth */
const PROJECT_DATA = {
  p1: {
    icon:  '✅',
    title: 'Task Management System',
    type:  'Full Stack',
    desc:  'An enterprise-grade, full-stack task management application built on ASP.NET Core MVC. Features a role-based access control system, a complete RESTful API, and a real-time analytics dashboard — giving teams visibility into project health at a glance.',
    features: [
      'Role-based access control — Admin, Manager, and User tiers',
      'Full RESTful API with CRUD operations for tasks, projects & users',
      'Authentication with cookie-based sessions & server-side validation',
      'Analytics dashboard — task completion rates, workload distribution',
      'Entity Framework Core with SQL Server for data persistence',
      'Bootstrap-powered responsive UI with clean admin aesthetics'
    ],
    stack: [
      { label: 'C#',               cls: 'tag-csharp' },
      { label: 'ASP.NET Core MVC', cls: 'tag-dotnet' },
      { label: 'Entity Framework', cls: 'tag-ef' },
      { label: 'SQL Server',       cls: 'tag-sql' },
      { label: 'Bootstrap',        cls: 'tag-bs' }
    ]
  },
  p2: {
    icon:  '🎓',
    title: 'E-Learning Platform',
    type:  'Frontend (Angular)',
    desc:  'A scalable, production-quality learning management system built entirely in Angular. The application uses NgRx for predictable state management, RxJS for reactive data streams, and integrates Firebase and Cloudinary for backend services and rich media handling.',
    features: [
      'NgRx store with effects & entity adapters for state management',
      'Server-Side Rendering (SSR) for improved SEO & first-load performance',
      'Responsive UI built with Angular Material & Tailwind CSS',
      'Firebase for real-time database, authentication & hosting',
      'Cloudinary integration for media upload, transformation & delivery',
      'RxJS reactive pipelines for live content & enrollment updates'
    ],
    stack: [
      { label: 'Angular',         cls: 'tag-angular' },
      { label: 'NgRx',            cls: 'tag-ngrx' },
      { label: 'RxJS',            cls: 'tag-rxjs' },
      { label: 'Angular Material',cls: 'tag-material' },
      { label: 'Firebase',        cls: 'tag-firebase' },
      { label: 'Cloudinary',      cls: 'tag-cloudinary' },
      { label: 'Tailwind CSS',    cls: 'tag-tailwind' },
      { label: 'Bootstrap',       cls: 'tag-bs' }
    ]
  },
  p3: {
    icon:  '🛒',
    title: 'Shop Smart (E-Commerce)',
    type:  'Full Stack',
    desc:  'A full-stack e-commerce application with dynamic product listings, a persistent shopping cart, and a Node.js REST API backend. Built with Angular on the frontend and a clean Bootstrap UI, demonstrating end-to-end full-stack proficiency.',
    features: [
      'Dynamic product catalogue with search & category filtering',
      'Shopping cart with session-persistent state',
      'Fully responsive Bootstrap layout for all screen sizes',
      'Node.js & Express REST API backend',
      'RESTful product and order management endpoints',
      'Clean, conversion-optimised UI design'
    ],
    stack: [
      { label: 'Angular',   cls: 'tag-angular' },
      { label: 'Node.js',   cls: 'tag-node' },
      { label: 'Bootstrap', cls: 'tag-bs' }
    ]
  },
  p4: {
    icon:  '📝',
    title: 'Todo App',
    type:  'Frontend (Nuxt 3)',
    desc:  'A focused, minimal task management application showcasing the power of Nuxt 3 and the Vue Composition API. Built for performance with server-side rendering and a clean, distraction-free interface.',
    features: [
      'Create, complete, and delete tasks with instant UI feedback',
      'Nuxt 3 with SSR / SSG for blazing-fast performance',
      'Vue 3 Composition API with reactive state management',
      'Persistent tasks via localStorage across sessions',
      'Clean, minimal design with smooth CSS transitions',
      'Optimised Lighthouse performance scores'
    ],
    stack: [
      { label: 'Nuxt 3', cls: 'tag-nuxt' },
      { label: 'Vue 3',  cls: 'tag-vue' }
    ]
  }
};

function initModal() {
  const overlay = $('#modal-overlay');
  const body    = $('#modal-body');
  const closeBtn= $('#modal-close');
  if (!overlay) return;

  // Open modal when a "View Details" button is clicked
  document.addEventListener('click', e => {
    const btn  = e.target.closest('.details-btn');
    const card = e.target.closest('.project-card');
    if (!btn || !card) return;

    const id   = card.dataset.project;
    const data = PROJECT_DATA[id];
    if (!data) return;

    // Build modal HTML
    body.innerHTML = `
      <span class="modal-icon">${data.icon}</span>
      <h2 class="modal-title">${data.title}</h2>
      <p style="font-size:12px;color:var(--purple);font-family:'JetBrains Mono',monospace;
                letter-spacing:.15em;margin-bottom:16px;text-transform:uppercase;">${data.type}</p>
      <p class="modal-desc">${data.desc}</p>
      <div class="modal-features">
        <h4>// Key Features</h4>
        ${data.features.map(f => `<div class="modal-feature">${f}</div>`).join('')}
      </div>
      <div class="project-stack" style="margin-bottom:0">
        ${data.stack.map(s => `<span class="stack-tag ${s.cls}">${s.label}</span>`).join('')}
      </div>
    `;

    openModal();
  });

  function openModal() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);

  // Click outside modal to close
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  // Esc key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
  });
}

/* ══════════════════════════════════════
   MODULE: CONTACT FORM
══════════════════════════════════════ */
function initContactForm() {
  const form    = $('#contact-form');
  const btn     = $('#form-submit-btn');
  const success = $('#form-success');
  if (!form) return;

  // Simple real-time validation helper
  function validateField(input, errorId, condition) {
    const group = input.closest('.form-group');
    const err   = document.getElementById(errorId);
    if (!condition) {
      group.classList.add('has-error');
      input.classList.add('invalid');
      return false;
    }
    group.classList.remove('has-error');
    input.classList.remove('invalid');
    return true;
  }

  // Validate on blur for immediate feedback
  const nameInput  = $('#cf-name');
  const emailInput = $('#cf-email');
  const msgInput   = $('#cf-msg');

  nameInput  && nameInput.addEventListener('blur',  () => validateField(nameInput,  'err-name',  nameInput.value.trim().length > 0));
  emailInput && emailInput.addEventListener('blur', () => validateField(emailInput, 'err-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)));
  msgInput   && msgInput.addEventListener('blur',   () => validateField(msgInput,   'err-msg',   msgInput.value.trim().length > 0));

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Run all validations
    const nameOk  = validateField(nameInput,  'err-name',  nameInput.value.trim().length > 0);
    const emailOk = validateField(emailInput, 'err-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value));
    const msgOk   = validateField(msgInput,   'err-msg',   msgInput.value.trim().length > 0);

    if (!nameOk || !emailOk || !msgOk) return;

    // Simulate send
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    setTimeout(() => {
      btn.style.display    = 'none';
      success.style.display= 'flex';
      form.reset();
      // Reset field states
      $$('.form-group', form).forEach(g => g.classList.remove('has-error'));
      $$('.form-control', form).forEach(c => c.classList.remove('invalid'));
    }, 1400);
  });
}

/* ══════════════════════════════════════
   MODULE: NAV — scroll shadow + active link
══════════════════════════════════════ */
function initNav() {
  const nav     = $('#navbar');
  const sections= $$('section[id]');
  const links   = $$('.nav-links a');

  if (!nav) return;

  // Add scrolled class for box-shadow
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Highlight active nav link based on scroll position
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const link = links.find(l => l.getAttribute('href') === '#' + entry.target.id);
        link && link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
}

/* ══════════════════════════════════════
   MODULE: GSAP PREMIUM ANIMATIONS
   (runs after loader dismisses)
══════════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger plugin
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── HERO ENTRANCE — staggered cascade
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-badge',          { y: 30, opacity: 0, duration: 0.8, delay: 0.1 })
    .from('.hero-title',          { y: 55, opacity: 0, duration: 1.0 }, '-=0.5')
    .from('.hero-rotating-roles', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
    .from('.hero-desc',           { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
    .from('.hero-ctas',           { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
    .from('.hero-scroll',         { y: 20, opacity: 0, duration: 0.7 }, '-=0.4');

  // ── PARALLAX — hero content drifts on scroll
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.to('.hero-content', {
      scrollTrigger: {
        trigger: '#hero',
        start:   'top top',
        end:     'bottom top',
        scrub:   true
      },
      y:       -90,
      opacity: 0.2
    });

    // ── PROJECT CARDS — stagger entrance on scroll
    gsap.from('.project-card', {
      scrollTrigger: {
        trigger:  '#projects',
        start:    'top 70%',
        toggleActions: 'play none none none'
      },
      y:        50,
      opacity:  0,
      duration: 0.7,
      stagger:  0.12,
      ease:     'power3.out'
    });

    // ── SKILL CATEGORIES — slight rotate entrance
    gsap.from('.skill-category', {
      scrollTrigger: {
        trigger: '#skills',
        start:   'top 75%'
      },
      y:        40,
      opacity:  0,
      duration: 0.65,
      stagger:  0.1,
      ease:     'power2.out'
    });
  }
}

/* ══════════════════════════════════════
   MODULE: FOOTER YEAR
══════════════════════════════════════ */
function initFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════
   INIT — runs immediately (sync)
══════════════════════════════════════ */
function initSync() {
  initCursor();
  initTheme();
  initLoader();       // Loader handles its own timing
  initParticles();    // Canvas starts immediately
  initTypewriter();   // Typewriter starts immediately
  initNav();
  initFooterYear();
  initProjectFilter();
  initModal();
  initContactForm();
}

/* ══════════════════════════════════════
   INIT — after loader dismisses
══════════════════════════════════════ */
function initAfterLoad() {
  initScrollReveal();
  initSkillBars();
  initTimeline();
  initGSAP();         // GSAP uses ScrollTrigger — needs DOM stable
}

/* ── BOOT ── */
initSync();
