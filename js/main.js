/* ============================================================
  main.js — all interactivity for the portfolio (vanilla JS)

  Structure:
    1. Project data (modal content, keyed by data-project id)
    2. Theme toggle (persisted to localStorage)
    3. Mobile menu toggle
    4. Scroll reveal (IntersectionObserver, once, reduced-motion aware)
    5. Project modal (open/close, overlay click, Escape, focus)
    6. Copy-email button (Clipboard API with fallback)
    7. Smooth "back to top"

  Everything runs inside DOMContentLoaded + one IIFE so nothing
  leaks into the global scope. Light theme is the DEFAULT; a tiny
  inline script in <head> applies a stored dark choice pre-paint.
============================================================ */

(function () {
  'use strict';

  /* ---------- 1. Project data ----------
     Card markup lives in index.html; the longer modal content
     lives here, keyed by each card's `data-project` attribute.
     To edit a project: change the card in index.html AND its
     entry below. */
  var PROJECTS = {
    'swarm-drone': {
      title: 'Swarm Drone',
      meta: 'NIRO Lab · 2025 – Present',
      status: 'ACTIVE',
      description:
        'A coordinated multi-drone system built at NIRO Lab for precision agriculture, fisheries management, and drone show applications. ' +
        'Using Pixhawk flight controllers, dual GPS modules, and ArduCopter firmware, each drone operates collaboratively on automated tasks such as field monitoring and resource distribution. ' +
        'A ground control station coordinates navigation, communication, and formation control over telemetry links — demonstrating how swarm coordination can minimize labor and boost sustainability in rural sectors.',
      tags: ['Pixhawk', 'ArduCopter', 'MAVLink', 'Raspberry Pi', 'GPS'],
      links: [], // team project — no public repo
      symbols: ['drone', 'telemetry', 'tower', 'pin', 'gear', 'chip']
    },
    'dash-by-plotly': {
      title: 'Dash-by-Plotly',
      meta: 'Personal · 2021',
      status: 'ARCHIVE',
      description:
        'Interactive data analytics dashboards built with Plotly Dash — exploring reactive components, callback-driven charts, and clean data storytelling in pure Python. ' +
        'Deployed live on Vercel.',
      tags: ['Python', 'Plotly Dash', 'Data Viz'],
      links: [
        { label: 'repo', url: 'https://github.com/Shafwan1999/Dash-by-Plotly' },
        { label: 'live demo', url: 'https://dash-by-plotly.coding-with-adam.vercel.app' }
      ],
      symbols: ['barchart', 'terminal', 'braces', 'atom', 'binary', 'plane']
    },
    'project-1-wiki': {
      title: 'Project-1 (Wiki)',
      meta: 'CS50W · 2021',
      status: 'ARCHIVE',
      description:
        'CS50 Web Programming Project 1 — a Wikipedia-like online encyclopedia. ' +
        'Entries are written in Markdown, stored and rendered via Django, with search, create/edit pages, and a random-entry feature.',
      tags: ['Python', 'Django', 'Markdown'],
      links: [
        { label: 'repo', url: 'https://github.com/Shafwan1999/Project-1' }
      ],
      symbols: ['book', 'braces', 'terminal', 'chip', 'cap', 'git']
    },
    'calc-node-js': {
      title: 'Calc_Node_js',
      meta: 'Personal · 2022',
      status: 'ARCHIVE',
      description:
        'A test implementation of a server using Node.js — exploring routing, request handling, and the fundamentals of backend JavaScript outside the browser.',
      tags: ['JavaScript', 'Node.js'],
      links: [
        { label: 'repo', url: 'https://github.com/Shafwan1999/Calc_Node_js' }
      ],
      symbols: ['terminal', 'braces', 'chip', 'gear', 'binary', 'git']
    },
    'uptime': {
      title: 'Uptime',
      meta: 'Personal · 2020',
      status: 'ARCHIVE',
      description:
        'A simple Python script for monitoring the status of one or more websites — periodic checks, status codes, and downtime awareness from the command line.',
      tags: ['Python', 'Automation'],
      links: [
        { label: 'repo', url: 'https://github.com/Shafwan1999/Uptime' }
      ],
      symbols: ['pulse', 'terminal', 'tower', 'gear', 'binary', 'chip']
    },
    'fitness-workshop': {
      title: 'Fitness-Workshop',
      meta: 'Personal · 2020',
      status: 'ARCHIVE',
      description:
        'A static HTML/CSS website for a fitness workshop — early exploration of layout, typography, and responsive page structure.',
      tags: ['HTML', 'CSS'],
      links: [
        { label: 'repo', url: 'https://github.com/Shafwan1999/Fitness-Workshop' }
      ],
      symbols: ['dumbbell', 'braces', 'terminal', 'pulse', 'plane', 'atom']
    },
    'project-0-search': {
      title: 'Project-0 (Search)',
      meta: 'CS50W · 2021',
      status: 'ARCHIVE',
      description:
        'CS50 Web Programming Project 0 — a front-end clone of Google Search, Google Image Search, and Google Advanced Search, wired to real Google query parameters.',
      tags: ['HTML', 'CSS'],
      links: [
        { label: 'repo', url: 'https://github.com/Shafwan1999/Project-0' }
      ],
      symbols: ['magnifier', 'braces', 'terminal', 'binary', 'git', 'atom']
    },
    'mypage': {
      title: 'MyPage',
      meta: 'CS50 · 2020',
      status: 'ARCHIVE',
      description:
        'CS50 Week 8 homepage project — a personal multi-page site in HTML, CSS, and JavaScript, the precursor to this portfolio.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      links: [
        { label: 'repo', url: 'https://github.com/Shafwan1999/MyPage' }
      ],
      symbols: ['plane', 'atom', 'braces', 'terminal', 'cap', 'binary']
    }
  };

  /* ---------- 1b. Drift symbol library + modal drift field ----------
     The About section's "signal drift" motif, reused as a background
     layer inside each project modal. SVG bodies below are copied 1:1
     from the About markup in index.html so the visual language is
     identical; four NEW symbols (barchart, magnifier, pulse, dumbbell)
     are drawn in the same stroke style, adapted from the project-card
     cover art. Each entry: { vb: viewBox, svg: inner markup } — or
     { text } for the binary "01", which is live mono text, not svg. */
  var SYMBOLS = {
    drone: { vb: '0 0 40 40', svg:
      '<line x1="11" y1="11" x2="29" y2="29"/><line x1="29" y1="11" x2="11" y2="29"/>' +
      '<circle cx="9" cy="9" r="6"/><circle cx="31" cy="9" r="6"/>' +
      '<circle cx="9" cy="31" r="6"/><circle cx="31" cy="31" r="6"/>' +
      '<rect x="16" y="16" width="8" height="8" rx="1"/>' },
    telemetry: { vb: '0 0 24 24', svg:
      '<circle cx="5" cy="19" r="1.2" fill="currentColor" stroke="none"/>' +
      '<path d="M5 14a5 5 0 0 1 5 5"/>' +
      '<path d="M5 9a10 10 0 0 1 10 10"/>' +
      '<path d="M5 4a15 15 0 0 1 15 15"/>' },
    terminal: { vb: '0 0 24 24', svg:
      '<path d="M5 7l5 5-5 5"/><line x1="12" y1="17" x2="19" y2="17"/>' },
    git: { vb: '0 0 24 24', svg:
      '<circle cx="7" cy="5" r="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="8" r="2"/>' +
      '<line x1="7" y1="7" x2="7" y2="17"/>' +
      '<path d="M15.2 9.3C13 13 10 14 7 16"/>' },
    braces: { vb: '0 0 24 24', svg:
      '<path d="M9 4C7.5 4 6.5 5 6.5 6.5v3c0 1.2-.8 2-2 2.5 1.2.5 2 1.3 2 2.5v3C6.5 19 7.5 20 9 20"/>' +
      '<path d="M15 4c1.5 0 2.5 1 2.5 2.5v3c0 1.2.8 2 2 2.5-1.2.5-2 1.3-2 2.5v3c0 1.5-1 2.5-2.5 2.5"/>' },
    chip: { vb: '0 0 24 24', svg:
      '<rect x="7" y="7" width="10" height="10" rx="1"/>' +
      '<rect x="10" y="10" width="4" height="4"/>' +
      '<line x1="10" y1="7" x2="10" y2="4"/><line x1="14" y1="7" x2="14" y2="4"/>' +
      '<line x1="10" y1="17" x2="10" y2="20"/><line x1="14" y1="17" x2="14" y2="20"/>' +
      '<line x1="7" y1="10" x2="4" y2="10"/><line x1="7" y1="14" x2="4" y2="14"/>' +
      '<line x1="17" y1="10" x2="20" y2="10"/><line x1="17" y1="14" x2="20" y2="14"/>' },
    gear: { vb: '0 0 24 24', svg:
      '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.5"/>' +
      '<line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/>' +
      '<line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/>' +
      '<line x1="5.6" y1="5.6" x2="7" y2="7"/><line x1="17" y1="17" x2="18.4" y2="18.4"/>' +
      '<line x1="18.4" y1="5.6" x2="17" y2="7"/><line x1="7" y1="17" x2="5.6" y2="18.4"/>' },
    atom: { vb: '0 0 24 24', svg:
      '<circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>' +
      '<ellipse cx="12" cy="12" rx="10" ry="4"/>' +
      '<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>' +
      '<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>' },
    tower: { vb: '0 0 24 24', svg:
      '<line x1="12" y1="21" x2="12" y2="9"/><line x1="8" y1="21" x2="16" y2="21"/>' +
      '<circle cx="12" cy="7" r="1.2" fill="currentColor" stroke="none"/>' +
      '<path d="M8.8 4.8a4.5 4.5 0 0 1 6.4 0"/>' +
      '<path d="M6.4 2.4a8 8 0 0 1 11.2 0"/>' },
    plane: { vb: '0 0 24 24', svg:
      '<path d="M21 3L3 10l7 3 11-10z"/><path d="M10 13l2 8 4-7"/>' },
    binary: { text: '01' },
    pin: { vb: '0 0 24 24', svg:
      '<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z"/>' +
      '<circle cx="12" cy="11" r="2"/>' },
    cap: { vb: '0 0 24 24', svg:
      '<path d="M12 5L2 9l10 4 10-4-10-4z"/>' +
      '<path d="M6 11v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4"/>' +
      '<line x1="22" y1="9" x2="22" y2="14"/>' },
    book: { vb: '0 0 24 24', svg:
      '<path d="M12 6c-2-1.5-5.5-1.7-8-.8V18c2.5-.9 6-.7 8 .8 2-1.5 5.5-1.7 8-.8V5.2c-2.5-.9-6-.7-8 .8z"/>' +
      '<line x1="12" y1="6" x2="12" y2="18.8"/>' },
    /* --- new symbols, same stroke style (adapted from card covers) --- */
    barchart: { vb: '0 0 24 24', svg:
      '<line x1="4" y1="20" x2="20" y2="20"/><line x1="4" y1="20" x2="4" y2="4"/>' +
      '<rect x="7" y="13" width="3" height="7"/>' +
      '<rect x="11.5" y="9" width="3" height="11"/>' +
      '<rect x="16" y="15" width="3" height="5"/>' },
    magnifier: { vb: '0 0 24 24', svg:
      '<circle cx="10" cy="10" r="6"/><line x1="14.2" y1="14.2" x2="20" y2="20"/>' },
    pulse: { vb: '0 0 24 24', svg:
      '<path d="M3 12h4l2-5 3.5 11 2.5-8 1.5 2h4.5"/>' },
    dumbbell: { vb: '0 0 24 24', svg:
      '<line x1="4" y1="12" x2="20" y2="12"/>' +
      '<rect x="2.5" y="9" width="2.5" height="6" rx="1"/>' +
      '<rect x="19" y="9" width="2.5" height="6" rx="1"/>' +
      '<rect x="6" y="7" width="2.5" height="10" rx="1"/>' +
      '<rect x="15.5" y="7" width="2.5" height="10" rx="1"/>' }
  };

  /* Per-instance style pools, cycled by symbol index so every modal
     gets a deterministic, varied spread (no Math.random flicker on
     re-open). Ranges per the modal spec: size 16–40px, opacity
     .05–.11, duration 12–22s, negative delays for mid-flight start. */
  var DRIFT_LEFTS =     [4, 18, 33, 48, 63, 78, 90, 10, 55];
  var DRIFT_SIZES =     [34, 22, 28, 18, 38, 24, 30, 20, 26];
  var DRIFT_OPACITIES = [.10, .07, .09, .05, .11, .06, .08, .05, .07];
  var DRIFT_DURATIONS = [18, 14, 20, 12, 16, 22, 13, 19, 15];
  var DRIFT_SWAYS =     [12, 8, 14, 10, 16, 9, 13, 11, 15];

  /* build one symbol element (svg or mono-text span) with inline
     left/size/opacity/duration/delay/sway, exactly like the About
     markup. Every 3rd symbol (i % 3 === 1) is accent-teal — with
     6–9 symbols per project that's always 2–3 accents, rest ink. */
  function buildDriftSymbol(key, i) {
    var sym = SYMBOLS[key];
    if (!sym) return null;

    var duration = DRIFT_DURATIONS[i % DRIFT_DURATIONS.length];
    var delay = -(((i * 3.1 + 2) % duration)).toFixed(1); // negative → starts mid-flight
    var style =
      'left: ' + DRIFT_LEFTS[i % DRIFT_LEFTS.length] + '%; ' +
      'opacity: ' + DRIFT_OPACITIES[i % DRIFT_OPACITIES.length] + '; ' +
      '--dx: ' + DRIFT_SWAYS[i % DRIFT_SWAYS.length] + 'px; ' +
      '--dir: ' + (i % 2 ? -1 : 1) + '; ' +
      'animation-duration: ' + duration + 's; ' +
      'animation-delay: ' + delay + 's;' +
      (i % 3 === 1 ? ' color: var(--accent);' : '');

    if (sym.text) {
      var span = document.createElement('span');
      span.className = 'drift-symbol drift-text';
      span.setAttribute('style', 'font-size: ' + DRIFT_SIZES[i % DRIFT_SIZES.length] + 'px; ' + style);
      span.textContent = sym.text;
      return span;
    }

    // parse the svg string in HTML context, then lift the node out
    var holder = document.createElement('div');
    holder.innerHTML =
      '<svg class="drift-symbol" viewBox="' + sym.vb + '" style="width: ' +
      DRIFT_SIZES[i % DRIFT_SIZES.length] + 'px; ' + style + '">' + sym.svg + '</svg>';
    return holder.firstChild;
  }

  /* the modal field: same classes as About (.drift-field → keyframes,
     mask, dark-dim, reduced-motion rules all reuse) + a modal modifier */
  function buildDriftField(symbolKeys) {
    var field = document.createElement('div');
    field.className = 'drift-field drift-field-modal';
    field.setAttribute('aria-hidden', 'true');
    (symbolKeys || []).forEach(function (key, i) {
      var el = buildDriftSymbol(key, i);
      if (el) field.appendChild(el);
    });
    return field;
  }

  /* small helper: shorthand querySelector */
  function $(selector) { return document.querySelector(selector); }
  function $all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 2. Theme toggle ----------
       Light is default. Clicking flips the `dark` class on <html>
       and persists the choice to localStorage. There are two toggle
       buttons (desktop + mobile); both stay in sync. */
    var themeButtons = [$('#theme-toggle'), $('#theme-toggle-mobile')].filter(Boolean);

    function currentTheme() {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }

    function renderThemeButtons() {
      var theme = currentTheme();
      themeButtons.forEach(function (btn) {
        // label shows the CURRENT theme; aria-pressed reflects dark state
        btn.textContent = '[ ' + theme + ' ]';
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      });
    }

    function toggleTheme() {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      renderThemeButtons();
    }

    themeButtons.forEach(function (btn) { btn.addEventListener('click', toggleTheme); });
    renderThemeButtons();

    /* ---------- 3. Mobile menu toggle ---------- */
    var menuToggle = $('#menu-toggle');
    var mobileMenu = $('#mobile-menu');

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', function () {
        var open = mobileMenu.classList.toggle('hidden') === false;
        menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', open ? 'close menu' : 'open menu');
        menuToggle.textContent = open ? '[ close ]' : '[ menu ]';
      });

      // close the menu after tapping any link
      $all('.mobile-nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.add('hidden');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'open menu');
          menuToggle.textContent = '[ menu ]';
        });
      });
    }

    /* ---------- 4. Scroll reveal ----------
       Sections start hidden (CSS: .reveal) and fade/slide in once
       when they enter the viewport. Skipped entirely if the user
       prefers reduced motion or the browser lacks the observer. */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealEls = $all('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // reveal once, then stop watching
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { observer.observe(el); });
    }

    /* ---------- 5. Project modal ----------
       One shared overlay (#project-modal) filled from PROJECTS.
       Opens on card click / Enter / Space; closes via ✕ button,
       overlay click, or Escape. Focus is trapped-ish: moved into
       the modal on open and returned to the card on close. */
    var modal = $('#project-modal');
    var modalTitle = $('#modal-title');
    var modalMeta = $('#modal-meta');
    var modalDescription = $('#modal-description');
    var modalTags = $('#modal-tags');
    var modalLinks = $('#modal-links');
    var modalClose = $('#modal-close');
    var modalPanel = modal ? modal.querySelector('.modal-panel') : null;
    var lastFocusedCard = null; // where focus returns after close

    function openModal(projectId, cardEl) {
      var project = PROJECTS[projectId];
      if (!project || !modal) return;

      lastFocusedCard = cardEl || null;

      // drift field: rebuilt fresh on every open (no duplicates) and
      // inserted as the panel's FIRST child so it layers behind the
      // .modal-content wrapper (z-index 0 vs 1, both positioned)
      removeModalDriftField();
      if (modalPanel) {
        modalPanel.insertBefore(buildDriftField(project.symbols), modalPanel.firstChild);
      }

      modalTitle.textContent = project.title;
      modalMeta.textContent = project.meta + ' · ' + project.status;
      modalDescription.textContent = project.description;

      // rebuild tag chips
      modalTags.innerHTML = '';
      project.tags.forEach(function (tag) {
        var li = document.createElement('li');
        li.className = 'tech-tag';
        li.textContent = tag;
        modalTags.appendChild(li);
      });

      // rebuild links (or a note for private/team projects)
      modalLinks.innerHTML = '';
      if (project.links.length) {
        project.links.forEach(function (link) {
          var a = document.createElement('a');
          a.className = 'link-slide';
          a.href = link.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = link.label + ' ↗';
          modalLinks.appendChild(a);
        });
      } else {
        var span = document.createElement('span');
        span.className = 'text-faint text-xs';
        span.textContent = 'team project @ NIRO Lab';
        modalLinks.appendChild(span);
      }

      modal.hidden = false;
      document.body.classList.add('modal-open'); // stop background scroll
      modalClose.focus(); // move focus inside the dialog
    }

    /* drop the injected drift field (idempotent — safe to call when
     the modal was never opened or the field is already gone) */
    function removeModalDriftField() {
      if (!modalPanel) return;
      var field = modalPanel.querySelector('.drift-field-modal');
      if (field) field.parentNode.removeChild(field);
    }

    function closeModal() {
      if (!modal || modal.hidden) return;
      removeModalDriftField(); // field is rebuilt on next open
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      if (lastFocusedCard) lastFocusedCard.focus(); // return focus to the card
    }

    // wire up every project card (mouse + keyboard)
    $all('.project-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openModal(card.getAttribute('data-project'), card);
      });
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault(); // stop Space from scrolling
          openModal(card.getAttribute('data-project'), card);
        }
      });
    });

    if (modal) {
      modalClose.addEventListener('click', closeModal);

      // click on the dimmed overlay (not the panel) closes
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
      });

      // Escape closes from anywhere
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeModal();
      });
    }

    /* ---------- 6. Copy-email button ----------
       Uses the Clipboard API with a textarea fallback, then shows
       "[ copied! ]" for ~1.5s before reverting. */
    var copyBtn = $('#copy-email');
    var EMAIL = 'shafwan.work1@gmail.com';

    if (copyBtn) {
      var copyTimer = null;

      copyBtn.addEventListener('click', function () {
        function showCopied() {
          copyBtn.textContent = '[ copied! ]';
          copyBtn.setAttribute('aria-label', 'email address copied');
          clearTimeout(copyTimer);
          copyTimer = setTimeout(function () {
            copyBtn.textContent = '[ copy ]';
            copyBtn.setAttribute('aria-label', 'copy email address to clipboard');
          }, 1500);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(EMAIL).then(showCopied, function () {
            fallbackCopy(showCopied);
          });
        } else {
          fallbackCopy(showCopied);
        }
      });

      // fallback for older browsers / non-secure contexts
      function fallbackCopy(done) {
        var ta = document.createElement('textarea');
        ta.value = EMAIL;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* best effort */ }
        document.body.removeChild(ta);
        done();
      }
    }

    /* ---------- 7. Smooth back-to-top ----------
       CSS `scroll-behavior: smooth` already handles the anchor jump;
       this adds reduced-motion-aware behavior for the footer link. */
    $all('a[href="#top"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        var wordmark = document.querySelector('.wordmark');
        if (wordmark) wordmark.focus({ preventScroll: true });
      });
    });

  });
})();
