/* ============================================================
   CareerTwin clone — UI interactions
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* storage is unavailable in sandboxed previews / private modes — never let
     that take the whole page down */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------- theme ---------------- */
  const stored = store.get('ct-theme');
  root.setAttribute('data-theme', stored || 'dark');

  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set('ct-theme', next);
    window.dispatchEvent(new Event('careertwin:theme'));
  });

  /* ---------------- header / progress ---------------- */
  const header = $('#siteHeader');
  const bar = $('#progressBar');

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 12);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- mobile menu ---------------- */
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
  });
  function closeMenu() {
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
  }
  $$('#mobileMenu a').forEach((a) => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
      menuBtn.focus();
    }
  });

  /* ---------------- hero entrance: class driven, with a safety net ---------------- */
  function markReady() {
    document.documentElement.classList.add('is-ready');
  }
  requestAnimationFrame(() => requestAnimationFrame(markReady));
  setTimeout(markReady, 1200); // never leave the hero invisible

  /* ---------------- hero visual: drop the intro animation once done ----------------
     Chrome keeps a stale compositing layer over WebGL canvases that live inside an
     element with a finished `animation: ... forwards`. Clearing it after the intro
     makes the 3D scene composite reliably. */
  const heroVisual = $('#heroVisual');
  if (heroVisual) {
    const clearIntro = () => {
      heroVisual.style.animation = 'none';
      heroVisual.style.opacity = '1';
      heroVisual.style.transform = 'none';
      window.dispatchEvent(new Event('careertwin:resize3d'));
    };
    heroVisual.addEventListener('animationend', clearIntro, { once: true });
    setTimeout(clearIntro, 1700);
  }

  /* ---------------- hero spotlight ---------------- */
  const hero = $('#hero');
  const spot = $('#spotlight');
  if (hero && spot && window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      spot.style.left = (e.clientX - r.left) + 'px';
      spot.style.top = (e.clientY - r.top) + 'px';
    });
  }

  /* ---------------- "say hi" robot hint ---------------- */
  const robotHint = $('#robotHint');
  const robotCanvasEl = $('#robotCanvas');
  if (robotHint && robotCanvasEl) {
    if (store.sget('ct-hint') === 'done') {
      robotHint.remove();
    } else {
      const dismissHint = () => {
        robotHint.classList.add('is-gone');
        store.sset('ct-hint', 'done');
        setTimeout(() => robotHint.remove(), 420);
      };
      robotHint.addEventListener('click', () => {
        robotCanvasEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        dismissHint();
      });
      robotCanvasEl.addEventListener('pointerdown', dismissHint, { once: true });
      setTimeout(dismissHint, 14000);
    }
  }

  /* ---------------- scroll hint ---------------- */
  const scrollHint = $('#scrollHint');
  if (scrollHint) {
    scrollHint.addEventListener('click', () => {
      const target = $('#flowStrip') || $('#features');
      const top = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = $$('.reveal, .reveal-scale, .reveal-pop');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------------- parallax floats ---------------- */
  const floats = $$('[data-float]');
  if (floats.length && !reduce && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      floats.forEach((el, i) => {
        el.style.setProperty('--py', (y * (i % 2 === 0 ? 0.055 : -0.04)) + 'px');
        el.style.translate = '0 ' + (y * (i % 2 === 0 ? 0.055 : -0.04)) + 'px';
      });
    }, { passive: true });
  }

  /* ---------------- card tilt + cursor glow ---------------- */
  $$('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      if (!reduce && window.matchMedia('(pointer:fine)').matches) {
        card.style.transform =
          'perspective(900px) rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg) rotateY(' +
          ((px - 0.5) * 9).toFixed(2) + 'deg) translateY(-6px)';
      }
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---------------- magnetic buttons ---------------- */
  if (window.matchMedia('(pointer:fine)').matches && !reduce) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = 'translate(' + (dx * 7).toFixed(1) + 'px,' + (dy * 5 - 2).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------------- FAQ accordion ----------------
     One question open at a time, measured heights (works after resize
     and font loads), roving ↑ / ↓ / Home / End keyboard navigation,
     and a deep link like #faq-q3 opens the right answer. */
  const faqList = $('#faqList');
  const faqItems = $$('.faq-item');
  const faqQs = $$('.faq-q');

  function setOpen(item, open) {
    const q = $('.faq-q', item);
    item.classList.toggle('is-open', open);
    q.setAttribute('aria-expanded', String(open));
  }

  function openItem(item, { focus } = {}) {
    faqItems.forEach((other) => setOpen(other, other === item));
    if (focus) $('.faq-q', item).focus({ preventScroll: true });
    const top = item.getBoundingClientRect().top;
    if (top < 96) window.scrollBy({ top: top - 104, behavior: reduce ? 'auto' : 'smooth' });
  }

  faqItems.forEach((item, index) => {
    const q = $('.faq-q', item);
    setOpen(item, item.classList.contains('is-open'));

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) {
        setOpen(item, false);
      } else {
        openItem(item);
      }
    });

    q.addEventListener('keydown', (e) => {
      const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(e.key) && e.key !== 'Escape') return;
      e.preventDefault();
      if (e.key === 'Escape') {
        setOpen(item, false);
        q.focus({ preventScroll: true });
        return;
      }
      let next = index;
      if (e.key === 'ArrowDown') next = Math.min(faqQs.length - 1, index + 1);
      if (e.key === 'ArrowUp') next = Math.max(0, index - 1);
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = faqQs.length - 1;
      faqQs[next].focus({ preventScroll: true });
    });
  });

  // deep link (#faq-q2 …) works on load and on hash change
  function openFromHash() {
    const id = window.location.hash.replace('#', '');
    const match = faqQs.find((q) => q.id === id);
    if (match) openItem(match.closest('.faq-item'));
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------------- smooth in-page anchors ---------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      if (id === '#analyze') return; // handled by analyze flow
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ============================================================
     ANALYZE EXPERIENCE
     ============================================================ */
  const view = $('#analyzeView');
  const steps = $$('.analyze-step');
  const resumeInput = $('#resumeInput');
  const targetRole = $('#targetRole');
  const fileInput = $('#fileInput');
  const fileName = $('#fileName');
  let lastFocus = null;

  const SAMPLE = `Aarav Mehta — Frontend Developer
Bengaluru, India | aarav@example.com

SUMMARY
Frontend developer with 2 years of experience building responsive web apps.
Comfortable with JavaScript, React and design systems. Learning TypeScript.

EXPERIENCE
Junior Frontend Developer, Pixelworks (2023–present)
- Built 14 reusable React components used across 3 products
- Improved Lighthouse performance score from 61 to 94
- Collaborated with design on a Figma-based design system

Projects
- Portfolio dashboard with charts and dark mode
- REST-powered job board using Node and Express

SKILLS
JavaScript, React, HTML, CSS, Figma, Git, REST APIs, responsive design

EDUCATION
B.Tech Computer Science, VIT — 2023`;

  function goStep(n) {
    steps.forEach((s) => s.classList.toggle('is-active', s.dataset.step === String(n)));
    if (view.scrollTo) view.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const pageChrome = $$('.site-header, main, .site-footer, .flow-strip');
  function setPageInert(on) {
    pageChrome.forEach((el) => { el.inert = on; });
  }

  function openAnalyze() {
    lastFocus = document.activeElement;
    view.classList.add('is-open');
    view.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setPageInert(true);
    goStep(1);
    setTimeout(() => resumeInput && resumeInput.focus({ preventScroll: true }), 420);
  }
  function closeAnalyze() {
    view.classList.remove('is-open');
    view.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    setPageInert(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  $$('a[href="#analyze"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    openAnalyze();
  }));
  $$('[data-close-analyze]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    closeAnalyze();
  }));
  $('#analyzeBack').addEventListener('click', closeAnalyze);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && view.classList.contains('is-open')) closeAnalyze();
  });

  $('#sampleBtn').addEventListener('click', () => {
    resumeInput.value = SAMPLE;
    targetRole.value = 'Frontend Developer';
    resumeInput.focus();
  });

  const fileNote = $('#fileNote');
  function showFileNote(message) {
    if (!fileNote) return;
    fileNote.textContent = message;
    fileNote.hidden = !message;
  }

  fileInput.addEventListener('change', () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    fileName.textContent = f.name;
    const isText = /\.(txt|md|text)$/i.test(f.name);

    if (!isText) {
      showFileNote('“' + f.name + '” is attached, but a PDF or Word file can\'t be read safely in the browser. Open it, copy the text and paste it above for the most accurate report.');
      return;
    }

    showFileNote('');
    const reader = new FileReader();
    reader.onload = () => { resumeInput.value = String(reader.result).slice(0, 8000); };
    reader.readAsText(f);
  });

  /* -------- lightweight on-device "analysis" -------- */
  const SKILL_MAP = {
    javascript: 1, typescript: 1, react: 1, 'next.js': 1, vue: 1, angular: 1, node: 1, express: 1,
    html: 1, css: 1, tailwind: 1, python: 1, java: 1, sql: 1, mongodb: 1, postgres: 1, git: 1,
    figma: 1, 'ui design': 1, 'ux': 1, 'design system': 1, 'design systems': 1, prototype: 1,
    'data analysis': 1, pandas: 1, numpy: 1, tableau: 1, 'power bi': 1, excel: 1, 'machine learning': 1,
    tensorflow: 1, pytorch: 1, docker: 1, kubernetes: 1, aws: 1, azure: 1, 'rest': 1, 'rest apis': 1,
    graphql: 1, api: 1, testing: 1, jest: 1, agile: 1, communication: 1, leadership: 1,
    marketing: 1, seo: 1, content: 1, 'product management': 1, analytics: 1, accessiblity: 1, accessibility: 1
  };

  const PROFILES = [
    {
      role: 'Frontend Developer',
      keys: ['react', 'javascript', 'typescript', 'css', 'html', 'next.js', 'tailwind', 'vue', 'design system', 'git', 'api'],
      paths: [['Senior Frontend Engineer', 94], ['Full-stack Developer', 86], ['UI Engineer', 81]],
      roadmap: [
        ['Week 1 — TypeScript fundamentals', 'Convert two components to typed TS; learn generics and utility types.'],
        ['Week 2 — Testing', 'Add Jest + React Testing Library to your project. Aim for 60% coverage.'],
        ['Week 3 — Performance', 'Profile with Lighthouse, ship code-splitting and image optimisation.'],
        ['Week 4 — Ship & tell', 'Publish a case study: before/after metrics plus a live demo link.']
      ]
    },
    {
      role: 'Data Analyst',
      keys: ['sql', 'python', 'excel', 'tableau', 'power bi', 'pandas', 'analytics', 'data analysis', 'numpy', 'communication'],
      paths: [['Business Analyst', 92], ['Data Scientist (junior)', 84], ['Product Analyst', 88]],
      roadmap: [
        ['Week 1 — SQL depth', 'Window functions, CTEs and query tuning on a 1M-row dataset.'],
        ['Week 2 — Visual storytelling', 'Rebuild a dashboard in Tableau or Power BI around one decision.'],
        ['Week 3 — Statistics', 'A/B testing, confidence intervals and common pitfalls.'],
        ['Week 4 — Portfolio case', 'Publish a notebook that ends in a recommendation, not a chart.']
      ]
    },
    {
      role: 'Product Designer',
      keys: ['figma', 'ui design', 'ux', 'design system', 'design systems', 'prototype', 'accessibility', 'content', 'analytics'],
      paths: [['Product Designer', 93], ['UX Researcher', 85], ['Design Systems Lead', 79]],
      roadmap: [
        ['Week 1 — Case study structure', 'Rewrite one project into problem → process → outcome.'],
        ['Week 2 — Systems thinking', 'Document tokens, components and states for a small product.'],
        ['Week 3 — Usability testing', 'Run 5 moderated sessions and ship two fixes.'],
        ['Week 4 — Portfolio polish', 'Publish 3 case studies with measurable impact.']
      ]
    },
    {
      role: 'Backend Engineer',
      keys: ['node', 'express', 'python', 'java', 'docker', 'kubernetes', 'aws', 'postgres', 'mongodb', 'rest', 'graphql', 'sql'],
      paths: [['Backend Engineer', 92], ['DevOps Engineer', 84], ['Platform Engineer', 80]],
      roadmap: [
        ['Week 1 — System design basics', 'Design a URL shortener: schema, cache, rate limits.'],
        ['Week 2 — Containers', 'Dockerise a service and wire up docker-compose with a DB.'],
        ['Week 3 — Observability', 'Add structured logs, metrics and one alert that matters.'],
        ['Week 4 — Cloud deploy', 'Ship to AWS (ECS or Lambda) with CI on every push.']
      ]
    },
    {
      role: 'Product Manager',
      keys: ['product management', 'analytics', 'communication', 'leadership', 'agile', 'sql', 'marketing', 'seo'],
      paths: [['Associate Product Manager', 90], ['Growth PM', 86], ['Product Analyst', 83]],
      roadmap: [
        ['Week 1 — Discovery', 'Run 6 customer interviews and write one problem statement.'],
        ['Week 2 — Prioritisation', 'Score a backlog with RICE and defend the top three.'],
        ['Week 3 — Metrics', 'Define a north-star plus 3 input metrics for a product you use.'],
        ['Week 4 — Ship a spec', 'Publish a one-page PRD with edge cases and success criteria.']
      ]
    }
  ];

  const GENERIC_ROADMAP = [
    ['Week 1 — Sharpen your story', 'Rewrite your resume around outcomes and numbers.'],
    ['Week 2 — Close the top gap', 'Pick the single most requested skill in your target role and start.'],
    ['Week 3 — Build proof', 'Ship a small project that demonstrates that skill.'],
    ['Week 4 — Practise interviews', 'Run two mock interviews in Focus Mode and note three fixes.']
  ];

  function analyse(text, role) {
    const hay = (text + ' ' + (role || '')).toLowerCase();
    const tokens = hay.replace(/[^a-z0-9+#. ]/g, ' ').split(/\s+/).filter(Boolean);
    const found = {};
    Object.keys(SKILL_MAP).forEach((skill) => {
      if (hay.includes(skill)) {
        const appear = hay.split(skill).length - 1;
        found[skill] = Math.min(96, 46 + appear * 9 + (skill.length > 6 ? 6 : 0));
      }
    });

    const scored = PROFILES.map((p) => {
      const hit = p.keys.filter((k) => hay.includes(k)).length;
      const base = Math.round((hit / p.keys.length) * 100);
      const bonus = (role && p.role.toLowerCase().includes(role.toLowerCase())) ? 24 : 0;
      return { profile: p, score: Math.max(38, Math.min(97, base * 0.8 + 30 + bonus)) };
    }).sort((a, b) => b.score - a.score);

    const best = scored[0];
    const skills = Object.entries(found)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, val]) => [name.replace(/\b\w/g, (c) => c.toUpperCase()), val]);

    if (skills.length < 3) {
      ['Communication', 'Problem Solving', 'Ownership'].forEach((s, i) => skills.push([s, 62 - i * 5]));
    }

    return {
      role: best.profile.role,
      score: best.score,
      skills,
      paths: best.profile.paths,
      roadmap: best.profile.roadmap || GENERIC_ROADMAP,
      words: tokens.length
    };
  }

  const scanMessages = [
    'Parsing experience and projects',
    'Mapping skills to live role requirements',
    'Scoring best-fit career paths',
    'Building your 4-week starter roadmap'
  ];

  function animateScore(target) {
    const ring = $('#scoreRing');
    const val = $('#scoreVal');
    const dur = 1300;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(target * e);
      ring.style.setProperty('--p', v);
      val.textContent = v;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function renderResult(result) {
    $('#resultRole').textContent = result.role;
    $('#resultSummary').textContent =
      result.score >= 75
        ? 'Strong signal — you already match most requirements. Two focused weeks and you are interview-ready.'
        : 'Good foundation. Close the gaps below and your match score climbs fast.';

    const skillWrap = $('#skillBars');
    skillWrap.innerHTML = '';
    result.skills.forEach(([name, val], i) => {
      const row = document.createElement('div');
      row.className = 'skill';
      row.innerHTML =
        '<div class="skill-top"><span>' + name + '</span><b>' + val + '%</b></div>' +
        '<div class="skill-track"><i></i></div>';
      skillWrap.appendChild(row);
      const fill = row.querySelector('i');
      setTimeout(() => { fill.style.width = val + '%'; }, 120 + i * 110);
    });

    const pathWrap = $('#pathList');
    pathWrap.innerHTML = '';
    result.paths.forEach(([name, pct], i) => {
      const li = document.createElement('li');
      li.style.opacity = 0;
      li.style.transform = 'translateX(-12px)';
      li.style.transition = 'opacity .5s var(--ease) ' + (200 + i * 120) + 'ms, transform .5s var(--ease) ' + (200 + i * 120) + 'ms';
      li.innerHTML = '<span>' + name + '</span><b>' + pct + '% fit</b>';
      pathWrap.appendChild(li);
      requestAnimationFrame(() => { li.style.opacity = 1; li.style.transform = 'none'; });
    });

    const roadWrap = $('#roadmapList');
    roadWrap.innerHTML = '';
    result.roadmap.forEach(([title, desc], i) => {
      const li = document.createElement('li');
      li.style.opacity = 0;
      li.style.transform = 'translateY(10px)';
      li.style.transition = 'opacity .5s var(--ease) ' + (300 + i * 110) + 'ms, transform .5s var(--ease) ' + (300 + i * 110) + 'ms';
      li.innerHTML = '<b>' + title + '</b>' + desc;
      roadWrap.appendChild(li);
      requestAnimationFrame(() => { li.style.opacity = 1; li.style.transform = 'none'; });
    });

    goStep(3);
    setTimeout(() => animateScore(result.score), 260);
  }

  let busy = false;
  $('#analyzeBtn').addEventListener('click', () => {
    if (busy) return;
    const text = resumeInput.value.trim();
    const analyzeBtn = $('#analyzeBtn');
    if (text.length < 40) {
      resumeInput.focus();
      resumeInput.classList.add('is-invalid');
      resumeInput.setAttribute('aria-invalid', 'true');
      setTimeout(() => {
        resumeInput.classList.remove('is-invalid');
        resumeInput.removeAttribute('aria-invalid');
      }, 1800);
      return;
    }

    busy = true;
    analyzeBtn.disabled = true;
    goStep(2);
    const pctEl = $('#scanPct');
    const fill = $('#scanBarFill');
    const status = $('#scanStatus');
    let progress = 0;
    let msgIndex = 0;
    pctEl.textContent = '0%';

    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 11 + 4);
      pctEl.textContent = Math.round(progress) + '%';
      fill.style.width = progress + '%';
      const nextMsg = Math.min(scanMessages.length - 1, Math.floor(progress / 26));
      if (nextMsg !== msgIndex) {
        msgIndex = nextMsg;
        status.textContent = scanMessages[msgIndex];
      }
      if (progress >= 100) {
        clearInterval(timer);
        status.textContent = 'Report ready';
        setTimeout(() => {
          renderResult(analyse(text, targetRole.value.trim()));
          busy = false;
          analyzeBtn.disabled = false;
        }, 420);
      }
    }, 170);
  });

  $('#restartBtn').addEventListener('click', () => {
    goStep(1);
    showFileNote('');
    resumeInput.value = '';
    targetRole.value = '';
    fileName.textContent = 'Attach .txt';
    fileInput.value = '';
  });

  /* ---------------- footer year ---------------- */
  const yearEl = $('.footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
