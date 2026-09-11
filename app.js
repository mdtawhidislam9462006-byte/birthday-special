(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const intro = $('#introScene');
  const story = $('#storyScene');
  const shell = $('#momentShell');
  const music = $('#birthdayMusic');
  const progressBar = $('#progressBar');
  const progress = $('.progress');
  const bowControl = $('#bowControl');
  const archeryStage = $('#archeryStage');
  const targetHeart = $('#targetHeart');
  const flyingArrow = $('#flyingArrow');
  const heartBurst = $('#heartBurst');
  const impactRing = $('#impactRing');
  const soundToggle = $('#soundToggle');
  const sceneIndex = $('#sceneIndex');
  const openAdmin = $('#openAdmin');
  const passwordModal = $('#passwordModal');
  const passwordForm = $('#passwordForm');
  const passwordInput = $('#passwordInput');
  const passwordError = $('#passwordError');
  const adminModal = $('#adminModal');
  const nameInput = $('#nameInput');
  const fromInput = $('#fromInput');
  const noteInput = $('#noteInput');
  const photoInput = $('#photoInput');
  const photoPreviewBox = $('#photoPreviewBox');
  const photoPreview = $('#photoPreview');
  const photoInfo = $('#photoInfo');
  const photoStatus = $('#photoStatus');
  const removePhoto = $('#removePhoto');
  const previewButton = $('#previewButton');
  const saveLinkButton = $('#saveLinkButton');
  const shareBox = $('#shareBox');
  const shareUrl = $('#shareUrl');
  const copyLinkButton = $('#copyLinkButton');
  const nativeShareButton = $('#nativeShareButton');
  const shareHelp = $('#shareHelp');
  const toast = $('#toast');

  const BASE_DURATION = 196.310204;
  const PASSWORD_HASH = '775521ca'; // FNV-1a("945100")
  const UNLOCK_KEY = 'TAwhidBirthdayEditorUnlockedV1';
  const CONFIG_KEY = 'TAwhidBirthdayConfigV3';

  const defaults = {
    name: 'Someone Special',
    from: 'Someone who cares',
    note: 'May this new year of your life bring you gentle mornings, brave choices, people who feel like home, and many reasons to smile even on ordinary days.',
    photo: '',
    photoType: 'image/webp'
  };

  let current = { ...defaults };
  let started = false;
  let muted = false;
  let dragging = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pull = 0;
  let pointerMoved = false;
  let clockMode = 'fallback';
  let fallbackOffset = 0;
  let storyPausedForDialog = false;
  let activeMoment = -1;
  let rafId = 0;
  let fallbackStartedAt = 0;
  let renderToken = 0;
  let candleBlown = false;

  const moments = [
    { at: 0.0, type: 'birthday', tone: 'rose' },
    { at: 6.2, type: 'name', tone: 'night' },
    { at: 12.6, type: 'text', tone: 'light', kicker: 'today is more than a date', title: 'The world gets to celebrate <span class="accent">you.</span>', sub: n => `${n}, I hope you feel how special this day really is.` },
    { at: 19.2, type: 'photo', tone: 'gold', variant: 'photo-basic', caption: n => `Look at you, ${n} ✨` },
    { at: 26.0, type: 'quote', tone: 'blue', title: 'May your smile keep finding its way back to you.', sub: 'Especially on the days that ask a little more from your heart.' },
    { at: 32.7, type: 'wish', tone: 'night', word: 'PEACE', detail: 'The quiet kind that makes your heart feel safe and light.' },
    { at: 39.2, type: 'text', tone: 'rose', kicker: 'for the ordinary days too', title: 'May little things become <span class="accent">beautiful memories.</span>', sub: 'A good song. A late-night laugh. A kind message. A sky worth looking at.' },
    { at: 45.9, type: 'photo', tone: 'light', variant: 'photo-polaroid', caption: n => `Keep this smile, ${n}` },
    { at: 52.6, type: 'quote', tone: 'night', title: 'You never have to be perfect to be deeply worth celebrating.', sub: 'Your real, growing, trying self is already enough.' },
    { at: 59.4, type: 'tree', tone: 'light' },
    { at: 66.3, type: 'text', tone: 'gold', kicker: 'a fresh chapter begins', title: 'More laughter.<br>More courage.<br><span class="accent">More you.</span>', sub: 'May this year carry you toward the life that feels right in your own heart.' },
    { at: 73.1, type: 'wish', tone: 'rose', word: 'JOY', detail: 'The kind that suddenly appears in simple, ordinary moments.' },
    { at: 79.8, type: 'photo', tone: 'night', variant: 'photo-orbit', caption: n => `${n} — one of one` },
    { at: 86.7, type: 'text', tone: 'blue', kicker: 'a tiny birthday prayer', title: 'May good news find you <span class="accent">often.</span>', sub: 'And may the things you have been patiently waiting for finally start moving your way.' },
    { at: 93.3, type: 'quote', tone: 'light', title: 'May you keep choosing people and places where you can breathe, laugh and simply be yourself.', sub: 'Life feels softer when you do not have to shrink to belong.' },
    { at: 100.0, type: 'memory', tone: 'rose', caption: n => `A moment worth keeping, ${n}` },
    { at: 107.0, type: 'wish', tone: 'night', word: 'COURAGE', detail: 'For every dream that feels a little scary because it matters to you.' },
    { at: 113.5, type: 'text', tone: 'gold', kicker: 'for your dreams', title: 'May “someday” slowly turn into <span class="accent">“I did it.”</span>', sub: 'One brave step, one patient day, one small win at a time.' },
    { at: 120.3, type: 'cake', tone: 'night' },
    { at: 127.0, type: 'quote', tone: 'blue', title: 'Keep a little space in your life for unexpected magic.', sub: 'Some of the best moments arrive without an invitation.' },
    { at: 133.7, type: 'photo', tone: 'rose', variant: 'photo-heart', caption: n => `A heart full of wishes for ${n}` },
    { at: 140.3, type: 'wish', tone: 'gold', word: 'LOVE', detail: 'In your people, in your days, and in the gentle way you learn to treat yourself.' },
    { at: 147.0, type: 'text', tone: 'light', kicker: 'when life gets heavy', title: 'Please remember how far you have <span class="accent">already come.</span>', sub: 'Rest when you need to. Begin again when you are ready. You do not have to race anyone.' },
    { at: 153.7, type: 'photo', tone: 'blue', variant: 'photo-card', caption: n => `Main character today: ${n}` },
    { at: 160.5, type: 'letter', tone: 'rose' },
    { at: 169.0, type: 'text', tone: 'night', kicker: 'this next chapter', title: '<span class="script-name name-spark">{NAME}</span>', sub: 'May your name sit beside stories you are proud to tell.' },
    { at: 176.2, type: 'photo', tone: 'gold', variant: 'photo-basic', caption: n => `Birthday star, ${n} ✦` },
    { at: 183.0, type: 'personal', tone: 'light' },
    { at: 190.0, type: 'final', tone: 'rose' }
  ];

  function clean(value, max = 420) {
    return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }
  function fnv1a(value) {
    let h = 0x811c9dc5;
    for (const ch of value) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }
  function seeded(seed = 945100) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 1900);
  }
  function showDialog(dialog) {
    if (!dialog) return;
    try { if (!dialog.open) dialog.showModal(); }
    catch { dialog.setAttribute('open',''); dialog.classList.add('fallback-open'); }
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    try { if (dialog.open && typeof dialog.close === 'function') dialog.close(); } catch {}
    dialog.removeAttribute('open');
    dialog.classList.remove('fallback-open');
  }

  function base64UrlToBase64(value) {
    let b64 = value.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return b64;
  }
  function photoDataUrl() {
    if (!current.photo) return '';
    return `data:${current.photoType || 'image/webp'};base64,${base64UrlToBase64(current.photo)}`;
  }
  function bytesToBase64Url(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function parseConfig() {
    const q = new URLSearchParams(location.search);
    const h = new URLSearchParams(location.hash.replace(/^#/, ''));
    const hasSharedConfig = q.has('n') || q.has('from') || h.has('note') || h.has('p') || h.has('pt');
    let local = {};
    try { local = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); } catch {}
    const source = hasSharedConfig ? {} : local;
    current = {
      name: clean(q.get('n') || source.name || defaults.name, 42) || defaults.name,
      from: clean(q.get('from') || source.from || defaults.from, 42) || defaults.from,
      note: clean(h.get('note') || source.note || defaults.note, 420) || defaults.note,
      photo: h.get('p') || source.photo || '',
      photoType: h.get('pt') === 'j' ? 'image/jpeg' : (h.get('pt') === 'w' ? 'image/webp' : (source.photoType || 'image/webp'))
    };
    applyConfig();
  }

  function applyConfig() {
    $$('[data-name]').forEach(el => el.textContent = current.name);
    document.title = `Happy Birthday, ${current.name} ✨`;
    nameInput.value = current.name === defaults.name ? '' : current.name;
    fromInput.value = current.from === defaults.from ? '' : current.from;
    noteInput.value = current.note === defaults.note ? '' : current.note;
    updatePhotoPreview();
  }

  function updatePhotoPreview() {
    if (!current.photo) {
      photoPreviewBox.hidden = true;
      photoPreview.removeAttribute('src');
      return;
    }
    photoPreview.src = photoDataUrl();
    photoPreviewBox.hidden = false;
    const approx = Math.round(current.photo.length * .75 / 1024);
    photoInfo.textContent = `Compressed portrait • about ${approx} KB in the link`;
  }

  function buildAmbient() {
    const rand = seeded(945100);
    const introStars = $('#introStars');
    const storyStars = $('#storyStars');
    const storyParticles = $('#storyParticles');
    introStars.innerHTML = '';
    storyStars.innerHTML = '';
    storyParticles.innerHTML = '';
    for (let i = 0; i < 38; i++) {
      const a = document.createElement('i');
      a.style.cssText = `--x:${(rand()*100).toFixed(2)}%;--y:${(rand()*100).toFixed(2)}%;--s:${(1+rand()*3).toFixed(1)}px;--o:${(.18+rand()*.55).toFixed(2)};--d:${(2.2+rand()*4).toFixed(2)}s;animation-delay:${(-rand()*4).toFixed(2)}s`;
      introStars.appendChild(a);
    }
    for (let i = 0; i < 70; i++) {
      const a = document.createElement('i');
      a.style.cssText = `--x:${(rand()*100).toFixed(2)}%;--y:${(rand()*100).toFixed(2)}%;--s:${(1+rand()*3.4).toFixed(1)}px;--o:${(.13+rand()*.76).toFixed(2)};--d:${(2+rand()*5).toFixed(2)}s;animation-delay:${(-rand()*6).toFixed(2)}s`;
      storyStars.appendChild(a);
    }
    const glyphs = ['♡','✦','·','♡','✧'];
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('i');
      p.textContent = glyphs[Math.floor(rand()*glyphs.length)];
      p.style.cssText = `--x:${(rand()*100).toFixed(2)}%;--s:${(9+rand()*16).toFixed(1)}px;--d:${(8+rand()*9).toFixed(2)}s;--delay:${(-rand()*13).toFixed(2)}s;--dx:${(-55+rand()*110).toFixed(0)}px`;
      storyParticles.appendChild(p);
    }
  }

  function burstHeart() {
    const rand = seeded(Date.now() & 0xffffffff);
    heartBurst.innerHTML = '';
    for (let i = 0; i < 28; i++) {
      const dot = document.createElement('i');
      const angle = rand() * Math.PI * 2;
      const distance = 70 + rand() * 170;
      dot.style.cssText = `--tx:${(Math.cos(angle)*distance).toFixed(1)}px;--ty:${(Math.sin(angle)*distance).toFixed(1)}px;--rot:${(-180+rand()*360).toFixed(0)}deg;--delay:${(rand()*.1).toFixed(2)}s;--c:${['#f02b72','#ff8daf','#ffd1df','#d4185b','#f2c976'][Math.floor(rand()*5)]}`;
      heartBurst.appendChild(dot);
    }
    heartBurst.classList.remove('burst');
    void heartBurst.offsetWidth;
    heartBurst.classList.add('burst');
  }

  function noPhotoHtml(caption) {
    return `<div class="no-photo-art">
      <svg class="heart-outline" viewBox="0 0 520 470" aria-hidden="true"><path pathLength="1" d="M260 438C207 384 60 288 43 163 30 66 143 17 221 82 241 99 253 119 260 141 267 119 279 99 299 82 377 17 490 66 477 163 460 288 313 384 260 438Z"/></svg>
      <div class="nf-name">${esc(current.name)}</div><p>${esc(caption || 'a beautiful birthday moment')}</p>
    </div>`;
  }

  function photoHtml(variant, caption) {
    const src = photoDataUrl();
    if (!src) return noPhotoHtml(caption);
    const orbit = variant === 'photo-orbit' ? `<div class="orbit-hearts">${[0,45,90,135,180,225,270,315].map(a=>`<i style="--a:${a}deg">${a%90?'✦':'♡'}</i>`).join('')}</div>` : '';
    return `<div class="photo-moment ${esc(variant)}"><div class="photo-stage"><div class="photo-glow"></div><div class="photo-ring"></div>${orbit}<img src="${src}" alt="Birthday photo of ${esc(current.name)}"><div class="photo-caption">${esc(caption)}</div></div></div>`;
  }

  function memoryHtml(caption) {
    const src = photoDataUrl();
    if (!src) return noPhotoHtml(caption);
    return `<div class="memory-stack"><div class="sheet"></div><div class="sheet"></div><img src="${src}" alt="Birthday memory of ${esc(current.name)}"><p>${esc(caption)}</p></div>`;
  }

  function treeHtml() {
    return `<div class="tree-wrap">
      <div class="tree-label"><span class="kicker">if happiness could grow</span><h2>For ${esc(current.name)}</h2><p>I would grow a whole sky of it — with peaceful mornings, brave dreams and people who make your heart feel at home.</p></div>
      <svg class="tree-svg" viewBox="0 0 1000 720" aria-label="A blooming heart tree">
        <defs><symbol id="leafHeartNow" viewBox="0 0 24 22"><path d="M12 21C9.4 18.2 2 13.4 1 7.4.2 2.7 5.6-.1 9.2 2.3c1.3.9 2.2 2 2.8 3.2.6-1.2 1.5-2.3 2.8-3.2C18.4-.1 23.8 2.7 23 7.4 22 13.4 14.6 18.2 12 21Z"/></symbol></defs>
        <g class="branches">
          <path class="branch" pathLength="1" d="M600 712C596 628 597 553 590 489 584 430 573 372 580 314 585 274 602 240 611 198"/>
          <path class="branch" pathLength="1" d="M590 411C548 372 517 332 494 288 478 258 453 229 421 206"/>
          <path class="branch" pathLength="1" d="M592 378C635 340 663 306 689 267 710 236 734 211 765 192"/>
          <path class="branch" pathLength="1" d="M583 344C558 302 548 266 547 228 546 196 532 164 506 142"/>
          <path class="branch" pathLength="1" d="M602 313C628 274 637 237 636 201 635 170 646 144 670 118"/>
          <path class="branch twig" pathLength="1" d="M494 288C464 271 440 250 418 224M689 267C715 255 739 238 760 215M547 228C522 207 503 184 489 158M636 201C659 181 678 158 690 132"/>
        </g><g id="treeLeaves"></g>
      </svg>
    </div>`;
  }

  function buildTreeLeaves() {
    const g = $('#treeLeaves');
    if (!g) return;
    const rand = seeded(123456);
    const palette = ['#e92f70','#ff6f9a','#f7a09a','#f4bd81','#d8537d','#ff9db7','#dd316f'];
    let count = 0, attempts = 0;
    while (count < 230 && attempts < 16000) {
      attempts++;
      const x = rand()*2.6-1.3, y = rand()*2.35-1.15;
      if (Math.pow(x*x+y*y-1,3)-x*x*Math.pow(y,3) > 0) continue;
      const px = 603 + x*175 + (rand()-.5)*6;
      const py = 185 - y*142 + (rand()-.5)*6;
      if (py > 370) continue;
      const u = document.createElementNS('http://www.w3.org/2000/svg','use');
      u.setAttribute('href','#leafHeartNow');
      const size = 9 + rand()*15;
      u.setAttribute('x',(px-size/2).toFixed(1)); u.setAttribute('y',(py-size/2).toFixed(1));
      u.setAttribute('width',size.toFixed(1)); u.setAttribute('height',(size*.92).toFixed(1));
      u.setAttribute('fill',palette[Math.floor(rand()*palette.length)]);
      u.classList.add('leaf');
      u.style.setProperty('--r',`${(-35+rand()*70).toFixed(1)}deg`);
      u.style.setProperty('--o',`${(.58+rand()*.42).toFixed(2)}`);
      u.style.setProperty('--delay',`${(.45+rand()*2.0).toFixed(2)}s`);
      g.appendChild(u); count++;
    }
  }

  function cakeHtml() {
    return `<div class="cake-moment"><div class="cake-copy"><p class="kicker">one tiny pause in the story</p><h2>Make a wish, <span class="accent">${esc(current.name)}</span>.</h2><p class="subcopy">Tap the candle when your wish is ready ✨</p></div>
      <button class="cake" id="cakeButton" aria-label="Blow out the birthday candle"><i class="plate"></i><i class="body"></i><i class="icing"></i><i class="candle"></i><i class="wick"></i><i class="flame" id="flame"></i></button><p class="cake-hint" id="cakeHint">tap the candle</p></div>`;
  }

  function finalHtml() {
    return `<div class="final-moment"><svg class="final-ring" viewBox="0 0 520 470" aria-hidden="true"><path pathLength="1" d="M260 438C207 384 60 288 43 163 30 66 143 17 221 82 241 99 253 119 260 141 267 119 279 99 299 82 377 17 490 66 477 163 460 288 313 384 260 438Z"/></svg><div class="confetti" id="confetti"></div><div class="final-content"><p class="kicker">and this little journey ends with one big wish</p><h2 class="final-name">${esc(current.name)}</h2><h3>Happy Birthday 🤍</h3><p>May this be the beginning of a year that feels kinder, brighter and wonderfully yours.</p><button class="replay" id="replayButton">Replay the surprise ↻</button></div></div>`;
  }

  function renderMomentContent(m) {
    switch (m.type) {
      case 'birthday':
        return `<div class="text-moment"><p class="kicker">this one is especially for you</p><h2 class="display">Happy<br><span class="accent script">Birthday</span></h2><p class="subcopy">to ${esc(current.name)} ✨</p></div>`;
      case 'name':
        return `<div class="text-moment"><p class="kicker">there is one name that makes today special</p><h2 class="display script name-spark">${esc(current.name)}</h2><p class="subcopy">The world became a little more interesting the day you arrived.</p></div>`;
      case 'text': {
        const title = m.title.replace('{NAME}', esc(current.name));
        const sub = typeof m.sub === 'function' ? m.sub(current.name) : m.sub;
        return `<div class="text-moment"><p class="kicker">${m.kicker || ''}</p><h2 class="display">${title}</h2><p class="subcopy">${esc(sub || '')}</p></div>`;
      }
      case 'quote':
        return `<div class="text-moment quote-moment"><span class="quote-glyph">“</span><h2 class="display">${esc(m.title)}</h2><p class="subcopy">${esc(m.sub)}</p></div>`;
      case 'wish':
        return `<div class="text-moment"><p class="kicker">for your year ahead, I wish you</p><div class="giant-word">${esc(m.word)}</div><p class="wish-detail">${esc(m.detail)}</p></div>`;
      case 'photo':
        return photoHtml(m.variant, m.caption(current.name));
      case 'memory':
        return memoryHtml(m.caption(current.name));
      case 'tree':
        return treeHtml();
      case 'cake':
        return cakeHtml();
      case 'letter':
        return `<article class="letter-card"><p class="small">a little note before the final moments</p><h2>Dear ${esc(current.name)},</h2><p>I hope you keep becoming more of the person you feel happiest being. Keep the people who are gentle with your heart. Keep room for silly laughter, quiet dreams and new beginnings. And whenever you forget your own light, I hope someone reminds you.</p><div class="sign">with warm wishes, ${esc(current.from)}</div></article>`;
      case 'personal':
        return `<article class="letter-card"><p class="small">one message chosen just for you</p><h2>${esc(current.name)}, this is for you.</h2><p>${esc(current.note)}</p><div class="sign">— ${esc(current.from)}</div></article>`;
      case 'final':
        return finalHtml();
      default:
        return '';
    }
  }

  function renderMoment(index, force = false) {
    if (!force && index === activeMoment) return;
    activeMoment = index;
    const m = moments[index] || moments[moments.length - 1];
    const token = ++renderToken;
    story.dataset.tone = m.tone || 'rose';
    sceneIndex.textContent = `${String(index + 1).padStart(2,'0')} / ${moments.length}`;
    const old = $('.moment', shell);
    if (old) old.classList.add('exit');
    const draw = () => {
      if (token !== renderToken) return;
      shell.innerHTML = `<div class="moment">${renderMomentContent(m)}</div>`;
      if (m.type === 'tree') buildTreeLeaves();
      if (m.type === 'final') buildConfetti();
      if (m.type === 'cake') {
        candleBlown = false;
        $('#cakeButton')?.addEventListener('click', blowCandle);
      }
      $('#replayButton')?.addEventListener('click', replayStory);
    };
    if (old) setTimeout(draw, 410); else draw();
  }

  function buildConfetti() {
    const c = $('#confetti');
    if (!c) return;
    const rand = seeded(20260911);
    const colors = ['#fff','#ffd1dd','#ff91b3','#ffd889','#e92e70'];
    for (let i = 0; i < 58; i++) {
      const p = document.createElement('i');
      p.style.cssText = `--x:${(rand()*100).toFixed(2)}%;--w:${(4+rand()*5).toFixed(1)}px;--h:${(7+rand()*10).toFixed(1)}px;--c:${colors[Math.floor(rand()*colors.length)]};--d:${(4+rand()*4).toFixed(2)}s;--delay:${(-rand()*7).toFixed(2)}s;--dx:${(-60+rand()*120).toFixed(0)}px;--rot:${(220+rand()*520).toFixed(0)}deg`;
      c.appendChild(p);
    }
  }

  function blowCandle() {
    if (candleBlown) return;
    candleBlown = true;
    $('#flame')?.classList.add('out');
    const hint = $('#cakeHint');
    if (hint) hint.textContent = 'may it come true ✨';
    burstParticlesNearCake();
  }

  function burstParticlesNearCake() {
    const host = $('#storyParticles');
    const rand = seeded(Date.now() & 0xffffffff);
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('i');
      p.textContent = i % 2 ? '✦' : '♡';
      p.style.cssText = `--x:${(43+rand()*14).toFixed(2)}%;--s:${(12+rand()*12).toFixed(1)}px;--d:${(2+rand()*1.7).toFixed(2)}s;--delay:0s;--dx:${(-80+rand()*160).toFixed(0)}px;top:67%;animation-iteration-count:1;opacity:.85`;
      host.appendChild(p);
      setTimeout(() => p.remove(), 4200);
    }
  }

  function effectiveDuration() {
    return Number.isFinite(music.duration) && music.duration > 10 ? music.duration : BASE_DURATION;
  }
  function scaledAt(seconds) {
    return seconds * (effectiveDuration() / BASE_DURATION);
  }
  function momentIndexAt(seconds) {
    let idx = 0;
    for (let i = 0; i < moments.length; i++) {
      if (seconds >= scaledAt(moments[i].at)) idx = i; else break;
    }
    return idx;
  }
  function useFallbackClock(offset = 0) {
    clockMode = 'fallback';
    fallbackOffset = Math.max(0, Number(offset) || 0);
    fallbackStartedAt = performance.now();
  }
  function currentStoryTime() {
    if (clockMode === 'audio') return Math.max(0, Number(music.currentTime) || 0);
    if (!fallbackStartedAt) return fallbackOffset;
    return Math.min(effectiveDuration(), fallbackOffset + (performance.now() - fallbackStartedAt) / 1000);
  }

  function frame() {
    if (!started) return;
    const t = currentStoryTime();
    const dur = effectiveDuration();
    const pct = Math.max(0, Math.min(100, (t / dur) * 100));
    progressBar.style.width = `${pct}%`;
    renderMoment(momentIndexAt(t));
    if (t < dur + .25) rafId = requestAnimationFrame(frame);
  }

  function startMusicFromGesture() {
    try { music.pause(); music.currentTime = 0; } catch {}
    music.muted = muted;
    useFallbackClock(0);
    const playResult = music.play();
    if (playResult && typeof playResult.then === 'function') {
      playResult.then(() => {
        const syncAt = currentStoryTime();
        try { if (syncAt > (music.currentTime || 0) + .25) music.currentTime = Math.min(syncAt, Math.max(0, effectiveDuration() - .1)); } catch {}
        clockMode = 'audio';
      }).catch(() => {
        useFallbackClock(0);
        showToast('Music was blocked; animation will still play');
      });
    } else {
      clockMode = 'audio';
    }
  }

  function animateArrowToHeart() {
    const bowRect = bowControl.getBoundingClientRect();
    const heartRect = targetHeart.getBoundingClientRect();
    const sx = bowRect.left + bowRect.width * .76;
    const sy = bowRect.top + bowRect.height * .50;
    const tx = heartRect.left + heartRect.width * .50;
    const ty = heartRect.top + heartRect.height * .51;
    const angle = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI;
    const distance = Math.hypot(tx - sx, ty - sy);
    const travelMs = Math.max(430, Math.min(760, distance * 1.18));

    flyingArrow.getAnimations?.().forEach(a => a.cancel());
    flyingArrow.style.opacity = '1';
    flyingArrow.style.left = `${sx}px`;
    flyingArrow.style.top = `${sy}px`;
    flyingArrow.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(.92)`;

    const impact = () => {
      targetHeart.classList.add('is-hit');
      impactRing.classList.remove('pop');
      void impactRing.offsetWidth;
      impactRing.classList.add('pop');
      setTimeout(() => {
        burstHeart();
        targetHeart.classList.add('is-broken');
        flyingArrow.style.opacity = '0';
      }, 150);
    };

    if (typeof flyingArrow.animate !== 'function') {
      flyingArrow.style.left = `${tx}px`;
      flyingArrow.style.top = `${ty}px`;
      flyingArrow.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(1)`;
      setTimeout(impact, Math.min(520, travelMs));
      return Math.min(520, travelMs);
    }

    const animation = flyingArrow.animate([
      { left: `${sx}px`, top: `${sy}px`, transform: `translate(-50%,-50%) rotate(${angle}deg) scale(.92)`, opacity: 1, offset: 0 },
      { left: `${sx + (tx-sx)*.82}px`, top: `${sy + (ty-sy)*.82}px`, transform: `translate(-50%,-50%) rotate(${angle}deg) scale(1)`, opacity: 1, offset: .82 },
      { left: `${tx}px`, top: `${ty}px`, transform: `translate(-50%,-50%) rotate(${angle}deg) scale(1.02)`, opacity: 1, offset: 1 }
    ], { duration: travelMs, easing: 'cubic-bezier(.2,.76,.22,1)', fill: 'forwards' });

    animation.onfinish = impact;
    return travelMs;
  }

  function startStory() {
    if (started) return;
    started = true;
    activeMoment = -1;
    renderToken++;
    candleBlown = false;
    progress.classList.add('show');
    progressBar.style.width = '0%';
    bowControl.classList.remove('is-pulling');
    bowControl.classList.add('is-shot');
    bowControl.style.setProperty('--bow-pull', '0px');
    bowControl.style.transform = '';

    startMusicFromGesture();
    const flightMs = animateArrowToHeart();
    const revealDelay = flightMs + 520;
    setTimeout(() => {
      intro.classList.remove('is-active');
      story.classList.add('is-active');
      renderMoment(momentIndexAt(currentStoryTime()), true);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);
    }, revealDelay);
  }

  function resetExperienceToIntro() {
    started = false;
    storyPausedForDialog = false;
    cancelAnimationFrame(rafId);
    try { music.pause(); music.currentTime = 0; } catch {}
    useFallbackClock(0);
    fallbackStartedAt = 0;
    activeMoment = -1;
    renderToken++;
    progressBar.style.width = '0%';
    progress.classList.remove('show');
    story.classList.remove('is-active');
    intro.classList.add('is-active');
    bowControl.classList.remove('is-shot','is-pulling');
    bowControl.style.removeProperty('--bow-pull');
    bowControl.style.transform = '';
    targetHeart.classList.remove('is-hit','is-broken');
    impactRing.classList.remove('pop');
    heartBurst.classList.remove('burst');
    flyingArrow.getAnimations?.().forEach(a => a.cancel());
    flyingArrow.style.opacity = '0';
  }

  function replayStory() {
    resetExperienceToIntro();
    showToast('Ready — shoot the heart again ✨');
  }

  music.addEventListener('ended', () => {
    if (!started) return;
    renderMoment(moments.length - 1, true);
    progressBar.style.width = '100%';
  });
  music.addEventListener('error', () => {
    if (started && clockMode === 'audio') useFallbackClock(music.currentTime || 0);
  });

  // Reference-style bow interaction: pull/release, with a simple tap fallback for phones.
  bowControl.addEventListener('pointerdown', e => {
    if (started) return;
    dragging = true;
    pointerMoved = false;
    pull = 0;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    bowControl.setPointerCapture?.(e.pointerId);
    bowControl.classList.add('is-pulling');
  });
  bowControl.addEventListener('pointermove', e => {
    if (!dragging || started) return;
    const dx = e.clientX - pointerStartX;
    const dy = e.clientY - pointerStartY;
    if (Math.hypot(dx,dy) > 6) pointerMoved = true;
    // Pull backwards (left/down works naturally on both portrait and desktop).
    const backward = Math.max(0, Math.min(72, -dx * .82 + dy * .18));
    pull = backward;
    bowControl.style.setProperty('--bow-pull', `${backward}px`);
    bowControl.style.transform = `translate(calc(-50% - ${backward*.18}px),-50%) rotate(${Math.max(-3,Math.min(3,dy/30))}deg)`;
  });
  function releaseBow() {
    if (!dragging || started) return;
    dragging = false;
    bowControl.classList.remove('is-pulling');
    // A tap also shoots; this prevents the intro from being frustrating on Android.
    if (pull >= 18 || !pointerMoved) {
      startStory();
      return;
    }
    bowControl.style.transition = 'transform 360ms cubic-bezier(.2,1.25,.4,1)';
    bowControl.style.transform = '';
    bowControl.style.setProperty('--bow-pull','0px');
    setTimeout(() => { bowControl.style.transition = ''; }, 390);
  }
  bowControl.addEventListener('pointerup', releaseBow);
  bowControl.addEventListener('click', () => {
    if (!started && !dragging) startStory();
  });
  bowControl.addEventListener('pointercancel', () => {
    if (!dragging) return;
    dragging = false;
    bowControl.classList.remove('is-pulling');
    bowControl.style.transform = '';
    bowControl.style.setProperty('--bow-pull','0px');
  });
  bowControl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startStory(); }
  });

  document.addEventListener('visibilitychange', () => {
    if (!started || document.hidden || muted || music.ended) return;
    if (clockMode === 'audio' && music.paused) {
      const at = music.currentTime || currentStoryTime();
      const p = music.play();
      p?.catch?.(() => useFallbackClock(at));
    }
  });

  soundToggle.addEventListener('click', async () => {
    muted = !muted;
    music.muted = muted;
    soundToggle.classList.toggle('is-muted', muted);
    if (!muted && started && music.paused && music.currentTime < effectiveDuration()) {
      const at = currentStoryTime();
      try {
        if (clockMode === 'fallback') { try { music.currentTime = Math.min(at, Math.max(0, effectiveDuration() - .1)); } catch {} }
        await music.play();
        clockMode = 'audio';
      } catch { useFallbackClock(at); }
    }
    showToast(muted ? 'Background song muted' : 'Background song on');
  });

  // One-time browser unlock
  function editorUnlocked() {
    try { return localStorage.getItem(UNLOCK_KEY) === '1'; } catch { return false; }
  }
  function openEditor() {
    applyConfig();
    shareBox.hidden = true;
    showDialog(adminModal);
  }
  openAdmin.addEventListener('click', () => {
    if (editorUnlocked()) { openEditor(); return; }
    passwordError.textContent = ''; passwordInput.value = '';
    showDialog(passwordModal);
    setTimeout(() => passwordInput.focus(), 50);
  });
  passwordForm.addEventListener('submit', e => {
    e.preventDefault();
    if (fnv1a(passwordInput.value) !== PASSWORD_HASH) {
      passwordError.textContent = 'Wrong password. Please try again.';
      passwordInput.select(); return;
    }
    try { localStorage.setItem(UNLOCK_KEY, '1'); } catch {}
    passwordError.textContent = '';
    closeDialog(passwordModal);
    openEditor();
    showToast('Unlocked — this browser will remember you');
  });

  function readEditorText() {
    current.name = clean(nameInput.value, 42) || defaults.name;
    current.from = clean(fromInput.value, 42) || defaults.from;
    current.note = clean(noteInput.value, 420) || defaults.note;
  }

  function fileToImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function canvasBlob(canvas, type, quality) {
    return new Promise(resolve => canvas.toBlob(resolve, type, quality));
  }
  async function compressPhoto(file) {
    const img = await fileToImage(file);
    let size = 420;
    let quality = .68;
    let type = 'image/webp';
    let blob = null;
    for (let pass = 0; pass < 8; pass++) {
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Canvas is not available');
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,size,size);
      const sw = img.naturalWidth, sh = img.naturalHeight;
      const crop = Math.min(sw, sh);
      const sx = (sw - crop) / 2, sy = (sh - crop) / 2;
      ctx.drawImage(img, sx, sy, crop, crop, 0, 0, size, size);
      blob = await canvasBlob(canvas, type, quality);
      if (!blob) { type = 'image/jpeg'; blob = await canvasBlob(canvas, type, quality); }
      if (blob && blob.size <= 26000) break;
      quality = Math.max(.36, quality - .07);
      if (pass >= 4) size = Math.max(320, size - 34);
    }
    if (!blob) throw new Error('Could not compress image');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { encoded: bytesToBase64Url(bytes), type, bytes: blob.size };
  }

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { photoStatus.textContent = 'Please choose an image file.'; return; }
    if (file.size > 20 * 1024 * 1024) { photoStatus.textContent = 'This photo is too large. Please choose an image under 20 MB.'; photoInput.value = ''; return; }
    photoStatus.textContent = 'Optimizing the photo for a shareable link…';
    photoInput.disabled = true;
    previewButton.disabled = true;
    saveLinkButton.disabled = true;
    try {
      const result = await compressPhoto(file);
      current.photo = result.encoded;
      current.photoType = result.type;
      updatePhotoPreview();
      photoStatus.textContent = `Ready — compressed to about ${Math.max(1, Math.round(result.bytes/1024))} KB.`;
    } catch {
      photoStatus.textContent = 'Could not process this photo. Please try another JPG/PNG/WebP image.';
    } finally {
      photoInput.disabled = false;
      previewButton.disabled = false;
      saveLinkButton.disabled = false;
    }
  });

  removePhoto.addEventListener('click', () => {
    current.photo = ''; current.photoType = 'image/webp'; photoInput.value = '';
    updatePhotoPreview(); photoStatus.textContent = 'Photo removed.';
  });

  previewButton.addEventListener('click', () => {
    readEditorText();
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(current)); } catch {}
    applyConfig();
    closeDialog(adminModal);
    resetExperienceToIntro();
    startStory();
  });

  function createShareLink() {
    readEditorText();
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(current)); } catch {}
    applyConfig();
    const u = new URL(location.href);
    u.search = ''; u.hash = '';
    u.searchParams.set('n', current.name);
    if (current.from !== defaults.from) u.searchParams.set('from', current.from);
    const hash = new URLSearchParams();
    if (current.note !== defaults.note) hash.set('note', current.note);
    if (current.photo) {
      hash.set('pt', current.photoType === 'image/jpeg' ? 'j' : 'w');
      hash.set('p', current.photo);
    }
    const hashString = hash.toString();
    if (hashString) u.hash = hashString;
    try { history.replaceState({}, '', u); } catch {}
    shareUrl.value = u.href;
    shareBox.hidden = false;
    if (location.protocol === 'file:') {
      shareHelp.textContent = 'This is still a local file. Upload the full project folder to Netlify or GitHub Pages first; then Create share link will produce a public link anyone can open.';
      showToast('Personalization ready — host the folder for a public link');
    } else {
      shareHelp.textContent = current.photo ? 'Ready. The compressed photo is inside this personalized URL, so the recipient can see it on another phone without downloading a file.' : 'Ready. Anyone with this exact URL can open the personalized birthday experience.';
      showToast('Personalized share link created');
    }
  }
  saveLinkButton.addEventListener('click', createShareLink);

  copyLinkButton.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(shareUrl.value); showToast('Link copied'); }
    catch { shareUrl.select(); document.execCommand('copy'); showToast('Link copied'); }
  });
  nativeShareButton.addEventListener('click', async () => {
    if (!shareUrl.value) return;
    try {
      if (navigator.share) await navigator.share({ title: `Happy Birthday, ${current.name}!`, text: 'I made a birthday surprise just for you ✨', url: shareUrl.value });
      else { await navigator.clipboard.writeText(shareUrl.value); showToast('Link copied'); }
    } catch {}
  });

  $$('.modal-close').forEach(btn => btn.addEventListener('click', () => closeDialog(btn.closest('dialog'))));
  [passwordModal, adminModal].forEach(dialog => dialog.addEventListener('click', e => {
    const card = $('.modal-card', dialog);
    if (card && !card.contains(e.target)) closeDialog(dialog);
  }));

  // Small QA helper, harmless in production.
  window.BirthdayDebug = {
    goto(index = 0) { intro.classList.remove('is-active'); story.classList.add('is-active'); renderMoment(Math.max(0, Math.min(moments.length-1, Number(index)||0)), true); },
    reset: resetExperienceToIntro,
    openEditor,
    moments: moments.length,
    duration: BASE_DURATION,
    setPhoto(encoded, type = 'image/webp') { current.photo = encoded || ''; current.photoType = type; updatePhotoPreview(); },
    setPerson(name, from = current.from) { current.name = clean(name,42) || defaults.name; current.from = clean(from,42) || defaults.from; applyConfig(); }
  };

  buildAmbient();
  parseConfig();
  const qaScene = new URLSearchParams(location.search).get('qa');
  if (qaScene !== null) setTimeout(() => window.BirthdayDebug.goto(Number(qaScene)), 80);
})();
