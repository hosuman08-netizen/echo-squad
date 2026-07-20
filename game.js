/* Echo Squad — 탕탕특공대/VS 성공 요소 카피 + Legion 강화
 * Hybrid casual: 원탭 이동 · 자동사격 · 레벨3택 · 웨이브 · 메타젬 · 가상가챠 · share-peak
 * Fictional entertainment · prominent rates · 18+
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const META_KEY = 'echoSquadMeta_v1';
  const SHARE_BASE = 'https://hosuman08-netizen.github.io/echo-squad/';

  const HEROES = [
    { id: 'scout', emo: '🔫', name: '스카우트', color: '#5eead4', dmg: 1, spd: 1.15, firerate: 1.1 },
    { id: 'tank', emo: '🛡️', name: '가디언', color: '#93c5fd', dmg: 0.9, spd: 0.9, firerate: 0.95, hp: 1 },
    { id: 'mage', emo: '✨', name: '아케인', color: '#c4b5fd', dmg: 1.25, spd: 1, firerate: 0.85 },
    { id: 'blade', emo: '🗡️', name: '블레이드', color: '#fca5a5', dmg: 1.1, spd: 1.2, firerate: 1.2 }
  ];

  const POOL = [
    { id: 'dmg', name: '화력 +18%', apply: (s) => { s.dmgM *= 1.18; } },
    { id: 'rate', name: '연사 +15%', apply: (s) => { s.rateM *= 1.15; } },
    { id: 'spd', name: '이동 +12%', apply: (s) => { s.spdM *= 1.12; } },
    { id: 'multi', name: '멀티샷 +1', apply: (s) => { s.multi += 1; } },
    { id: 'pierce', name: '관통 +1', apply: (s) => { s.pierce += 1; } },
    { id: 'magnet', name: '자석 범위', apply: (s) => { s.magnet += 28; } },
    { id: 'orbit', name: '궤도 블레이드', apply: (s) => { s.orbit = true; s.orbitDmg = (s.orbitDmg || 8) + 6; } },
    { id: 'nova', name: '처치 노바', apply: (s) => { s.nova = true; } },
    { id: 'vamp', name: '흡혈 8%', apply: (s) => { s.vamp += 0.08; } },
    { id: 'crit', name: '치명 +12%', apply: (s) => { s.crit += 0.12; } },
    { id: 'echo', name: '에코 분신탄', apply: (s) => { s.echo = true; } },
    { id: 'freeze', name: '슬로우 장판', apply: (s) => { s.slow = true; } }
  ];

  const MUTATIONS = [
    { name: '광폭', desc: '화력×1.4 · 피격+20%', apply: (s) => { s.dmgM *= 1.4; s.hpMax = Math.max(1, s.hpMax - 1); } },
    { name: '시체폭발', desc: '처치 시 소형 폭발', apply: (s) => { s.nova = true; s.novaR = 42; } },
    { name: '타임워프', desc: '연사×1.35', apply: (s) => { s.rateM *= 1.35; } },
    { name: '황금자석', desc: '자석 극대화 · XP+10%', apply: (s) => { s.magnet += 60; s.xpM *= 1.1; } }
  ];

  function loadMeta() {
    try {
      const m = JSON.parse(localStorage.getItem(META_KEY) || '{}');
      return {
        gems: m.gems || 0,
        bestKills: m.bestKills || 0,
        bestWave: m.bestWave || 0,
        runs: m.runs || 0,
        streak: m.streak || 0,
        lastDay: m.lastDay || '',
        unlocked: m.unlocked || ['scout', 'tank'],
        pity: m.pity || 0,
        hero: m.hero || 'scout'
      };
    } catch (e) {
      return { gems: 0, bestKills: 0, bestWave: 0, runs: 0, streak: 0, lastDay: '', unlocked: ['scout', 'tank'], pity: 0, hero: 'scout' };
    }
  }
  function saveMeta(m) {
    localStorage.setItem(META_KEY, JSON.stringify(m));
  }
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  let meta = loadMeta();
  // streak + Duolingo freeze (1 miss / 7d if streak≥3)
  (function streak() {
    const t = today();
    if (meta.lastDay === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yk = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
    const y2d = new Date(); y2d.setDate(y2d.getDate() - 2);
    const y2 = y2d.getFullYear() + '-' + (y2d.getMonth() + 1) + '-' + y2d.getDate();
    let froze = false;
    if (meta.lastDay && meta.lastDay !== yk && meta.lastDay === y2 && (meta.streak || 0) >= 3) {
      const ready = !meta.shieldLast || ((new Date(t) - new Date(meta.shieldLast)) / 86400000) >= 7;
      if (ready) {
        meta.shieldLast = t;
        meta.lastDay = yk;
        froze = true;
        try {
          setTimeout(function () {
            const tip = document.createElement('div');
            tip.textContent = '🛡️ 연속 보호막 · ' + meta.streak + '일 유지';
            tip.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#16121c;color:#e8c56a;padding:10px 16px;border-radius:12px;z-index:9999;font-size:13px;border:1px solid #e8c56a55';
            document.body.appendChild(tip);
            setTimeout(function () { tip.remove(); }, 3000);
          }, 600);
        } catch (e) {}
        try { if (window.legionTrack) legionTrack('streak_freeze', { count: meta.streak }); } catch (e) {}
      }
    }
    if (meta.lastDay === yk) meta.streak = (meta.streak || 0) + 1;
    else meta.streak = 1;
    meta.lastDay = t;
    saveMeta(meta);
    try { if (window.legionTrack) legionTrack('streak', { count: meta.streak, froze: froze }); } catch (e) {}
  })();

  const canvas = $('c');
  const ctx = canvas.getContext('2d');
  let W = 390, H = 640;
  function fit() {
    const maxW = Math.min(420, window.innerWidth);
    const maxH = window.innerHeight;
    const scale = Math.min(maxW / 390, maxH / 640);
    W = 390; H = 640;
    canvas.width = W; canvas.height = H;
    canvas.style.width = (W * scale) + 'px';
    canvas.style.height = (H * scale) + 'px';
  }
  fit();
  window.addEventListener('resize', fit);

  let selectedHero = meta.hero || 'scout';
  let mode = 'sprint'; // sprint | classic
  let running = false;
  let paused = false;
  let raf = 0;

  // world
  let player, bullets, enemies, orbs, particles, floaters;
  let stats, tLeft, wave, kills, spawnAcc, fireAcc, elapsed;
  let pointer = { x: W / 2, y: H / 2, down: false };
  let shake = 0;

  function heroOf(id) {
    return HEROES.find((h) => h.id === id) || HEROES[0];
  }

  
  function dailyMissionLabel(){
    try{
      var k='echoDaily_'+today();
      var d=JSON.parse(localStorage.getItem(k)||'{"kills":0,"runs":0,"share":0}');
      var a=d.kills>=30?1:0,b=d.runs>=1?1:0,c=d.share>=1?1:0;
      var bits=(a?'K':'k'+(d.kills||0))+(b?'R':'r')+(c?'S':'s');
      return (a+b+c)+'/3'+(a+b+c>=3?' ✓ ·+15💎':' ·'+bits);
    }catch(e){return '0/3';}
  }
  function bumpDaily(kind){
    try{
      var k='echoDaily_'+today();
      var d=JSON.parse(localStorage.getItem(k)||'{"kills":0,"runs":0,"share":0}');
      if(kind==='kills') d.kills=(d.kills||0)+1;
      if(kind==='run') d.runs=1;
      if(kind==='share') d.share=1;
      localStorage.setItem(k,JSON.stringify(d));
      if((d.kills>=30)+(d.runs>=1)+(d.share>=1)>=3){
        var mk='echoDailyReward_'+today();
        if(!localStorage.getItem(mk)){ meta.gems+=15; localStorage.setItem(mk,'1'); saveMeta(meta); }
      }
    }catch(e){}
  }

  function renderLobby() {
    const shieldReady = !meta.shieldLast || ((new Date(today()) - new Date(meta.shieldLast)) / 86400000) >= 7;
    $('metaBar').innerHTML =
      '<span class="chip">💎 <b>' + meta.gems + '</b></span>' +
      '<span class="chip">🔥 스트릭 <b>' + meta.streak + '</b>' + ((meta.streak || 0) >= 3 && shieldReady ? ' 🛡️' : '') + '</span>' +
      '<span class="chip">🏆 최고 <b>' + meta.bestKills + '</b>kill</span>' +
      '<span class="chip">W최고 <b>' + (meta.bestWave||0) + '</b></span>' +
      '<span class="chip">runs <b>' + meta.runs + '</b></span>' +
      '<span class="chip">📋 일일 <b>' + dailyMissionLabel() + '</b></span>' +'<span class="chip">정진 목표 <b>' + ((meta.bestKills||0)+10) + 'kill</b></span>';
    const box = $('heroPick');
    box.innerHTML = '';
    HEROES.forEach((h) => {
      const locked = meta.unlocked.indexOf(h.id) < 0;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'hero' + (selectedHero === h.id ? ' on' : '');
      el.innerHTML = '<span class="emo">' + h.emo + '</span>' + h.name + (locked ? '<br><small>🔒</small>' : '');
      el.onclick = () => {
        if (locked) {
          if (meta.gems >= 40) {
            meta.gems -= 40;
            meta.unlocked.push(h.id);
            saveMeta(meta);
            renderLobby();
            track('hero_unlock', { id: h.id });
          } else {
            alert('해금 💎40 필요 (한 판 보상으로 모으세요)');
          }
          return;
        }
        selectedHero = h.id;
        meta.hero = h.id;
        saveMeta(meta);
        renderLobby();
      };
      box.appendChild(el);
    });
  }

  function track(ev, data) {
    try {
      if (window.legionTrack) window.legionTrack(ev, data || {});
    } catch (e) {}
  }

  function startGame(m) {
    mode = m;
    fit();
    const h = heroOf(selectedHero);
    stats = {
      dmgM: h.dmg,
      rateM: h.firerate,
      spdM: h.spd,
      multi: 1,
      pierce: 0,
      magnet: 40,
      orbit: false,
      orbitDmg: 0,
      nova: false,
      novaR: 34,
      vamp: 0,
      crit: 0.05,
      echo: false,
      slow: false,
      xpM: 1,
      hpMax: 3 + (h.hp || 0),
      hp: 3 + (h.hp || 0),
      xp: 0,
      xpNeed: 12,
      lv: 1
    };
    player = { x: W / 2, y: H * 0.62, r: 12, color: h.color, emo: h.emo, inv: 0 };
    bullets = []; enemies = []; orbs = []; particles = []; floaters = [];
    tLeft = mode === 'sprint' ? 90 : 180;
    wave = 1; kills = 0; spawnAcc = 0; fireAcc = 0; elapsed = 0; shake = 0;
    running = true; paused = false; window._echoRevived = false;
    $('boot').hidden = true;
    $('c').hidden = false;
    $('hud').hidden = false;
    $('result').hidden = true;
    $('levelup').hidden = true;
    $('pause').hidden = true;
    track('run_start', { mode: mode, hero: selectedHero }); try{bumpDaily('run');}catch(e){}
    try{ if(!localStorage.getItem('echoFirstTip')){ localStorage.setItem('echoFirstTip','1');
      floaters.push({x:W/2,y:H*0.25,text:'화면 드래그로 이동 · 자동 사격',life:90,color:'#e8c56a'}); } }catch(e){}
    loop(performance.now());
  }

  function endGame(reason) {
    running = false;
    cancelAnimationFrame(raf);
    meta.runs += 1;
    const gems = Math.max(2, Math.floor(kills / 8) + wave + (reason === 'clear' ? 12 : 0) + (kills>=50?5:0));
    meta.gems += gems;
    if (kills > meta.bestKills) meta.bestKills = kills;
    if (wave > meta.bestWave) meta.bestWave = wave;
    saveMeta(meta);

    const isPB = kills >= meta.bestKills && kills > 0;
    $('resTitle').textContent = reason === 'clear' ? '✅ 타임 클리어!' : reason === 'dead' ? '💀 전사' : '종료';
    try{
      var tbKey='echoTodayBest_'+today();
      var tb=+(localStorage.getItem(tbKey)||0);
      if(kills>tb){ localStorage.setItem(tbKey,String(kills)); tb=kills; }
      window._echoTodayBest=tb;
    }catch(e){ window._echoTodayBest=kills; }
    try{ if(kills) bumpDaily('kills'); }catch(e){}
    // kills mission needs count of kills not +1 per end — fix: set absolute kills max for day
    try{
      var k='echoDaily_'+today();
      var d=JSON.parse(localStorage.getItem(k)||'{"kills":0,"runs":0,"share":0}');
      d.kills=Math.max(d.kills||0, kills);
      localStorage.setItem(k,JSON.stringify(d));
      if((d.kills>=30)+(d.runs>=1)+(d.share>=1)>=3){
        var mk='echoDailyReward_'+today();
        if(!localStorage.getItem(mk)){ meta.gems+=15; localStorage.setItem(mk,'1'); saveMeta(meta); }
      }
    }catch(e){}
    $('resBody').innerHTML =
      '처치 <b>' + kills + '</b> · 웨이브 <b>' + wave + '</b> · Lv <b>' + stats.lv + '</b><br>' +
      '획득 💎 <b>' + gems + '</b> · 누적 💎 ' + meta.gems +
      '<br><span style="color:#a78bfa">오늘 최고 ' + (window._echoTodayBest||kills) + 'kill · 일일 ' + dailyMissionLabel() + '</span>' +
      (isPB ? '<br><span style="color:#e8c56a">🏆 개인 최고 갱신! 정진!</span>' : (kills>=30?'<br><span style="color:#67e8f9">고득점 존</span>':''));

    const sp = $('sharePeak');
    sp.innerHTML =
      '<p>✨ ' + (isPB ? '개인 최고 직후 — 지금 공유하면 K가 붙어요' : '지금이 공유 타이밍') + '</p>' +
      '<button type="button" class="primary" id="btnShare">결과 공유</button>' +
      '<button type="button" class="secondary" id="btnPipe">☕ 후원 문의</button>' +
      '<div id="moneyPipe" style="margin-top:10px;padding:10px;border:1px solid #e8c56a44;border-radius:12px;background:#16121c;font-size:12px">' +
      '<div style="color:#e8c56a;font-weight:700;margin-bottom:4px">💎 한 판 더 · 크로스</div>' +
      '<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/daedalus-conquest/?utm_source=echo&utm_medium=pipe">⚔️ Daedalus</a>' +
      '<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/gochess/?utm_source=echo&utm_medium=pipe">♟️ GoChess</a>' +
      '<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/legion-hub/?utm_source=echo&utm_medium=pipe">🎮 Arcade</a>' +
      '</div>';
    $('btnShare').onclick = shareResult;
    $('btnPipe').onclick = () => {
      location.href = 'mailto:hoyashi95@gmail.com?subject=%5B%EC%97%90%EC%BD%94%ED%8A%B9%EA%B3%B5%EB%8C%80%5D%20%ED%9B%84%EC%9B%90';
    };

    $('c').hidden = true;
    $('hud').hidden = true;
    $('result').hidden = false;
    track('run_end', { kills: kills, wave: wave, reason: reason, gems: gems, pb: isPB });
    track('share_peak_shown', { kills: kills, pb: isPB });
    try { track('money_pipe_shown', { app: 'echo', kills: kills }); } catch (e) {}

    // codex relic
    try {
      const key = 'fateCodex';
      const codex = JSON.parse(localStorage.getItem(key) || '[]');
      codex.unshift({
        ts: new Date().toISOString().slice(0, 16),
        type: 'echo-squad',
        text: 'W' + wave + ' · ' + kills + 'kill · ' + heroOf(selectedHero).name,
        score: Math.min(99, 40 + Math.floor(kills / 3)),
        power: Math.min(99, kills)
      });
      localStorage.setItem(key, JSON.stringify(codex.slice(0, 18)));
    } catch (e) {}
  }

  function shareResult() {
    const text = '에코특공대 ' + kills + 'kill W' + wave + ' · 브라우저 생존 스웜 ' + SHARE_BASE;
    track('share_peak', { kills: kills }); try{bumpDaily('share');}catch(e){}
    if (navigator.share) {
      navigator.share({ title: '에코특공대', text: text, url: SHARE_BASE }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('복사됨 — 붙여넣기 공유!'));
    } else {
      prompt('복사:', text);
    }
  }

  function xpGain(n) {
    stats.xp += n * stats.xpM;
    while (stats.xp >= stats.xpNeed) {
      stats.xp -= stats.xpNeed;
      stats.lv += 1;
      stats.xpNeed = Math.floor(12 * Math.pow(1.22, stats.lv - 1));
      if (stats.lv === 5 || stats.lv === 10 || stats.lv === 15) offerMutation();
      else offerLevelUp();
    }
    $('xpFill').style.width = Math.min(100, (stats.xp / stats.xpNeed) * 100) + '%';
    $('hudLv').textContent = 'Lv' + stats.lv;
  }

  function offerLevelUp() {
    paused = true;
    const picks = shuffle(POOL.slice()).slice(0, 3);
    const box = $('pick3');
    box.innerHTML = '';
    picks.forEach((p) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pick';
      b.innerHTML = '<b>' + p.name + '</b>';
      b.onclick = () => {
        p.apply(stats);
        $('levelup').hidden = true;
        paused = false;
        track('levelup_pick', { id: p.id, lv: stats.lv });
      };
      box.appendChild(b);
    });
    $('levelup').hidden = false;
  }

  function offerMutation() {
    paused = true;
    const m = MUTATIONS[Math.floor(Math.random() * MUTATIONS.length)];
    const box = $('pick3');
    box.innerHTML = '';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick';
    b.innerHTML = '<b>🧬 변이: ' + m.name + '</b><br><small>' + m.desc + '</small>';
    b.onclick = () => {
      m.apply(stats);
      $('levelup').hidden = true;
      paused = false;
      track('mutation', { name: m.name });
      // still offer normal pick after
      setTimeout(offerLevelUp, 80);
    };
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'pick';
    skip.textContent = '변이 거절 → 일반 강화';
    skip.onclick = () => {
      $('levelup').hidden = true;
      offerLevelUp();
    };
    box.appendChild(b);
    box.appendChild(skip);
    $('levelup').querySelector('h2').textContent = '변이 이벤트!';
    $('levelup').hidden = false;
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * W; y = -12; }
    else if (edge === 1) { x = Math.random() * W; y = H + 12; }
    else if (edge === 2) { x = -12; y = Math.random() * H; }
    else { x = W + 12; y = Math.random() * H; }
    const elite = Math.random() < 0.06 + wave * 0.008;
    const hp = (elite ? 28 : 8) + wave * (elite ? 6 : 2.2);
    const spd = (elite ? 0.55 : 0.7 + Math.random() * 0.35) * (1 + wave * 0.03);
    enemies.push({
      x: x, y: y, r: elite ? 16 : 10 + Math.random() * 4,
      hp: hp, max: hp, spd: spd, elite: elite,
      color: elite ? '#f472b6' : '#fb7185'
    });
  }

  function nearestEnemy() {
    let best = null, bd = 1e9;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      const d = (e.x - player.x) * (e.x - player.x) + (e.y - player.y) * (e.y - player.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  function fire() {
    const t = nearestEnemy();
    if (!t) return;
    const ang = Math.atan2(t.y - player.y, t.x - player.x);
    const n = stats.multi;
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * 0.12;
      const a = ang + spread;
      bullets.push({
        x: player.x, y: player.y,
        vx: Math.cos(a) * 7.2, vy: Math.sin(a) * 7.2,
        r: 3.5, life: 55, pierce: stats.pierce,
        dmg: 10 * stats.dmgM * (Math.random() < stats.crit ? 2 : 1)
      });
      if (stats.echo && Math.random() < 0.35) {
        bullets.push({
          x: player.x, y: player.y,
          vx: Math.cos(a + 0.4) * 6, vy: Math.sin(a + 0.4) * 6,
          r: 3, life: 40, pierce: 0, dmg: 6 * stats.dmgM
        });
      }
    }
  }

  function boom(x, y, r, dmg) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy < r * r) {
        e.hp -= dmg;
        if (e.hp <= 0) killEnemy(i, e);
      }
    }
    for (let k = 0; k < 8; k++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
        life: 18, color: '#fde68a'
      });
    }
    shake = 6;
  }

  function killEnemy(i, e) {
    enemies.splice(i, 1);
    kills += 1; try{ if(kills%5===0) bumpDaily('kills'); if(kills%25===0) floaters.push({x:player.x,y:player.y-20,text:kills+' KILLS',life:45,color:'#e8c56a'}); }catch(e){}
    const xp = e.elite ? 6 : 2;
    orbs.push({ x: e.x, y: e.y, r: 5, xp: xp, life: 400 });
    if (Math.random() < 0.04) orbs.push({ x: e.x, y: e.y, r: 7, xp: 0, meat: true, life: 300 });
    if (stats.nova) boom(e.x, e.y, stats.novaR || 34, 8 * stats.dmgM);
    if (stats.vamp > 0 && Math.random() < stats.vamp && stats.hp < stats.hpMax) {
      stats.hp += 1;
    }
    floaters.push({ x: e.x, y: e.y, text: '+' + xp, life: 30, color: '#5eead4' });
  }

  let last = 0;
  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (paused) return;
    const dt = Math.min(0.033, (now - (last || now)) / 1000);
    last = now;
    update(dt);
    draw();
  }

  function update(dt) {
    elapsed += dt;
    tLeft -= dt;
    if (tLeft <= 0) {
      endGame('clear');
      return;
    }

    // wave
    const newWave = 1 + Math.floor(elapsed / 18);
    if (newWave !== wave) {
      wave = newWave;
      floaters.push({ x: W / 2, y: H * 0.3, text: 'WAVE ' + wave, life: 50, color: '#e8c56a' }); window._ggWaveBanner=1;
      track('wave', { wave: wave });
    }

    // spawn
    const rate = 0.55 + wave * 0.12;
    spawnAcc += dt * rate;
    while (spawnAcc > 1) {
      spawnAcc -= 1;
      spawnEnemy();
      if (wave > 3 && Math.random() < 0.25) spawnEnemy();
    }

    // move player toward pointer
    if (pointer.down || true) {
      const tx = pointer.x, ty = pointer.y;
      const dx = tx - player.x, dy = ty - player.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = 2.6 * stats.spdM;
      if (d > 4) {
        player.x += (dx / d) * sp;
        player.y += (dy / d) * sp;
      }
      player.x = Math.max(16, Math.min(W - 16, player.x));
      player.y = Math.max(16, Math.min(H - 16, player.y));
    }
    if (player.inv > 0) player.inv -= dt;

    // fire
    fireAcc += dt * (2.2 * stats.rateM);
    while (fireAcc > 1) {
      fireAcc -= 1;
      fire();
    }

    // orbit blades
    if (stats.orbit) {
      const ang = elapsed * 3.2;
      for (let k = 0; k < 2; k++) {
        const a = ang + k * Math.PI;
        const ox = player.x + Math.cos(a) * 34;
        const oy = player.y + Math.sin(a) * 34;
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          if (Math.hypot(e.x - ox, e.y - oy) < e.r + 8) {
            e.hp -= stats.orbitDmg * dt * 8;
            if (e.hp <= 0) killEnemy(i, e);
          }
        }
      }
    }

    // bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx; b.y += b.vy; b.life -= 1;
      if (b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
        bullets.splice(i, 1);
        continue;
      }
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
          e.hp -= b.dmg;
          if (stats.slow) e.spd *= 0.985;
          if (b.pierce > 0) b.pierce -= 1;
          else { bullets.splice(i, 1); break; }
          if (e.hp <= 0) killEnemy(j, e);
        }
      }
    }

    // enemies chase
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dx = player.x - e.x, dy = player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      e.x += (dx / d) * e.spd;
      e.y += (dy / d) * e.spd;
      if (player.inv <= 0 && d < e.r + player.r) {
        stats.hp -= 1;
        player.inv = 0.9;
        shake = 10;
        floaters.push({ x: player.x, y: player.y - 20, text: '-1', life: 30, color: '#ff5a6a' });
        if (stats.hp <= 0) {
          if (!window._echoRevived && (meta.gems||0) >= 5) {
            window._echoRevived = true;
            meta.gems -= 5; saveMeta(meta);
            stats.hp = 1; player.inv = 1.5; shake = 8;
            floaters.push({ x: player.x, y: player.y - 24, text: 'REVIVE -5💎', life: 40, color: '#e8c56a' });
            try { track('revive', {}); } catch (e) {}
          } else {
            endGame('dead');
            return;
          }
        }
      }
    }

    // orbs magnet
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i];
      o.life -= 1;
      const dx = player.x - o.x, dy = player.y - o.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < stats.magnet) {
        o.x += (dx / d) * 4.5;
        o.y += (dy / d) * 4.5;
      }
      if (d < player.r + o.r + 4) {
        if (o.meat) {
          if (stats.hp < stats.hpMax) stats.hp += 1;
          floaters.push({ x: player.x, y: player.y, text: 'meat', life: 24, color: '#fca5a5' });
        } else xpGain(o.xp);
        orbs.splice(i, 1);
      } else if (o.life <= 0) orbs.splice(i, 1);
    }

    // particles / floaters
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 1;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      floaters[i].y -= 0.6;
      floaters[i].life -= 1;
      if (floaters[i].life <= 0) floaters.splice(i, 1);
    }
    if (shake > 0) shake *= 0.85;

    // HUD
    const m = Math.floor(tLeft / 60);
    const s = Math.floor(tLeft % 60);
    $('hudTime').textContent = m + ':' + String(s).padStart(2, '0');
    $('hudWave').textContent = 'W' + wave;
    $('hudKills').textContent = kills + ' kill';
    $('hudHp').textContent = '❤'.repeat(Math.max(0, stats.hp)) + '♡'.repeat(Math.max(0, stats.hpMax - stats.hp));
    if (stats.hp === 1 && !window._hpWarn) { window._hpWarn = 1; floaters.push({ x: player.x, y: player.y - 30, text: '위험!', life: 40, color: '#ff5a6a' }); }
    if (stats.hp > 1) window._hpWarn = 0;
    const combo = 1 + Math.min(4, Math.floor(kills / 40));
    $('hudCombo').textContent = '×' + combo + (combo>=3?'!':'');
    // soft combo: base dmg * combo, store base once
    if (stats._baseDmgM == null) stats._baseDmgM = stats.dmgM;
    stats.dmgM = stats._baseDmgM * (1 + (combo - 1) * 0.08);
    $('xpFill').style.width = Math.min(100, (stats.xp / stats.xpNeed) * 100) + '%';
  }

  function draw() {
    const sx = (Math.random() - 0.5) * shake;
    const sy = (Math.random() - 0.5) * shake;
    ctx.save();
    ctx.translate(sx, sy);
    // bg grid
    ctx.fillStyle = '#0d1018';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(80,90,120,0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // orbs
    orbs.forEach((o) => {
      ctx.beginPath();
      ctx.fillStyle = o.meat ? '#fca5a5' : '#5eead4';
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // enemies
    enemies.forEach((e) => {
      ctx.beginPath();
      ctx.fillStyle = e.color;
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
      if (e.elite) {
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // hp
      if (e.hp < e.max) {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(e.x - 10, e.y - e.r - 6, 20, 3);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(e.x - 10, e.y - e.r - 6, 20 * (e.hp / e.max), 3);
      }
    });

    // bullets
    ctx.fillStyle = '#fde68a';
    bullets.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // orbit
    if (stats.orbit) {
      const ang = elapsed * 3.2;
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 2;
      for (let k = 0; k < 2; k++) {
        const a = ang + k * Math.PI;
        const ox = player.x + Math.cos(a) * 34;
        const oy = player.y + Math.sin(a) * 34;
        ctx.beginPath();
        ctx.arc(ox, oy, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // player
    ctx.beginPath();
    ctx.fillStyle = player.inv > 0 ? 'rgba(255,255,255,0.5)' : player.color;
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.emo, player.x, player.y);

    // particles
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life / 18);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.globalAlpha = 1;
    });
    floaters.forEach((f) => {
      ctx.globalAlpha = Math.max(0, f.life / 50);
      ctx.fillStyle = f.color;
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }

  // input
  function setPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * W;
    pointer.y = ((clientY - rect.top) / rect.height) * H;
  }
  canvas.addEventListener('pointerdown', (e) => {
    pointer.down = true;
    setPointer(e.clientX, e.clientY);
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    setPointer(e.clientX, e.clientY);
  });
  canvas.addEventListener('pointerup', () => { pointer.down = false; });

  // gacha
  function doGacha() {
    if (meta.gems < 10) {
      alert('소환 💎10 필요');
      return;
    }
    meta.gems -= 10;
    meta.pity += 1;
    // rates: SSR 3 SR 12 R 35 N 50 — no hard pity (kompu ban); soft showcase only
    const r = Math.random() * 100;
    let rarity, name, unlock = null;
    if (r < 3 || meta.pity >= 40) {
      rarity = 'SSR';
      name = '레전드 에코';
      unlock = 'blade';
      meta.pity = 0;
    } else if (r < 15) {
      rarity = 'SR';
      name = '희귀 모듈';
      unlock = 'mage';
    } else if (r < 50) {
      rarity = 'R';
      name = '강화 파츠';
    } else {
      rarity = 'N';
      name = '일반 파편';
    }
    if (unlock && meta.unlocked.indexOf(unlock) < 0) {
      meta.unlocked.push(unlock);
      name += ' · 히어로 해금!';
    }
    saveMeta(meta);
    renderLobby();
    const out = $('gachaOut');
    out.hidden = false;
    out.innerHTML = '<div style="font-size:22px;margin-bottom:4px">' + rarity + '</div>' + name +
      '<br><small>확률 고지: SSR3% SR12% R35% N50% · 가상 · 컴프 아님</small>';
    track('gacha', { rarity: rarity });
  }

  // wire UI
  $('btnSprint').onclick = () => startGame('sprint');
  $('btnClassic').onclick = () => startGame('classic');
  $('btnGacha').onclick = doGacha;
  $('btnAgain').onclick = () => {
    $('result').hidden = true;
    $('boot').hidden = false;
    renderLobby();
  };
  $('btnHub').onclick = () => { location.href = 'https://hosuman08-netizen.github.io/legion-hub/'; };
  $('btnPause').onclick = () => {
    if (!running) return;
    paused = true;
    $('pause').hidden = false;
  };
  $('btnResume').onclick = () => {
    paused = false;
    $('pause').hidden = true;
  };
  $('btnQuit').onclick = () => {
    running = false;
    cancelAnimationFrame(raf);
    $('pause').hidden = true;
    $('c').hidden = true;
    $('hud').hidden = true;
    $('boot').hidden = false;
    renderLobby();
  };

  renderLobby();
  track('boot', { app: 'echo-squad' });
})();
