/* script.js - password gate, cinematic intro, emoji rain, nickname rotate, reveal, typewriter, audio control */

/* ---------- Config: allowed nicknames/passwords ---------- */
const allowedPasswords = [
  "Hadia","Jaan","Pabloo","Hayatii","Cutiee Piee","CutieePiee","Sweeto","Kuchii Puchii","Miss Khan","Haduu","Kaloo","Kalooo"
];

/* ---------- Emoji sets per page ---------- */
const emojiSets = {
  home: ["❤️","💖","💘","😘","💋","💝"],
  rose: ["🌹","🌹","🌹","❤️"],
  propose: ["💍","✨","💖","💫"],
  chocolate: ["🍫","🍫","🤎","🍬"],
  teddy: ["🧸","🧸","💞","🫶"],
  promise: ["🤞","💫","🤝","❤️"],
  hug: ["🤗","🤗","🤎","🤍"],
  kiss: ["😘","💋","💋","💖","💞"],
  valentine: ["❤️","💘","💝","💓","💞"],
  sorry: ["🥺","💔","❤️","🤍"]
};

/* ---------- helpers ---------- */
const rand = (min, max) => Math.random() * (max - min) + min;
const el = (s) => document.querySelector(s);

/* ---------- Password Gate ---------- */
(function Gate(){
  const gate = document.createElement('div');
  gate.id = 'gate';
  gate.innerHTML = `
    <div class="gate-card" role="dialog" aria-modal="true" aria-label="Enter secret">
      <h2>One small secret...</h2>
      <p>Yahan Wo Names Password ho sakty hain Jo names apk liya main use karta houn ❤️</p>
      <input id="gateInput" type="text" placeholder="Type your nickname Cuteo" aria-label="nickname">
      <div style="display:flex;gap:10px;justify-content:center">
        <button id="gateOpen">Enter</button>
      </div>
      <p style="margin-top:10px;color:rgba(255,255,255,0.6);font-size:13px">If you feel stuck, try your common nicknames jo main use karta houn💖💗.</p>
    </div>
  `;
  document.body.appendChild(gate);

  const inp = document.getElementById('gateInput');
  const btn = document.getElementById('gateOpen');

  function openIfValid() {
    const v = (inp.value || "").trim();
    if(!v) { inp.style.outline = '2px solid rgba(255,80,120,0.18)'; return; }
    // normalize
    const norm = v.replace(/\s+/g,'').toLowerCase();
    const ok = allowedPasswords.some(p => p.replace(/\s+/g,'').toLowerCase() === norm);
    if(ok){
      gate.remove(); // remove gate
      runIntro();    // start cinematic intro then reveal site
    } else {
      inp.value = '';
      inp.placeholder = 'Not quite — try another nickname';
      inp.style.outline = '2px solid rgba(255,40,80,0.18)';
      // small shake
      document.querySelector('.gate-card').animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}], {duration:320});
    }
  }

  btn.addEventListener('click', openIfValid);
  inp.addEventListener('keydown', (ev) => {
    if(ev.key === 'Enter') openIfValid();
  });

  // focus input
  setTimeout(()=> inp.focus(), 200);
})();

/* ---------- Cinematic Intro ---------- */
function runIntro(){
  // create intro overlay
  const intro = document.createElement('div');
  intro.id = 'intro';
  intro.className = 'show';
  const nick = document.getElementById('nickname')?.textContent || 'My Queen';
  intro.innerHTML = `
    <div class="intro-inner">
      <div class="intro-heart">❤️</div>
      <div class="intro-title">Welcome, ${nick}</div>
      <div class="intro-sub typewriter" data-type="This little world is for you — a tiny, loud, Chota sa Valentines Surprise.">
      </div>
    </div>
  `;
  document.body.appendChild(intro);
  // run typewriter for intro-sub
  (function typeIntro(){
    const node = intro.querySelector('[data-type]');
    const text = node.dataset.type;
    node.textContent = '';
    let i = 0;
    const t = setInterval(()=> {
      node.textContent += text[i++] || '';
      if(i > text.length) clearInterval(t);
    }, 28);
  })();

  // create a small burst of emojis behind intro
  const page = document.body.dataset.page || 'home';
  const set = emojiSets[page] || ["❤️"];
  for(let i=0;i<20;i++){
    setTimeout(()=> createIntroEmoji(set), i*110);
  }

  // after 2.8s to 4.2s remove intro and reveal content, start audio & emoji rain
  const introDuration = 3200 + Math.random()*1200;
  setTimeout(()=>{
    intro.classList.remove('show');
    intro.style.transition = 'opacity .9s ease';
    intro.style.opacity = 0;
    setTimeout(()=> intro.remove(), 900);
    // show audio control if audio present
    initAudioAfterInteraction();
    // start other page behaviors
    startEmojiRain();
    startRevealObserver();
    startTypewriters();
    startNickRotate();
  }, introDuration);
}

/* create ephemeral frontal intro emoji */
function createIntroEmoji(set){
  const elEmoji = document.createElement('div');
  elEmoji.className = 'float-emoji';
  elEmoji.textContent = set[Math.floor(Math.random() * set.length)];
  elEmoji.style.left = (rand(10,90)) + 'vw';
  elEmoji.style.fontSize = Math.floor(rand(26,68)) + 'px';
  elEmoji.style.animationDuration = (rand(3.2,6.5)) + 's';
  elEmoji.style.zIndex = 140;
  document.body.appendChild(elEmoji);
  setTimeout(()=> elEmoji.remove(), 7600);
}

/* ---------- AUDIO control (start after user typed nickname) ---------- */
function initAudioAfterInteraction(){
  const audio = document.getElementById('bgm');
  const audioBtn = document.getElementById('audioControl');
  if(!audio) return;
  // try autoplay (browsers allow audio after user gesture which password entry was)
  audio.play().catch(()=>{ /* ignore */ });

  if(audioBtn){
    audioBtn.style.display = 'inline-flex';
    audioBtn.addEventListener('click', ()=>{
      if(audio.paused){ audio.play(); audioBtn.textContent = 'Pause ♫' }
      else { audio.pause(); audioBtn.textContent = 'Play ♫' }
    });
    // set initial label
    audio.addEventListener('play', ()=> audioBtn.textContent = 'Pause ♫');
    audio.addEventListener('pause', ()=> audioBtn.textContent = 'Play ♫');
  }
}

/* ---------- Emoji Rain (continues) ---------- */
let emojiIntervalRef = null;
function startEmojiRain(){
  // if already running, keep it
  if(emojiIntervalRef) return;
  const page = document.body.dataset.page || 'home';
  const set = emojiSets[page] || ["❤️"];
  const baseInterval = (page === 'home' || page === 'valentine') ? 240 : 420;

  function spawnOnce(){
    const el = document.createElement('div');
    el.className = 'float-emoji';
    el.textContent = set[Math.floor(Math.random() * set.length)];
    el.style.left = (rand(-5,105)) + 'vw';
    el.style.fontSize = Math.floor(rand(18,46)) + 'px';
    el.style.animationDuration = (rand(5.6,10.6)) + 's';
    el.style.opacity = 1 - Math.random()*0.12;
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), Math.ceil(parseFloat(el.style.animationDuration || 8)*1000) + 300);
  }

  // gentle initial burst
  for(let i=0;i<5;i++) setTimeout(spawnOnce, i*140);
  emojiIntervalRef = setInterval(spawnOnce, baseInterval);

  // stop during hidden tab
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden && emojiIntervalRef){ clearInterval(emojiIntervalRef); emojiIntervalRef = null; }
    else if(!document.hidden && !emojiIntervalRef){ emojiIntervalRef = setInterval(spawnOnce, baseInterval); }
  });
}

/* ---------- Nickname rotation (if not already started) ---------- */
let nickIntervalRef = null;
function startNickRotate(){
  if(nickIntervalRef) return;
  const names = [
    "Jaan 💖","Miss Khan 👑","Pabloo 😘","Hayatii 🌸",
    "Cutiee Piee 🥰","Sweeto 🍫","Kuchii Puchii 🧸","My Little Princess 👸"
  ];
  let idx = 0;
  const tick = () => {
    const dom = document.getElementById('nickname');
    if(dom) dom.textContent = names[idx];
    idx = (idx + 1) % names.length;
  };
  tick();
  nickIntervalRef = setInterval(tick, 2600);
}

/* ---------- Reveal observer (for .reveal) ---------- */
let revealObserverInited = false;
function startRevealObserver(){
  if(revealObserverInited) return;
  revealObserverInited = true;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting) en.target.classList.add('show');
    });
  }, {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

/* ---------- Typewriter for elements with data-type ---------- */
function startTypewriters(){
  const els = document.querySelectorAll('[data-type]');
  els.forEach(el=>{
    if(el.dataset._typed) return; // avoid re-run
    el.dataset._typed = '1';
    const full = el.dataset.type;
    el.textContent = '';
    let i=0;
    const t = setInterval(()=>{
      if(i>=full.length){ clearInterval(t); el.style.borderRight='none'; return }
      el.textContent += full[i++];
    }, 18);
  });
}

/* ---------- Init small behaviors if gate was bypassed for dev (not recommended) ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // If gate was removed or not present (e.g., in dev), start behaviors
  // But we wait until intro is complete normally.
  // if gate not present -> start without intro
  if(!document.getElementById('gate')) {
    // rare quick fallback: start after small delay so DOM settles
    setTimeout(()=> {
      initAudioAfterInteraction();
      startEmojiRain();
      startRevealObserver();
      startTypewriters();
      startNickRotate();
    }, 900);
  }
});

/* ---------- small accessibility: focus outlines for keyboard nav ---------- */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Tab') document.body.classList.add('show-focus-outline');
});/* ===== Extra helpers (if not present earlier) ===== */
const _rand = (min, max) => Math.random() * (max - min) + min;

/* ===== Sorry page behavior: forgive buttons, moving not-now, OK flow, smile modal ===== */
(function SorryPageExtra(){
  // Only run on the sorry page
  if(!document.body.dataset.page || document.body.dataset.page !== 'sorry') return;

  const yes = document.getElementById('forgiveYes');
  const no = document.getElementById('forgiveNo');
  const ok = document.getElementById('mischiefOk');
  const smileModal = document.getElementById('smileModal');
  const smileClose = document.getElementById('smileClose');
  const smileText = document.getElementById('smileText');

  let mischiefInterval = null;
  let textInterval = null;
  let moving = false;

  // Phrases to cycle through on the Not Now button
  const notNowPhrases = [
    "please...","gimme one last chance","I'm really sorry","please forgive me",
    "lovey-dovey apology","I messed up","just one hug?","I need you please",
    "please gimme one last chance","forgive Pookiee?"
  ];

  // Compliments/lines to make her smile
  const compliments = [
    "Main Qurban Apnii Jaan k, Jaan Mari.",
    "Your laugh is my favourite song.",
    "You make the darkest days feel cozy.",
    "I love the way you say my name Hyee Jab Awaz Atii. Pookie...🫠💗💖",
    "Being mine looks so good on you.Main Sadqy Jaoun apk jaan mari💖💗"
  ];

  // YES click: show smile sequence
  yes.addEventListener('click', (e)=>{
    e.preventDefault();
    triggerSmileSequence("Yes! Thank you — this made me the happiest.");
  });

  // NO click: start the mischief (button moves & text cycles), show OK button
  no.addEventListener('click', (e)=>{
    e.preventDefault();
    if(moving) return;
    startNotNowMischief();
  });

  // OK click: stop mischief and show a final plea modal (then show smile sequence)
 
    // show small final plea then the smile sequence
    

  // When modal close pressed
  if(smileClose) smileClose.addEventListener('click', ()=> {
    hideSmileModal();
  });

  /* ---------- mischief: move & change text ---------- */
  function startNotNowMischief(){
    moving = true;
    no.classList.add('moving');
    // show OK button
    ok.style.display = 'inline-flex';
    ok.setAttribute('aria-hidden','false');

    // begin cycling button text
    let phraseIdx = 0;
    textInterval = setInterval(()=>{
      no.textContent = notNowPhrases[phraseIdx % notNowPhrases.length];
      phraseIdx++;
    }, 1200);

    // move around randomly every 700ms
    mischiefInterval = setInterval(()=>{
      moveButtonToRandom(no);
    }, 700);

    // also make it jump on mouseover for extra trickiness
    no.addEventListener('mouseenter', onMouseAvoid);
    no.addEventListener('click', onNoClicked);
  }

  function stopNotNowMischief(){
    moving = false;
    no.classList.remove('moving');
    clearInterval(mischiefInterval);
    mischiefInterval = null;
    clearInterval(textInterval);
    textInterval = null;
    // reset text
    no.textContent = 'Not now';
    // hide ok
    ok.style.display = 'none';
    ok.setAttribute('aria-hidden','true');
    // put button back near original area (bottom of forgive area)
    no.style.position = '';
    no.style.left = '';
    no.style.top = '';
    no.removeEventListener('mouseenter', onMouseAvoid);
    no.removeEventListener('click', onNoClicked);
  }

  function onMouseAvoid(e){
    // small dodge movement
    moveButtonToRandom(e.currentTarget, 140);
  }

  function onNoClicked(e){
    // if user manages to click it (rare), nudge it away
    moveButtonToRandom(e.currentTarget, 80);
  }

  function moveButtonToRandom(target, jitter=480){
    // Calculate a random position within viewport but avoid edges
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    // keep inside margins
    const margin = 80;
    const left = Math.min(Math.max(_rand(margin, vw - margin), 10), vw - 60);
    const top = Math.min(Math.max(_rand(100, vh - 200), 40), vh - 120);
    target.style.left = left + 'px';
    target.style.top = top + 'px';
    // ensure fixed position
    target.style.position = 'fixed';
    // small random rotation for fun
    target.style.transform = `rotate(${Math.floor(_rand(-18,18))}deg)`;
  }

  /* ---------- Smile sequence (common for Yes and after OK) ---------- */
  function triggerSmileSequence(introMessage){
    // stop mischief if running
    if(moving) stopNotNowMischief();

    // show modal
    showSmileModal();

    // set the typewriter text to the introMessage first, then the compliments
    const typed = document.getElementById('smileText');
    typed.dataset.type = introMessage + "\n\n" + compliments.join("  •  ");
    typed.textContent = '';
    // start the typewriter (re-use earlier typewriter helper if present)
    let i = 0;
    const txt = typed.dataset.type;
    const tstamp = setInterval(()=>{
      if(i >= txt.length){ clearInterval(tstamp); typed.style.borderRight='none'; return; }
      typed.textContent += txt[i++];
    }, 18);

    // small hearts/confetti burst
    const heartsContainer = document.getElementById('smileHearts');
    if(heartsContainer){
      // create several hearts that float up
      for(let j=0;j<18;j++){
        const h = document.createElement('div');
        h.className = 'modal-heart';
        h.textContent = ['💖','💝','❤️','💞'][Math.floor(_rand(0,4))];
        h.style.left = (_rand(20,80)) + '%';
        h.style.top = (_rand(60,90)) + '%';
        h.style.fontSize = Math.floor(_rand(16,34)) + 'px';
        h.style.animationDuration = ( _rand(2.2,4.2) ) + 's';
        heartsContainer.appendChild(h);
        // remove after animation
        setTimeout(()=> h.remove(), 4800);
      }
    }

    // make emoji pulse
    const emoji = document.getElementById('smileEmoji');
    if(emoji){
      emoji.classList.add('pop');
      setTimeout(()=> emoji.classList.remove('pop'), 3000);
    }
  }

  function showSmileModal(){
    smileModal.classList.add('show');
    smileModal.setAttribute('aria-hidden','false');
  }
  function hideSmileModal(){
    smileModal.classList.remove('show');
    smileModal.setAttribute('aria-hidden','true');
  }

  // small accessibility: allow Escape to close modal
  document.addEventListener('keydown', (ev)=>{
    if(ev.key === 'Escape' && smileModal.classList.contains('show')) hideSmileModal();
  });

})();

