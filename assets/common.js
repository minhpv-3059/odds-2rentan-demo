/* =============================================================
   common.js — shared app chrome + native bridge for all 3 games
   (keiba / keirin / autorace).

   Each page ships only its own content inside `.screen`; this file
   injects the mini-header, race header, race-number tabs, the bottom
   content-nav (出走表 / オッズ / 予想 / 照会・結果) and — on 出走表
   pages — the 基本情報 / 前5走 / 前5走(縦) sub-tabs.

   Game and current route are inferred from location.pathname, so the
   keirin/ and autorace/ trees are byte-identical copies of keiba/.
   A page may still override via a `window.PAGE = { ... }` object set
   before this script loads.
   ============================================================= */
(function () {
  'use strict';

  /* ---------- SVG icons ---------- */
  var SVG = {
    back: '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.0333 0.666667C10.82 0.666667 10.6133 0.746667 10.46 0.9L3.92667 7.42667C3.77333 7.58 3.66667 7.78 3.66667 7.99333C3.66667 8.21333 3.77333 8.41333 3.92667 8.56667L10.48 15.1C10.7933 15.4133 11.3 15.4133 11.6133 15.1L12.0933 14.62C12.2467 14.4667 12.3267 14.2667 12.3267 14.0533C12.3267 13.84 12.2467 13.64 12.0933 13.4867L6.60667 8L12.0867 2.51333C12.24 2.36 12.32 2.16 12.32 1.94667C12.32 1.73333 12.24 1.53333 12.0867 1.38L11.6 0.9C11.4467 0.746667 11.2467 0.666667 11.0333 0.666667Z" fill="currentColor"/></svg>',
    fwd: '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.4 0.9L3.91333 1.38C3.76 1.53333 3.68 1.73333 3.68 1.94667C3.68 2.16 3.76 2.36 3.91333 2.51333L9.39333 7.99333L3.90667 13.48C3.75333 13.6333 3.67333 13.8333 3.67333 14.0467C3.67333 14.26 3.75333 14.46 3.90667 14.6133L4.38667 15.0933C4.7 15.4067 5.20667 15.4067 5.52 15.0933L12.0733 8.56C12.2267 8.40667 12.3333 8.20667 12.3333 7.99333C12.3333 7.77333 12.2267 7.57333 12.0733 7.42667L5.54667 0.9C5.39333 0.746667 5.18667 0.666667 4.97333 0.666667C4.76 0.666667 4.55333 0.746667 4.40667 0.9H4.4Z" fill="currentColor"/></svg>',
    shutuba: '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.47 3.5H2.53C1.68 3.5 1 4.18 1 5.03V15.24C1 16.08 1.68 16.77 2.53 16.77H17.47C18.31 16.77 19 16.09 19 15.24V5.03C19 4.19 18.32 3.5 17.47 3.5ZM6.3 13.72C6.3 13.89 6.16 14.03 5.99 14.03H3.72C3.55 14.03 3.41 13.89 3.41 13.72V11.45C3.41 11.28 3.55 11.14 3.72 11.14H5.99C6.16 11.14 6.3 11.28 6.3 11.45V13.72ZM6.3 8.81C6.3 8.98 6.16 9.12 5.99 9.12H3.72C3.55 9.12 3.41 8.98 3.41 8.81V6.54C3.41 6.37 3.55 6.23 3.72 6.23H5.99C6.16 6.23 6.3 6.37 6.3 6.54V8.81ZM13.84 13.34H8.21C7.8 13.34 7.46 13 7.46 12.59C7.46 12.18 7.8 11.84 8.21 11.84H13.84C14.25 11.84 14.59 12.18 14.59 12.59C14.59 13 14.25 13.34 13.84 13.34ZM16.59 8.43H8.21C7.8 8.43 7.46 8.09 7.46 7.68C7.46 7.27 7.8 6.93 8.21 6.93H16.59C17 6.93 17.34 7.27 17.34 7.68C17.34 8.09 17 8.43 16.59 8.43Z" fill="currentColor"/></svg>',
    odds: '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 13.2002C8.27614 13.2002 8.5 13.4241 8.5 13.7002V16.6797C8.5 16.9558 8.27614 17.1797 8 17.1797H2C1.72386 17.1797 1.5 16.9558 1.5 16.6797V13.7002C1.5 13.4241 1.72386 13.2002 2 13.2002H8Z" fill="currentColor"/><path d="M13 7.84961C13.276 7.84961 13.4998 8.07364 13.5 8.34961V11.3301C13.4999 11.6062 13.2761 11.8301 13 11.8301H2C1.72389 11.8301 1.50006 11.6062 1.5 11.3301V8.34961C1.5002 8.07364 1.72398 7.84961 2 7.84961H13Z" fill="currentColor"/><path d="M18 2.5C18.2761 2.5 18.5 2.72386 18.5 3V5.98047C18.4997 6.2564 18.276 6.48047 18 6.48047H2C1.72401 6.48047 1.50025 6.2564 1.5 5.98047V3C1.5 2.72386 1.72386 2.5 2 2.5H18Z" fill="currentColor"/></svg>',
    yosou: '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.7527 3.6777L16.7603 3.46503C16.6389 3.4549 16.5377 3.35363 16.5276 3.23211L16.3152 1.23707C16.295 1.01427 16.0219 0.923128 15.8702 1.07503L12.391 4.55876C12.3303 4.61952 12.3101 4.69041 12.3202 4.77143L12.5225 6.65507L9.43767 9.74383C9.20504 9.97675 9.20504 10.3413 9.43767 10.5743C9.67029 10.8072 10.0344 10.8072 10.267 10.5743L13.3518 7.48549L15.233 7.68803C15.3139 7.68803 15.3847 7.66778 15.4454 7.61714L18.9247 4.13342C19.0764 3.98151 18.9853 3.70808 18.773 3.68783L18.7527 3.6777Z" fill="currentColor"/><path d="M11.4504 6.28036L11.3593 5.39931C9.59949 4.82206 7.5969 5.21702 6.19105 6.61456C4.20869 8.59947 4.20869 11.8199 6.19105 13.8048C8.17341 15.7897 11.3897 15.7897 13.372 13.8048C14.7678 12.4073 15.1622 10.392 14.5857 8.62985L13.7058 8.53871L10.9649 11.2831C10.6615 11.587 10.267 11.749 9.83211 11.749C9.39721 11.749 9.00276 11.587 8.69934 11.2831C8.07227 10.6553 8.07227 9.64256 8.69934 9.02481L11.4403 6.28036H11.4504Z" fill="currentColor"/><path d="M16.6389 7.82981C16.9019 8.58934 17.0434 9.38938 17.0434 10.2198C17.0434 12.1642 16.2849 13.9871 14.9195 15.3644C13.544 16.7417 11.7234 17.4911 9.78154 17.4911C7.83964 17.4911 6.01911 16.7315 4.64359 15.3644C1.81165 12.5187 1.81165 7.91083 4.64359 5.07524C6.01911 3.69795 7.83964 2.94855 9.78154 2.94855C10.6109 2.94855 11.4099 3.09033 12.1685 3.35363L13.3316 2.18901C12.1988 1.69279 10.9952 1.42948 9.78154 1.42948C7.53622 1.42948 5.2909 2.29029 3.5715 4.00177C0.142832 7.43485 0.142832 12.9946 3.5715 16.4277C5.2909 18.1493 7.53622 19 9.78154 19C12.0269 19 14.2722 18.1392 15.9916 16.4277C18.6314 13.7845 19.2281 9.87548 17.802 6.65507L16.6389 7.81968V7.82981Z" fill="currentColor"/></svg>',
    result: '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.12351 1.75174L4.25347 2.74512H3.32526C3.27663 2.74512 3.22907 2.74975 3.18301 2.75859C2.03627 2.82497 1 3.68789 1 4.90748V5.45933C1 7.83371 2.8649 9.70661 5.22139 10.1438L5.40473 11.5452C5.42573 11.7854 5.57276 11.9942 5.79329 12.0986L8.9624 13.6462V16.4524L6.69616 18.0503C6.27609 18.3426 6.48612 19.0004 7.00071 19.0004H12.9237C13.4383 19.0004 13.6483 18.3426 13.2282 18.0503L10.9624 16.4526V13.6463L14.1317 12.0986C14.3522 11.9942 14.4992 11.7854 14.5202 11.5452L14.7039 10.1418C17.0551 9.70068 18.9141 7.82996 18.9141 5.45933V4.90748C18.9141 3.63764 17.7906 2.75447 16.5888 2.75447H15.6703L15.8015 1.75174C15.8435 1.34455 15.5179 1 15.1083 1H4.80613C4.39656 1 4.08151 1.34455 4.11301 1.75174H4.12351ZM14.912 8.55101L15.474 4.25447H16.5888C17.1302 4.25447 17.4141 4.62466 17.4141 4.90748V5.45933C17.4141 6.83065 16.4073 8.08678 14.912 8.55101ZM3.44404 4.24512H4.4497L5.01347 8.55452C3.51183 8.09315 2.5 6.83413 2.5 5.45933V4.90748C2.5 4.62466 2.78382 4.25447 3.32526 4.25447C3.36568 4.25447 3.40536 4.25127 3.44404 4.24512Z" fill="currentColor"/></svg>'
  };

  /* ---------- native bridge ----------
     Web→Native unified envelope: { action, payload } as a JSON string
     sent through the 'NativeApp' handler. */
  function postToNative(action, payload) {
    if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
      window.flutter_inappwebview.callHandler(
        'NativeApp',
        JSON.stringify({ action: action, payload: payload || {} })
      );
    } else {
      console.log('NativeApp', action, payload || {});
    }
  }
  window.postToNative = postToNative;

  /* ---------- route + game inference ---------- */
  var GAMES = ['keiba', 'keirin', 'autorace'];
  // per-game primary/brand colour (race-no badge + active race tab)
  var BRAND = { keiba: '#1a9f5c', keirin: '#0180b6', autorace: '#9674e0' };
  // route file -> { tab, sub, path } (path is relative to the game root)
  var ROUTES = {
    'SpRaceInfo.do':       { tab: 'shutuba', sub: 'basic',  path: 'SpRaceInfo.do' },
    'SpRaceInfo2.do':      { tab: 'shutuba', sub: 'prev5',  path: 'SpRaceInfo2.do' },
    'SpZengoYosouInfo.do': { tab: 'shutuba', sub: 'prev5v', path: 'ajax/SpZengoYosouInfo.do' },
    'SpOddsVote.do':       { tab: 'odds',    path: 'SpOddsVote.do' },
    'SpTipsterVote.do':    { tab: 'yosou',   path: 'SpTipsterVote.do' },
    'SpRaceResultInfo.do': { tab: 'result',  path: 'SpRaceResultInfo.do' }
  };

  function detectContext() {
    var parts = location.pathname.split('/').filter(Boolean);
    var game = 'keiba', gameIdx = -1;
    for (var i = 0; i < parts.length; i++) {
      if (GAMES.indexOf(parts[i]) >= 0) { game = parts[i]; gameIdx = i; break; }
    }
    // Mount prefix = everything before the game segment. Empty at domain root
    // (local server), '/odds-2rentan-demo' under GitHub Pages, etc.
    var prefix = gameIdx > 0 ? '/' + parts.slice(0, gameIdx).join('/') : '';
    var routeFile = null;
    for (var j = parts.length - 1; j >= 0; j--) {
      if (/\.do$/.test(parts[j])) { routeFile = parts[j]; break; }
    }
    var info = ROUTES[routeFile] || ROUTES['SpRaceInfo.do'];
    return { game: game, prefix: prefix, tab: info.tab, sub: info.sub };
  }

  var ctx = detectContext();
  if (window.PAGE) {
    for (var k in window.PAGE) { if (window.PAGE.hasOwnProperty(k)) ctx[k] = window.PAGE[k]; }
  }
  window.PAGE_CTX = ctx;

  function href(routeFile) { return ctx.prefix + '/' + ctx.game + '/' + ROUTES[routeFile].path + '/'; }

  /* ---------- shared chrome markup ---------- */
  var CONTENT_NAV = [
    { tab: 'shutuba', route: 'SpRaceInfo.do',       label: '出走表',    icon: SVG.shutuba },
    { tab: 'odds',    route: 'SpOddsVote.do',       label: 'オッズ',    icon: SVG.odds },
    { tab: 'yosou',   route: 'SpTipsterVote.do',    label: '予想',      icon: SVG.yosou },
    { tab: 'result',  route: 'SpRaceResultInfo.do', label: '照会・結果', icon: SVG.result }
  ];
  var SUB_TABS = [
    { sub: 'basic',  route: 'SpRaceInfo.do',       label: '基本情報' },
    { sub: 'prev5',  route: 'SpRaceInfo2.do',      label: '前5走' },
    { sub: 'prev5v', route: 'SpZengoYosouInfo.do', label: '前5走(縦)' }
  ];

  function miniHeaderHTML() {
    return '' +
      '<span class="icon">' + SVG.back + '</span>' +
      '<div class="mini-body">' +
        '<span class="mini-name">金沢 11R</span>' +
        '<span class="mini-status">発売中</span>' +
        '<span class="mini-post">発走 18:15</span>' +
        '<span class="mini-close">締切 18:10</span>' +
      '</div>' +
      '<span class="icon">' + SVG.fwd + '</span>';
  }

  function raceHeaderHTML() {
    return '' +
      '<div class="race-header-grid">' +
        '<span class="race-no">11R</span>' +
        '<div class="race-title-row">' +
          '<div class="race-title">お松の方賞3歳上牝馬（東海・北陸交流）</div>' +
          '<div class="race-tags">' +
            '<span class="tag-grade">重賞</span>' +
            '<span class="tag-weather">☀</span>' +
          '</div>' +
        '</div>' +
        '<span class="sale-badge">発売中</span>' +
        '<div class="race-meta-line1">曇 良 ダ 1500m 右回り 10頭</div>' +
        '<span class="sale-deadline">締切 25分前</span>' +
        '<div class="race-meta-line2">2025年5月11日(日) 発走 18:15 <span class="close-time">締切 18:10</span></div>' +
      '</div>';
  }

  function contentNavHTML() {
    return CONTENT_NAV.map(function (n) {
      var active = n.tab === ctx.tab ? ' active' : '';
      return '<a class="nav-item' + active + '" href="' + href(n.route) + '" data-tab="' + n.tab + '">' +
        '<span class="icon">' + n.icon + '</span><span>' + n.label + '</span></a>';
    }).join('');
  }

  function subTabsHTML() {
    var html = '';
    SUB_TABS.forEach(function (s, i) {
      if (i > 0) html += '<div class="sub-divider"></div>';
      var active = s.sub === ctx.sub ? ' active' : '';
      html += '<a class="' + active.trim() + '" href="' + href(s.route) + '" data-sub="' + s.sub + '">' + s.label + '</a>';
    });
    return html;
  }

  /* ---------- render chrome into the page ---------- */
  function renderChrome() {
    var screen = document.querySelector('.screen');
    if (!screen) return;

    var mini = document.createElement('div');
    mini.className = 'mini-header';
    mini.id = 'miniHeader';
    mini.innerHTML = miniHeaderHTML();
    screen.parentNode.insertBefore(mini, screen);

    var frag = document.createDocumentFragment();

    var raceHeader = document.createElement('div');
    raceHeader.className = 'race-header';
    raceHeader.id = 'raceHeader';
    raceHeader.innerHTML = raceHeaderHTML();
    frag.appendChild(raceHeader);

    var raceTabs = document.createElement('nav');
    raceTabs.className = 'race-tabs';
    raceTabs.id = 'raceTabs';
    frag.appendChild(raceTabs);

    var nav = document.createElement('nav');
    nav.className = 'content-nav';
    nav.id = 'contentNav';
    nav.innerHTML = contentNavHTML();
    frag.appendChild(nav);

    if (ctx.tab === 'shutuba') {
      var sub = document.createElement('nav');
      sub.className = 'sub-tabs';
      sub.id = 'subTabs';
      sub.innerHTML = subTabsHTML();
      frag.appendChild(sub);
    }

    screen.insertBefore(frag, screen.firstChild);

    buildRaceTabs(raceTabs);
    initMiniHeader(raceHeader, mini);
  }

  /* ---------- race-number tabs (8R–11R + 全レース一覧) ---------- */
  function buildRaceTabs(raceTabs) {
    for (var raceNo = 8; raceNo <= 11; raceNo++) {
      var tab = document.createElement('div');
      var isActive = raceNo === 11;
      tab.className = 'race-tab' + (isActive ? ' active' : '');
      tab.innerHTML = '<div class="r-no">' + raceNo + 'R</div><div class="r-status">発売中</div>';
      raceTabs.appendChild(tab);
    }
    var allTab = document.createElement('div');
    allTab.className = 'race-tab all';
    allTab.innerHTML = '全レース<br>一覧';
    raceTabs.appendChild(allTab);
  }

  /* ---------- mini sticky header on scroll ---------- */
  function initMiniHeader(raceHeaderEl, miniHeaderEl) {
    function update() {
      var rect = raceHeaderEl.getBoundingClientRect();
      miniHeaderEl.classList.toggle('visible', rect.bottom <= 0);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- sticky cart helper (オッズ / 予想>的中重視) ---------- */
  window.setCart = function (on) {
    document.body.classList.toggle('show-cart', !!on);
  };

  /* ---------- boot ---------- */
  function boot() {
    if (BRAND[ctx.game]) {
      document.documentElement.style.setProperty('--brand', BRAND[ctx.game]);
    }
    renderChrome();
    document.title = '金沢 11R';
    postToNative('setTitle', { title: '金沢 11R' });
    if (typeof window.onChromeReady === 'function') window.onChromeReady(ctx);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
