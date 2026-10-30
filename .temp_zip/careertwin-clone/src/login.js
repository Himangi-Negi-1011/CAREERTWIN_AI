/* ============================================================
   CareerTwin — login / sign-up page behaviour
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
  root.setAttribute('data-theme', store.get('ct-theme') || 'dark');
  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set('ct-theme', next);
    window.dispatchEvent(new Event('careertwin:theme'));
  });
  window.dispatchEvent(new Event('careertwin:theme'));

  /* ---------------- floating cards parallax ---------------- */
  const floats = $$('[data-float]');
  if (floats.length && !reduce && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      floats.forEach((el, i) => {
        el.style.translate = '0 ' + (y * (i % 2 === 0 ? 0.05 : -0.035)) + 'px';
      });
    }, { passive: true });
  }

  /* ---------------- "say hi" robot hint ---------------- */
  const hint = $('#robotHint');
  const robotCanvas = $('#loginRobot');
  if (hint && robotCanvas) {
    const dismiss = () => {
      hint.classList.add('is-gone');
      setTimeout(() => hint.remove(), 420);
    };
    hint.addEventListener('click', () => {
      robotCanvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      dismiss();
    });
    robotCanvas.addEventListener('pointerdown', dismiss, { once: true });
    setTimeout(dismiss, 14000);
  }

  /* ---------------- mode switch: login <-> signup ---------------- */
  let mode = 'login';
  const copy = {
    login: {
      badge: 'Log in',
      title: 'Welcome back',
      sub: 'Log in to continue your career plan.',
      submit: 'Log in',
      switchText: 'New to CareerTwin?',
      switchBtn: 'Create an account',
      pwAutocomplete: 'current-password'
    },
    signup: {
      badge: 'Create account',
      title: 'Start your career twin',
      sub: 'Your results in seconds — no card, nothing to install.',
      submit: 'Create my account',
      switchText: 'Already have an account?',
      switchBtn: 'Log in instead',
      pwAutocomplete: 'new-password'
    }
  };

  function applyMode(next) {
    mode = next;
    const c = copy[mode];
    $('#authBadge').textContent = c.badge;
    $('#authTitle').textContent = c.title;
    $('#authSub').textContent = c.sub;
    $('#submitBtn .btn-label').textContent = c.submit;
    $('#switchText').textContent = c.switchText;
    $('#switchMode').textContent = c.switchBtn;
    $('#password').setAttribute('autocomplete', c.pwAutocomplete);
    document.title = (mode === 'login' ? 'Log in' : 'Create account') + ' — CareerTwin';
  }

  $('#switchMode').addEventListener('click', () => {
    applyMode(mode === 'login' ? 'signup' : 'login');
    $('#email').focus();
  });

  /* ---------------- password visibility ---------------- */
  const pw = $('#password');
  const pwToggle = $('#pwToggle');
  pwToggle.addEventListener('click', () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    pwToggle.setAttribute('aria-pressed', String(show));
    pwToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    pw.focus({ preventScroll: true });
  });

  /* ---------------- validation ---------------- */
  const form = $('#authForm');
  const email = $('#email');
  const submitBtn = $('#submitBtn');
  const status = $('#authStatus');

  function setError(input, message) {
    const field = input.closest('.field');
    const err = field.querySelector('.field-error');
    field.classList.toggle('is-invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message || '';
  }

  function validateEmail() {
    const value = email.value.trim();
    if (!value) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) return 'That email doesn\u2019t look right.';
    return '';
  }

  function validatePassword() {
    const value = pw.value;
    if (!value) return 'Enter your password.';
    if (value.length < 6) return 'Use at least 6 characters.';
    return '';
  }

  email.addEventListener('blur', () => { if (email.value.trim()) setError(email, validateEmail()); });
  pw.addEventListener('blur', () => { if (pw.value) setError(pw, validatePassword()); });
  [email, pw].forEach((input) => {
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('is-invalid')) {
        setError(input, input === email ? validateEmail() : validatePassword());
      }
    });
  });

  function showStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle('is-error', !!isError);
    status.classList.toggle('is-visible', !!message);
  }

  /* ---------------- submit (demo) ---------------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailError = validateEmail();
    const passwordError = validatePassword();
    setError(email, emailError);
    setError(pw, passwordError);

    if (emailError || passwordError) {
      showStatus('Check the highlighted fields and try again.', true);
      (emailError ? email : pw).focus();
      return;
    }

    showStatus('');
    submitBtn.classList.add('is-loading');
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.disabled = true;

    const label = $('#submitBtn .btn-label');
    const previous = label.textContent;
    label.textContent = mode === 'login' ? 'Logging in…' : 'Creating account…';

    setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      submitBtn.removeAttribute('aria-busy');
      submitBtn.disabled = false;
      label.textContent = previous;

      // surface the success panel
      const card = $('.auth-card');
      card.classList.add('is-done');

      const raw = email.value.split('@')[0].replace(/[._-]/g, ' ').replace(/[0-9]/g, ' ').trim();
      const name = raw
        ? raw.split(' ').filter(Boolean).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ')
        : 'there';
      $('.auth-success h3').textContent = mode === 'login' ? 'You\u2019re in, ' + name + '!' : 'Welcome, ' + name + '!';
      // remember who logged in for the dashboard greeting (best effort only)
      store.set('ct-name', name === 'there' ? 'Aarav Sharma' : name);
      store.set('ct-email', email.value.trim());
      $('.auth-success p').textContent =
        'This is a demo build, so there\u2019s no session to restore — but everything on the site already works without logging in.';
    }, 1150);
  });

  $('#successContinue').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  /* ---------------- forgot password ---------------- */
  $('#forgotBtn').addEventListener('click', () => {
    const value = email.value.trim();
    if (!value || validateEmail()) {
      showStatus('Add your email above first, then tap “Forgot password?” again.', true);
      email.focus();
      return;
    }
    showStatus('Demo build: password reset isn\u2019t wired up, but the button works as designed.', false);
  });

  /* ---------------- oauth (demo notice) ---------------- */
  $('#googleBtn').addEventListener('click', () => {
    showStatus('Google sign-in is stubbed out in this demo — use the form above.', true);
  });

  /* ---------------- reveal on load ---------------- */
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
})();
