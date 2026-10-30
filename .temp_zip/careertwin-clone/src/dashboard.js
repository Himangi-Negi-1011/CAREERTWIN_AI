/* ============================================================
   CareerTwin — dashboard workspace
   Router + shared state. Everything is stored in localStorage;
   nothing is uploaded and the coach's replies are generated
   locally from that same state.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the sidebar is wired further down, but the router may call closeSide()
     before that — so it is declared here and guarded */
  let side = null, scrim = null, openBtn = null;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
    json(k, fallback) {
      try { const raw = store.get(k); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
    },
    setJson(k, v) { store.set(k, JSON.stringify(v)); }
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

  /* ---------------- state ---------------- */
  const SKILLS = [
    { name: 'Figma', level: 90 },
    { name: 'Prototyping', level: 84 },
    { name: 'Written communication', level: 74 },
    { name: 'Design systems', level: 62 },
    { name: 'User research', level: 58 },
    { name: 'Data literacy', level: 41 }
  ];
  const TARGET_LEVEL = 75;

  const DEFAULT_PROFILE = {
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    target: 'Product Designer',
    hours: 5
  };

  const DEFAULT_LESSONS = [
    { id: 'l1', skill: 'Design systems', title: 'Variables and tokens, properly', time: '18 min', note: 'The lesson the Figma variables step in week 2 refers to.' },
    { id: 'l2', skill: 'User research', title: 'Run one interview without a script', time: '22 min', note: 'A method for a single 20-minute session with a real user.' },
    { id: 'l3', skill: 'Data literacy', title: 'Read a funnel without lying to yourself', time: '15 min', note: 'The metric vocabulary interviewers expect you to have.' },
    { id: 'l4', skill: 'Prototyping', title: 'Prototype the decision, not the screens', time: '20 min', note: 'Why a 3-screen flow beats a 30-screen file.' },
    { id: 'l5', skill: 'Written communication', title: 'Write a teardown people finish', time: '12 min', note: 'Structure for the teardown step in week 2.' },
    { id: 'l6', skill: 'Figma', title: 'Component states that survive handoff', time: '16 min', note: 'Hover, focus, error, loading — the four states that get missed.' }
  ];

  const profile = Object.assign({}, DEFAULT_PROFILE, store.json('ct-profile', {}));
  if (!profile.name) profile.name = DEFAULT_PROFILE.name;
  if (!profile.email) profile.email = DEFAULT_PROFILE.email;
  if (!profile.hours) profile.hours = DEFAULT_PROFILE.hours;

  const evidence = Object.assign({}, store.json('ct-evidence', {}));
  const lessonsDone = Object.assign({}, store.json('ct-lessons', {}));
  const tests = store.json('ct-tests', []);
  const docs = store.json('ct-docs', []);

  const saveProfile = () => store.setJson('ct-profile', profile);
  const saveEvidence = () => store.setJson('ct-evidence', evidence);
  const saveLessons = () => store.setJson('ct-lessons', lessonsDone);
  const saveTests = () => store.setJson('ct-tests', tests);
  const saveDocs = () => store.setJson('ct-docs', docs);

  const first = () => (profile.name || 'there').split(' ')[0];
  const initials = () => (profile.name || 'Aarav Sharma')
    .split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'AS';

  const evidenceCount = () => SKILLS.filter((s) => evidence[s.name]).length;
  const coverage = () => Math.round((evidenceCount() / SKILLS.length) * 100);
  const lessonsCount = () => DEFAULT_LESSONS.filter((l) => lessonsDone[l.id]).length;
  const gapSkills = () => SKILLS.filter((s) => s.level < TARGET_LEVEL);
  const prioritySkill = () => gapSkills().slice().sort((a, b) => a.level - b.level)[0] || null;

  const TOTAL_STEPS = 12;
  const steps = $$('[data-step]');
  const doneSteps = () => steps.filter((b) => b.checked).length;

  /* ---------------- identity bits ---------------- */
  function paintIdentity() {
    $$('#sideName').forEach((el) => { el.textContent = profile.name; });
    $('#sideEmail').textContent = profile.email;
    $$('#sideAvatar, #topAvatar').forEach((el) => { el.textContent = initials(); });
    $('#topName').textContent = first();
    $('#welcomeName').textContent = profile.name;
    $('#welcomeHours').textContent = profile.hours + ' learning hour' + (Number(profile.hours) === 1 ? '' : 's') + '/week';
    const bot = $('#chat .chat-msg--bot p');
    if (bot) bot.textContent = 'Hi ' + first() + '. Ask me what to do next, why a skill is flagged, or how to prepare for the weekly test.';
  }

  /* ---------------- profile completion ---------------- */
  function completionItems() {
    return [
      { label: 'Name', done: !!profile.name },
      { label: 'Email', done: !!profile.email },
      { label: 'Target role', done: !!profile.target },
      { label: 'Learning hours', done: !!profile.hours },
      { label: 'Recorded evidence', done: evidenceCount() > 0 },
      { label: 'First check-in', done: tests.length > 0 }
    ];
  }
  function paintCompletion() {
    const items = completionItems();
    const done = items.filter((i) => i.done).length;
    const pct = Math.round((done / items.length) * 100);
    $('#completionPct').textContent = pct + '%';
    $('#completionBar').style.setProperty('--p', pct);
    const list = $('#completionList');
    list.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item.label;
      li.className = item.done ? 'is-done' : '';
      list.appendChild(li);
    });
    const row = $('#progProfile');
    if (row) row.textContent = pct + '%';
  }

  /* ---------------- dashboard numbers ---------------- */
  function paintNumbers() {
    const done = doneSteps();
    const pct = Math.round((done / TOTAL_STEPS) * 100);
    $('#navRoadmap').textContent = done + '/' + TOTAL_STEPS;
    $('#roadmapCount').textContent = done + ' of ' + TOTAL_STEPS + ' done';
    $('#navGaps').textContent = String(gapSkills().length);
    $('#navDocs').textContent = String(docs.length);
    $('#miniRoadmap').textContent = done + '/' + TOTAL_STEPS;
    $('#miniEvidence').textContent = evidenceCount() + '/' + SKILLS.length;
    $('#miniLessons').textContent = lessonsCount() + '/' + DEFAULT_LESSONS.length;
    $('#miniTests').textContent = String(tests.length);
    $('#streakMeta').textContent = tests.length + (tests.length === 1 ? ' check-in' : ' check-ins');
    $('#skillsMeta').textContent = evidenceCount() + ' with evidence';
    $('#coverageBig').textContent = coverage() + '%';
    $('#studioMeta').textContent = lessonsCount() + ' of ' + DEFAULT_LESSONS.length + ' reviewed';
    $('#progMeta').textContent = tests.length + (tests.length === 1 ? ' test taken' : ' tests taken');
    $('#progRoadmap').textContent = done + '/' + TOTAL_STEPS;
    $('#progEvidence').textContent = evidenceCount() + '/' + SKILLS.length;
    $('#progLessons').textContent = lessonsCount() + '/' + DEFAULT_LESSONS.length;

    // career target card
    $('#targetTitle').textContent = profile.target || 'No target chosen';
    $('#targetMeta').textContent = tests.length
      ? 'Last updated ' + new Date(tests[tests.length - 1].at).toLocaleString() + '.'
      : 'Secure Twin updated when you last saved your profile.';
    const cov = evidenceCount() ? coverage() + '%' : 'Not available';
    $('#coverageVal').textContent = cov;
    const gap = prioritySkill();
    $('#gapVal').textContent = evidenceCount() ? (gap ? gap.name : 'None recorded') : 'None recorded';

    // skills side panel
    if (gap) {
      $('#prioritySkill').textContent = gap.name;
      $('#priorityBar').style.setProperty('--p', gap.level);
      $('#priorityCopy').textContent = 'Lowest recorded level in the framework (' + gap.level +
        ' vs ' + TARGET_LEVEL + ' expected). One real project with numbers moves it fastest.';
    } else {
      $('#prioritySkill').textContent = 'None';
      $('#priorityCopy').textContent = 'Every tracked skill is at or above the expected level.';
      $('#priorityBar').style.setProperty('--p', 0);
    }

    paintNextAction();
    paintRoles();
    paintStatus();
    paintCompletion();
  }

  function paintStatus() {
    // honest status: it reflects what is actually stored, not a fake "secured" claim
    const lines = [];
    if (!profile.target) lines.push('no target role chosen yet');
    if (!evidenceCount()) lines.push('no evidence recorded yet');
    let text;
    if (lines.length) text = 'Career Twin loaded — ' + lines.join(' and ') + '.';
    else text = 'Career Twin loaded — ' + evidenceCount() + (evidenceCount() === 1 ? ' skill' : ' skills') +
      ' backed by evidence, ' + (TOTAL_STEPS - doneSteps()) + ' roadmap steps left.';
    $('#statusText').textContent = text;
  }

  function paintNextAction() {
    const title = $('#nextActionTitle');
    const copy = $('#nextActionCopy');
    const btn = $('#nextActionBtn');
    let view = 'settings';
    let label = 'Choose a target role';

    if (!profile.target) {
      title.textContent = 'Choose a target role';
      copy.textContent = 'This recommendation uses only the profile and activity saved for your workspace. It updates as you review evidence and complete tasks.';
      view = 'settings'; label = 'Choose a target role';
    } else if (!evidenceCount()) {
      title.textContent = 'Record your first piece of evidence';
      copy.textContent = 'Your target is set to ' + profile.target + '. Open Skill Gap Analysis and mark the skills you can actually show — coverage and the priority gap both start moving from there.';
      view = 'skills'; label = 'Record evidence';
    } else if (doneSteps() < TOTAL_STEPS) {
      const nextBox = steps.find((b) => !b.checked);
      const text = nextBox ? nextBox.parentElement.querySelector('.road-text').textContent.trim() : 'the next roadmap step';
      title.textContent = 'Next roadmap step';
      copy.textContent = '“' + text + '”. ' + (TOTAL_STEPS - doneSteps()) + ' steps left against ' + profile.target + '. Mark it done when it is actually finished, not when you start it.';
      view = 'roadmap'; label = 'Open the roadmap';
    } else if (!tests.length) {
      title.textContent = 'Take your first weekly check-in';
      copy.textContent = 'The roadmap is clear. Three questions about what you shipped this week — it takes a minute and sets your baseline.';
      view = 'progress'; label = 'Start weekly test';
    } else {
      title.textContent = 'Keep the rhythm';
      copy.textContent = 'Everything on the roadmap is done and your check-ins are logged. Repeat the loop: new evidence, a new step, one check-in a week.';
      view = 'progress'; label = 'Open progress';
    }
    btn.textContent = label;
    btn.setAttribute('href', '#' + view);
    btn.setAttribute('data-view-link', view);
  }

  function paintRoles() {
    $$('#rolesList [data-role]').forEach((li) => {
      const isTarget = li.getAttribute('data-role') === profile.target;
      li.classList.toggle('is-target', isTarget);
      const btn = $('.role-set', li);
      if (btn) btn.textContent = isTarget ? 'Current target' : 'Set target';
    });
  }

  /* ---------------- roadmap ---------------- */
  const ROADMAP_KEY = 'ct-roadmap';
  function loadRoadmap() {
    try {
      const parsed = JSON.parse(store.get(ROADMAP_KEY) || 'null');
      if (Array.isArray(parsed) && parsed.length === steps.length) {
        steps.forEach((b, i) => { b.checked = !!parsed[i]; });
      }
    } catch (e) {}
  }
  function syncWeeks() {
    $$('.week').forEach((week) => {
      const boxes = $$('[data-step]', week);
      const done = boxes.filter((b) => b.checked).length;
      const prog = $('.week-progress', week);
      if (prog) prog.textContent = done + '/' + boxes.length;
      week.classList.toggle('is-done', done === boxes.length && boxes.length > 0);
    });
  }
  loadRoadmap();
  syncWeeks();
  steps.forEach((box) => {
    box.addEventListener('change', () => {
      syncWeeks();
      store.setJson(ROADMAP_KEY, steps.map((b) => b.checked));
      paintNumbers();
    });
  });
  $('#resetRoadmap').addEventListener('click', () => {
    steps.forEach((b, i) => { b.checked = i < 7; });
    store.setJson(ROADMAP_KEY, steps.map((b) => b.checked));
    syncWeeks();
    paintNumbers();
  });

  /* ---------------- skills view ---------------- */
  function paintSkills() {
    const list = $('#skillList');
    list.innerHTML = '';
    SKILLS.forEach((skill) => {
      const has = !!evidence[skill.name];
      const gap = skill.level < TARGET_LEVEL;
      const li = document.createElement('li');
      li.className = 'skill-item';
      li.innerHTML =
        '<div class="skill-row"><span class="skill-name"></span><span class="skill-lvl">' + skill.level + '</span></div>' +
        '<div class="skill-cols">' +
          '<div class="bar' + (gap ? ' is-gap' : '') + '" style="--p:' + skill.level + '"><i></i></div>' +
          '<button type="button" class="evidence-btn' + (has ? ' is-on' : '') + '">' + (has ? '✓ Evidence' : '+ Evidence') + '</button>' +
        '</div>' +
        '<p class="skill-note' + (gap ? ' is-gap' : '') + '"></p>';
      $('.skill-name', li).textContent = skill.name;
      $('.skill-note', li).textContent = gap
        ? (has ? 'Below the ' + TARGET_LEVEL + ' expected bar — evidence recorded, keep building it.' : 'Below the ' + TARGET_LEVEL + ' expected bar — no evidence yet.')
        : 'At or above the expected bar.';
      $('.evidence-btn', li).addEventListener('click', () => {
        if (evidence[skill.name]) delete evidence[skill.name];
        else evidence[skill.name] = new Date().toISOString();
        saveEvidence();
        // update this row in place (no re-render, so focus and clicks survive)
        const on = !!evidence[skill.name];
        const btn = $('.evidence-btn', li);
        btn.classList.toggle('is-on', on);
        btn.textContent = on ? '✓ Evidence' : '+ Evidence';
        const note = $('.skill-note', li);
        note.textContent = gap
          ? (on ? 'Below the ' + TARGET_LEVEL + ' expected bar — evidence recorded, keep building it.' : 'Below the ' + TARGET_LEVEL + ' expected bar — no evidence yet.')
          : 'At or above the expected bar.';
        paintNumbers();
      });
      list.appendChild(li);
    });
  }

  /* ---------------- lessons ---------------- */
  function paintLessons() {
    const grid = $('#lessonGrid');
    grid.innerHTML = '';
    DEFAULT_LESSONS.forEach((lesson) => {
      const done = !!lessonsDone[lesson.id];
      const card = document.createElement('article');
      card.className = 'lesson' + (done ? ' is-done' : '');
      card.innerHTML =
        '<div class="lesson-top"><span class="lesson-skill"></span><span class="lesson-time"></span></div>' +
        '<h3></h3><p></p>' +
        '<button class="lesson-btn" type="button">' + (done ? '✓ Reviewed' : 'Mark reviewed') + '</button>';
      $('.lesson-skill', card).textContent = lesson.skill;
      $('.lesson-time', card).textContent = lesson.time;
      $('h3', card).textContent = lesson.title;
      $('p', card).textContent = lesson.note;
      $('.lesson-btn', card).addEventListener('click', () => {
        if (lessonsDone[lesson.id]) delete lessonsDone[lesson.id];
        else lessonsDone[lesson.id] = new Date().toISOString();
        saveLessons();
        paintLessons();
        paintNumbers();
      });
      grid.appendChild(card);
    });
  }

  /* ---------------- documents ---------------- */
  function paintDocs() {
    const list = $('#docList');
    list.innerHTML = '';
    docs.slice().reverse().forEach((doc) => {
      const li = document.createElement('li');
      li.innerHTML =
        '<span class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M19 8v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7z"/></svg></span>' +
        '<span class="doc-name"><strong></strong><em></em></span>' +
        '<span class="doc-date"></span>' +
        '<button class="doc-del" type="button" aria-label="Remove document"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>';
      $('.doc-name strong', li).textContent = doc.name;
      $('.doc-name em', li).textContent = doc.size + ' · ' + doc.type;
      $('.doc-date', li).textContent = new Date(doc.at).toLocaleDateString();
      $('.doc-del', li).addEventListener('click', () => {
        const idx = docs.findIndex((d) => d.at === doc.at && d.name === doc.name);
        if (idx > -1) docs.splice(idx, 1);
        saveDocs();
        paintDocs();
        paintNumbers();
      });
      list.appendChild(li);
    });
    $('#docsMeta').textContent = docs.length + (docs.length === 1 ? ' file' : ' files');
    $('#docsEmpty').hidden = docs.length > 0;
  }

  $('#docInput').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const kb = Math.max(1, Math.round(file.size / 1024));
    docs.push({
      name: file.name,
      size: kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB',
      type: (file.name.split('.').pop() || 'file').toUpperCase(),
      at: Date.now()
    });
    saveDocs();
    paintDocs();
    paintNumbers();
    e.target.value = '';
  });

  /* ---------------- tests ---------------- */
  function paintTests() {
    const history = $('#testHistory');
    history.innerHTML = '';
    tests.slice().reverse().forEach((t) => {
      const li = document.createElement('li');
      li.innerHTML = '<span></span><em></em>';
      $('span', li).innerHTML = '<strong>' + t.score + '/' + t.max + '</strong>';
      $('em', li).textContent = new Date(t.at).toLocaleString();
      history.appendChild(li);
    });
    $('#historyEmpty').hidden = tests.length > 0;
    const thisWeek = tests.length && (Date.now() - tests[tests.length - 1].at) < 7 * 864e5;
    $('#testState').textContent = thisWeek
      ? 'Last check-in: ' + new Date(tests[tests.length - 1].at).toLocaleDateString() + ' — you can re-take it any time.'
      : (tests.length ? 'Not taken this week.' : 'Not taken yet.');
  }

  $('#testForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const hint = $('#quizHint');
    const groups = ['q1', 'q2', 'q3'];
    const answers = groups.map((g) => {
      const checked = form.querySelector('input[name="' + g + '"]:checked');
      return checked ? Number(checked.value) : 0;
    });
    if (answers.some((a) => !a)) {
      hint.textContent = 'Answer all three to submit.';
      hint.classList.remove('is-ok');
      return;
    }
    const score = answers.reduce((a, b) => a + b, 0);
    tests.push({ at: Date.now(), score: score, max: 9 });
    saveTests();
    paintTests();
    paintNumbers();
    form.reset();
    hint.textContent = score >= 8
      ? 'Logged — ' + score + '/9. Strong week, keep the same shape.'
      : score >= 5
        ? 'Logged — ' + score + '/9. Solid. The gap is in shipping something another person sees.'
        : 'Logged — ' + score + '/9. No judgement: pick one step and finish it this week.';
    hint.classList.add('is-ok');
  });

  /* ---------------- settings ---------------- */
  function fillSettings() {
    $('#setName').value = profile.name;
    $('#setEmail').value = profile.email;
    $('#setTarget').value = profile.target || '';
    $('#setHours').value = profile.hours;
  }
  fillSettings();
  $('#profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#setName').value.trim() || DEFAULT_PROFILE.name;
    const email = $('#setEmail').value.trim() || DEFAULT_PROFILE.email;
    const hours = Math.min(40, Math.max(1, Number($('#setHours').value) || 5));
    profile.name = name;
    profile.email = email;
    profile.target = $('#setTarget').value;
    profile.hours = hours;
    saveProfile();
    paintIdentity();
    paintNumbers();
    const hint = $('#settingsHint');
    hint.textContent = 'Saved to this browser.';
    hint.classList.add('is-ok');
    setTimeout(() => { hint.textContent = ''; hint.classList.remove('is-ok'); }, 2600);
  });

  $('#exportBtn').addEventListener('click', () => {
    const payload = {
      profile: profile,
      roadmap: steps.map((b) => b.checked),
      evidence: evidence,
      lessons: lessonsDone,
      tests: tests,
      documents: docs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'careertwin-workspace.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    $('#clearHint').textContent = 'Exported. The file contains only what is listed above.';
  });

  $('#clearBtn').addEventListener('click', () => {
    ['ct-roadmap', 'ct-evidence', 'ct-lessons', 'ct-tests', 'ct-docs', 'ct-profile'].forEach(store.del);
    Object.keys(evidence).forEach((k) => delete evidence[k]);
    Object.keys(lessonsDone).forEach((k) => delete lessonsDone[k]);
    tests.length = 0;
    docs.length = 0;
    Object.assign(profile, DEFAULT_PROFILE);
    steps.forEach((b, i) => { b.checked = i < 7; });
    fillSettings();
    syncWeeks();
    paintIdentity();
    paintNumbers();
    paintSkills();
    paintLessons();
    paintDocs();
    paintTests();
    $('#clearHint').textContent = 'Workspace cleared. Everything is back to the sample defaults.';
  });

  /* ---------------- roles ---------------- */
  $$('[data-set-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      profile.target = btn.getAttribute('data-set-target');
      saveProfile();
      fillSettings();
      paintNumbers();
    });
  });

  /* ---------------- coach ---------------- */
  const chat = $('#chat');
  const say = (text, who) => {
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--' + (who === 'me' ? 'me' : 'bot');
    const p = document.createElement('p');
    p.textContent = text;
    el.appendChild(p);
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    while (chat.children.length > 8) chat.removeChild(chat.firstElementChild);
  };
  const react = () => {
    const canvas = $('#dashRobot') || $('#coachRobot');
    if (canvas) canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };

  const replies = {
    next: () => {
      if (!profile.target) return 'Pick a target role first — everything else keys off it. Open Privacy & Settings, choose one, and the roadmap, gaps and tests re-point at it.';
      if (!evidenceCount()) return 'Record evidence for your first skill in Skill Gap Analysis. Until you do, coverage stays at 0% and the priority gap reads “none recorded”.';
      const nextBox = steps.find((b) => !b.checked);
      const text = nextBox ? nextBox.parentElement.querySelector('.road-text').textContent.trim() : 'a weekly check-in';
      return 'Next: “' + text + '”. After that, ' + (TOTAL_STEPS - doneSteps() - 1) + ' roadmap steps remain. Mark it done only when someone else could review it.';
    },
    score: () => {
      const gap = prioritySkill();
      return 'Coverage is ' + coverage() + '% because ' + evidenceCount() + ' of ' + SKILLS.length +
        ' tracked skills have evidence recorded. ' + (gap ? 'The priority gap is ' + gap.name + ' at ' + gap.level + ' against ' + TARGET_LEVEL + ' expected — that is the one to work on first.' : 'No gaps left in the tracked set.');
    },
    interview: () => 'Three things before an interview: rehearse your last project out loud in two minutes, be ready for one number you quoted (' +
      (prioritySkill() ? prioritySkill().name.toLowerCase() : 'your priority gap') + ' is where they usually push), and prepare one question about how the team decides what to build. The weekly check-in is a decent warm-up for all three.'
  };

  $$('[data-ask]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-ask');
      say(btn.textContent.trim(), 'me');
      react();
      const typing = document.createElement('div');
      typing.className = 'chat-msg chat-msg--bot';
      typing.textContent = '…';
      chat.appendChild(typing);
      chat.scrollTop = chat.scrollHeight;
      setTimeout(() => {
        typing.remove();
        say((replies[key] || replies.next)(), 'bot');
        react();
      }, reduce ? 60 : 560);
    });
  });
  const cheer = () => { react(); say('Hi ' + first() + '. Whenever you are ready, start with the next roadmap step.', 'bot'); };
  $('#cheerBtn').addEventListener('click', cheer);
  $('#sayHi').addEventListener('click', cheer);
  $('#careerGuide').addEventListener('click', () => {
    location.hash = '#coach';
    say('Ask me anything about the plan — the roadmap, a flagged skill, or interview prep.', 'bot');
  });

  /* ---------------- router ---------------- */
  const VIEWS = {
    dashboard: ['Dashboard', 'Private career workspace'],
    skills: ['Skill Gap Analysis', 'What the target role expects'],
    intelligence: ['Career Intelligence', 'Roles that fit your evidence'],
    roadmap: ['Career Roadmap', 'Four weeks, twelve steps'],
    studio: ['Learning Studio', 'Lessons tied to your gaps'],
    coach: ['AI Career Coach', 'Answers from your own workspace'],
    documents: ['My Documents', 'Files stay on your device'],
    progress: ['Progress & Weekly Tests', 'A short check-in every week'],
    settings: ['Privacy & Settings', 'Your workspace, your rules']
  };
  let coachBooted = false;

  /* The character bundle is evaluated after this script, so the coach canvas is
     booted lazily: whenever the view opens (and again once the bundle is on the
     page), plus a couple of re-measures because the section was hidden while it
     was first sized. */
  function bootCoach() {
    if (coachBooted || !window.CTRobot || !$('#coachRobot')) return;
    coachBooted = true;
    window.CTRobot.init({ canvasId: 'coachRobot', pose: 'dash' });
    [80, 320, 900].forEach((ms) => setTimeout(() => {
      window.dispatchEvent(new Event('careertwin:resize3d'));
    }, ms));
  }
  window.addEventListener('load', bootCoach);
  [400, 1200, 2600].forEach((ms) => setTimeout(bootCoach, ms));

  function showView(name) {
    if (!VIEWS[name]) name = 'dashboard';
    $$('.view').forEach((v) => { v.hidden = v.getAttribute('data-view') !== name; });
    $$('.dash-nav-item').forEach((a) => a.classList.remove('is-active'));
    $$('.dash-nav-item').forEach((a) => {
      if (a.getAttribute('data-view-link') === name) a.classList.add('is-active');
    });
    $('#viewTitle').textContent = VIEWS[name][0];
    $('#viewSub').textContent = VIEWS[name][1];
    document.title = VIEWS[name][0] + ' — CareerTwin';
    if (name === 'coach') bootCoach();
    window.scrollTo({ top: 0, behavior: 'auto' });
    setTimeout(() => window.dispatchEvent(new Event('careertwin:resize3d')), 80);
    closeSide();
  }

  function currentView() {
    return (location.hash || '#dashboard').replace('#', '');
  }
  window.addEventListener('hashchange', () => showView(currentView()));
  $$('[data-view-link]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('data-view-link');
      if (!target) return;
      e.preventDefault();
      if (currentView() === target) showView(target);
      else location.hash = '#' + target;
    });
  });
  showView(currentView());

  /* ---------------- mobile sidebar ---------------- */
  side = $('#dashSide');
  scrim = $('#dashScrim');
  openBtn = $('#sideOpen');
  function closeSide() {
    if (!side || !openBtn || !scrim) return;
    side.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    scrim.hidden = true;
    document.body.classList.remove('is-locked');
  }
  openBtn.addEventListener('click', () => {
    side.classList.add('is-open');
    openBtn.setAttribute('aria-expanded', 'true');
    scrim.hidden = false;
    document.body.classList.add('is-locked');
  });
  $('#sideClose').addEventListener('click', closeSide);
  scrim.addEventListener('click', closeSide);

  /* ---------------- quick find ---------------- */
  const find = $('#quickFind');
  const results = $('#findResults');

  function index() {
    const items = [
      { label: 'Dashboard', hint: 'Workspace', hash: '#dashboard' },
      { label: 'Skill Gap Analysis', hint: 'Workspace', hash: '#skills' },
      { label: 'Career Intelligence', hint: 'Workspace', hash: '#intelligence' },
      { label: 'Career Roadmap', hint: 'Workspace', hash: '#roadmap' },
      { label: 'Learning Studio', hint: 'Workspace', hash: '#studio' },
      { label: 'AI Career Coach', hint: 'Workspace', hash: '#coach' },
      { label: 'My Documents', hint: 'Workspace', hash: '#documents' },
      { label: 'Progress & Weekly Tests', hint: 'Workspace', hash: '#progress' },
      { label: 'Privacy & Settings', hint: 'Workspace', hash: '#settings' }
    ];
    steps.forEach((box) => {
      const text = box.parentElement.querySelector('.road-text').textContent.trim();
      items.push({ label: text, hint: 'Roadmap', hash: '#roadmap' });
    });
    SKILLS.forEach((s) => items.push({ label: s.name, hint: 'Skill · ' + s.level, hash: '#skills' }));
    DEFAULT_LESSONS.forEach((l) => items.push({ label: l.title, hint: 'Lesson · ' + l.skill, hash: '#studio' }));
    $$('#rolesList [data-role]').forEach((li) => items.push({ label: li.getAttribute('data-role'), hint: 'Role · ' + li.getAttribute('data-fit') + '% fit', hash: '#intelligence' }));
    return items;
  }
  const INDEX = index();

  function renderFind(q) {
    const query = q.trim().toLowerCase();
    if (!query) { results.hidden = true; find.setAttribute('aria-expanded', 'false'); return; }
    const hits = INDEX.filter((i) => i.label.toLowerCase().includes(query)).slice(0, 8);
    results.innerHTML = '';
    if (!hits.length) {
      const d = document.createElement('p');
      d.className = 'find-empty';
      d.textContent = 'Nothing in the workspace matches “' + q.trim() + '”.';
      results.appendChild(d);
    } else {
      hits.forEach((hit) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'option');
        b.innerHTML = '<strong></strong><em></em>';
        $('strong', b).textContent = hit.label;
        $('em', b).textContent = hit.hint;
        b.addEventListener('click', () => {
          location.hash = hit.hash;
          results.hidden = true;
          find.value = '';
          find.setAttribute('aria-expanded', 'false');
        });
        results.appendChild(b);
      });
    }
    results.hidden = false;
    find.setAttribute('aria-expanded', 'true');
  }

  find.addEventListener('input', () => renderFind(find.value));
  find.addEventListener('focus', () => { if (find.value.trim()) renderFind(find.value); });
  find.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { results.hidden = true; find.value = ''; find.blur(); }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstBtn = results.querySelector('button');
      if (firstBtn) firstBtn.focus();
    }
  });
  results.addEventListener('keydown', (e) => {
    const btns = $$('button', results);
    const i = btns.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && i > -1 && btns[i + 1]) { e.preventDefault(); btns[i + 1].focus(); }
    if (e.key === 'ArrowUp' && i > -1) { e.preventDefault(); (btns[i - 1] || find).focus(); }
    if (e.key === 'Escape') { results.hidden = true; find.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!results.hidden && !results.contains(e.target) && e.target !== find) results.hidden = true;
  });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      find.focus();
      find.select();
    }
    if (e.key === 'Escape' && side && side.classList.contains('is-open')) closeSide();
  });

  /* ---------------- greeting by time of day ---------------- */
  const hour = new Date().getHours();
  const welcome = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const eyebrow = $('.command-copy .dash-eyebrow');
  if (eyebrow) eyebrow.innerHTML = '<span class="live-dot" aria-hidden="true"></span>' + welcome + ' · career command centre';

  /* ---------------- boot ---------------- */
  paintIdentity();
  paintSkills();
  paintLessons();
  paintDocs();
  paintTests();
  paintNumbers();
  $$('.footer-year').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
