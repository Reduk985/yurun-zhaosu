/* ============================================================
   语润昭苏 · 法聚同心 —— 交互脚本
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ============================================================
     1. 首屏文字粒子（多语种问候，象征文化交融）
     ============================================================ */
  // 首屏文字粒子：仅哈萨克语与维吾尔语，呼应项目双语传播特色
  var GREETINGS = ['Сәлем', 'ياخشىمۇسىز', 'Сәлеметсіз бе', 'بىرلىك', 'Бірлік', 'Рахмет', 'رەھمەت'];
  (function initParticles() {
    var box = $('#heroParticles');
    if (!box) return;
    var n = window.innerWidth < 620 ? 14 : 24;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.textContent = GREETINGS[i % GREETINGS.length];
      s.style.left = Math.random() * 96 + '%';
      s.style.fontSize = 12 + Math.random() * 18 + 'px';
      s.style.animationDuration = 9 + Math.random() * 14 + 's';
      s.style.animationDelay = -Math.random() * 20 + 's';
      s.style.opacity = '0';
      box.appendChild(s);
    }
  })();

  /* ============================================================
     2. 导航：滚动阴影 / 汉堡菜单 / 滚动高亮
     ============================================================ */
  var topnav = $('#topnav');
  window.addEventListener('scroll', function () {
    topnav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  var burger = $('#navBurger'), navLinks = $('#navLinks');
  burger.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });
  $$('a[data-nav]').forEach(function (a) {
    a.addEventListener('click', function () { navLinks.classList.remove('open'); });
  });

  var navAnchors = $$('a[data-nav]').map(function (a) { return a.getAttribute('href').slice(1); });
  var secObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        $$('a[data-nav]').forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      }
    });
  }, { rootMargin: '-38% 0px -55% 0px' });
  navAnchors.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) secObserver.observe(el);
  });

  /* ============================================================
     3. 滚动显现 + 数字滚动
     ============================================================ */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(function (el) { revealObs.observe(el); });

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var start = null, dur = 1300;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        animateCount(en.target);
        countObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) { countObs.observe(el); });

  /* ============================================================
     4. 实践地图点位
     ============================================================ */
  var MAP_POINTS = {
    zhaosu: { t: '昭苏县 · 司法系统座谈', stats: '1 场 · 50 人次', d: '赴昭苏县司法局、社区矫正中心、社会治安综合治理中心座谈，从司法实务视角深化对基层法治治理的认识。' },
    yining: { t: '伊宁市 · 实践核心城市', stats: '多项活动落地', d: '伊犁州博物馆、林则徐纪念馆"小小讲解员"培训、蒲公英普法平台法治宣讲、"红领巾"公益课堂等在此开展。' },
    museum: { t: '伊犁州博物馆 · 小小讲解员', stats: '1 场 · 30 人次（与林则徐纪念馆共同开展）', d: '协助开展"小小讲解员"普通话培训，以青少年为纽带实现"教会一个孩子、带动一个家庭、辐射一个社区"。' },
    linzexu: { t: '林则徐纪念馆 · 行走的法治课', stats: '文化浸润场景', d: '依托纪念馆开展"行走的法治课"，把推普、普法融入场馆研学，在历史现场感受文化共鸣。' },
    horse: { t: '军马场 · 产业走访与试点', stats: '产业调研 1 场 · 10 人次', d: '2025年暑期推普普法试点在此启动；2026年开展产业走访调研，了解民族地区特色产业发展中的语言与法律需求。' },
    print: { t: '木刻版画工作室 · 非遗访谈', stats: '1 场 · 10 人次', d: '拜访伊犁木刻版画非遗传承人，探索"非遗+推普+普法"融合路径，以文化浸润促进语言互通与法治认同。' },
    community: { t: '军马场社区 · 课堂与宣讲', stats: '公益课堂 2 场 · 50 人次', d: '面向社区居民开展普通话教学与法律宣讲，"红领巾"公益课堂以互动式、游戏化教学开展普通话训练，寓教于乐。' }
  };
  var mapPanelInner = $('#mapPanelInner');
  $$('.map-point').forEach(function (g) {
    g.setAttribute('tabindex', '0');
    var show = function () {
      var p = MAP_POINTS[g.getAttribute('data-point')];
      if (!p) return;
      mapPanelInner.innerHTML =
        '<div class="map-card"><h4>' + esc(p.t) + '</h4>' +
        '<p class="stats">' + esc(p.stats) + '</p><p>' + esc(p.d) + '</p></div>';
    };
    g.addEventListener('click', show);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter') show(); });
  });

  /* ============================================================
     5. 双轮驱动沙盘
     ============================================================ */
  var range = $('#sandboxRange'), sandbox = $('.sandbox'), tip = $('#sandboxTip');
  range.addEventListener('input', function () {
    var v = parseInt(range.value, 10);
    var left = $('#wheelLeft'), right = $('#wheelRight');
    left.style.opacity = 0.55 + 0.45 * (1 - v / 100);
    right.style.opacity = 0.55 + 0.45 * (v / 100);
    var merged = v >= 42 && v <= 58;
    sandbox.classList.toggle('merged', merged);
    tip.textContent = merged
      ? '✨ 交汇成功！推普让法律"听得懂"，普法让语言"有意义" —— "以语载法、以法促语"'
      : '拖动滑块，让两个轮子交汇 —— 生成"以语载法"的融合力量 ✨';
  });

  /* ============================================================
     6. 翻转卡片（触屏点击翻转）
     ============================================================ */
  $$('.flip').forEach(function (f) {
    f.addEventListener('click', function () { f.classList.toggle('flipped'); });
  });

  /* ============================================================
     7. 前后测数据条动画
     ============================================================ */
  function animateGauge(fill) {
    var from = parseFloat(fill.getAttribute('data-from')) || 0;
    var to = parseFloat(fill.getAttribute('data-w')) || 0;
    var tag = fill.querySelector('b');
    var start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = from + (to - from) * eased;
      fill.style.width = val + '%';
      if (tag) {
        tag.textContent = Math.round(val) + '%';
        tag.style.right = Math.max(6, 100 - val) + '%';
      }
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var gaugeObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        animateGauge(en.target);
        gaugeObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.5 });
  $$('.gauge-fill').forEach(function (el) { gaugeObs.observe(el); });

  /* ============================================================
     8. 图片灯箱（光影集 + 感谢信）
     ============================================================ */
  var lightbox = $('#lightbox'), lightboxImg = $('#lightboxImg');
  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  $$('#gallery img, .letter-wall img').forEach(function (img) {
    img.addEventListener('click', function () { openLightbox(img.src); });
  });
  $('#lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLightbox(); closeQuiz(); } });

  /* ============================================================
     9. 普法小闯关（3 题，全对解锁石榴籽彩蛋）
     ============================================================ */
  var QUIZ = [
    { q: '《中华人民共和国民族团结进步促进法》施行时间是？',
      opts: ['2026年10月1日', '2026年7月1日', '2027年1月1日'], a: 1,
      e: '这部法律自2026年7月1日起正式施行。' },
    { q: '本法的立法主线、民族团结之本是？',
      opts: ['民族区域自治', '发展少数民族经济', '铸牢中华民族共同体意识'], a: 2,
      e: '铸牢中华民族共同体意识是本法的立法主线，是民族团结之本。' },
    { q: '"四个与共"不包括下面哪一项？',
      opts: ['利益独占', '休戚与共', '命运与共'], a: 0,
      e: '"四个与共"指休戚与共、荣辱与共、生死与共、命运与共。' }
  ];
  var quizModal = $('#quizModal'), quizBody = $('#quizBody'), quizResult = $('#quizResult');
  var quizIdx = 0, quizRight = 0;

  function openQuiz() {
    quizIdx = 0; quizRight = 0;
    quizResult.hidden = true; quizBody.hidden = false;
    renderQuiz();
    quizModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeQuiz() {
    quizModal.hidden = true;
    document.body.style.overflow = '';
  }
  function renderQuiz() {
    var q = QUIZ[quizIdx];
    var html = '<div class="quiz-q"><p>' + (quizIdx + 1) + ' / ' + QUIZ.length + '　' + esc(q.q) + '</p>';
    q.opts.forEach(function (o, i) {
      html += '<button class="quiz-opt" data-qopt="' + i + '">' + 'ABCD'[i] + '. ' + esc(o) + '</button>';
    });
    html += '<p class="quiz-fb" id="quizFb"></p></div>';
    quizBody.innerHTML = html;
  }
  // 事件委托：动态生成的选项统一在此处理
  quizBody.addEventListener('click', function (e) {
    var b = e.target.closest('[data-qopt]');
    if (!b) return;
    var v = parseInt(b.getAttribute('data-qopt'), 10);
    var q = QUIZ[quizIdx];
    var fb = $('#quizFb');
    var ok = v === q.a;
    if (ok) { quizRight++; fb.textContent = '答对啦！' + q.e; fb.style.color = '#2e6b4e'; }
    else { fb.textContent = '答案是 ' + 'ABCD'[q.a] + '。' + q.e; fb.style.color = '#c03b44'; }
    setTimeout(function () {
      quizIdx++;
      if (quizIdx < QUIZ.length) renderQuiz();
      else showQuizResult();
    }, 1300);
  });
  function showQuizResult() {
    quizBody.hidden = true;
    quizResult.hidden = false;
    var allRight = quizRight === QUIZ.length;
    quizResult.innerHTML = allRight
      ? '<div class="quiz-result"><div class="big">🎉</div><p>全部答对！你解锁了石榴籽彩蛋～</p><button class="btn" id="quizEaster">打开彩蛋</button></div>'
      : '<div class="quiz-result"><div class="big">🌱</div><p>答对 ' + quizRight + ' / ' + QUIZ.length + '，差一点就解锁彩蛋啦，再试试～</p><button class="btn" id="quizRetry">再试一次</button></div>';
    var easter = $('#quizEaster'), retry = $('#quizRetry');
    if (easter) easter.addEventListener('click', function () { closeQuiz(); seedEasterEgg(); });
    if (retry) retry.addEventListener('click', openQuiz);
  }
  $('#navQuiz').addEventListener('click', openQuiz);
  $('#quizClose').addEventListener('click', closeQuiz);
  quizModal.addEventListener('click', function (e) { if (e.target === quizModal) closeQuiz(); });

  /* 石榴籽彩蛋 */
  function seedEasterEgg() {
    var overlay = document.createElement('div');
    overlay.className = 'easter-egg';
    overlay.innerHTML = '<div class="ee-txt">各民族要像石榴籽一样紧紧抱在一起</div>';
    document.body.appendChild(overlay);
    var colors = ['#c03b44', '#d95560', '#e8858d', '#f6b8bc', '#d9a441'];
    for (var i = 0; i < 36; i++) {
      var s = document.createElement('div');
      s.className = 'seed-fall';
      s.style.left = Math.random() * 100 + '%';
      s.style.width = s.style.height = 6 + Math.random() * 10 + 'px';
      s.style.background = colors[i % colors.length];
      s.style.borderRadius = '45% 55% 50% 50%';
      s.style.animationDuration = 2.4 + Math.random() * 2.6 + 's';
      s.style.animationDelay = Math.random() * 1.2 + 's';
      document.body.appendChild(s);
      (function (el) {
        setTimeout(function () { el.remove(); }, 5600);
      })(s);
    }
    setTimeout(function () { overlay.remove(); }, 5000);
  }

  /* ============================================================
     10. 共融墙（本地演示模式）
     ============================================================ */
  var WALL_KEY = 'yurun-site.wall';
  function renderWall() {
    var wall = $('#wall');
    var items = store.get(WALL_KEY, []);
    if (!items.length) {
      wall.innerHTML = '<p class="wall-empty">还没有留言，来写下第一句祝福吧 🌸</p>';
      return;
    }
    wall.innerHTML = items.map(function (it) {
      return '<div class="wall-item"><b>' + esc(it.nick) + '</b>　' + esc(it.msg) + '</div>';
    }).join('');
  }
  $('#wallForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var nick = this.nick.value.trim(), msg = this.msg.value.trim();
    if (!nick || !msg) return;
    var items = store.get(WALL_KEY, []);
    items.unshift({ nick: nick, msg: msg, t: Date.now() });
    store.set(WALL_KEY, items.slice(0, 60));
    this.nick.value = ''; this.msg.value = '';
    renderWall();
  });
  renderWall();

  /* ============================================================
     11. 合作邀约（mailto 占位，正式上线可接入后端）
     ============================================================ */
  var CONTACT_EMAIL = 'yurunzhaosu@example.com'; // TODO: 替换为团队邮箱
  $('#coopForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var org = encodeURIComponent(this.org.value.trim());
    var contact = encodeURIComponent(this.contact.value.trim());
    var msg = encodeURIComponent(this.msg.value.trim());
    var subject = encodeURIComponent('合作邀约 · 语润昭苏法聚同心（来自网站）');
    var body = encodeURIComponent('单位/团队：' + this.org.value.trim() + '\n联系方式：' + this.contact.value.trim() + '\n合作意向：\n' + this.msg.value.trim());
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
  });

  /* ============================================================
     12. 小石榴导览
     ============================================================ */
  var mascot = $('#mascot'), bubble = $('#mascotBubble'), bubbleTxt = $('#mascotText'), muteBtn = $('#mascotMute');
  var TIPS = [
    '你好呀，我是小石榴 🍎 页面从上往下是一段完整故事：缘起 → 足迹 → 共融 → 回响 → 同行',
    '试试第三章的"双轮沙盘"，拖动滑块让推普和普法交汇 ✨',
    '点击地图上的点位，看看边疆的实践瞬间 🗺️',
    '导航栏有"普法小闯关"，答对 3 题有石榴籽彩蛋 🎁',
    '在"同行"章节写下你的祝福，一起温暖共融墙 📝',
    '第四章有感谢信墙和光影集，慢慢逛～'
  ];
  var tipIdx = 0, muted = store.get('yurun-site.mute', false);
  function speak(txt) {
    if (muted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(txt);
        u.lang = 'zh-CN'; u.rate = 1.05;
        window.speechSynthesis.speak(u);
      }
    } catch (e) { /* 不支持语音合成时静默降级 */ }
  }
  function showTip() {
    var t = TIPS[tipIdx % TIPS.length];
    tipIdx++;
    bubbleTxt.textContent = t;
    bubble.hidden = false;
    if (tipIdx === 1) speak(t);
  }
  mascot.addEventListener('click', function (e) {
    if (e.target === mascot.querySelector('.mascot-close')) return;
    showTip();
  });
  $('#mascotClose').addEventListener('click', function () {
    mascot.hidden = true;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  });
  muteBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    muted = !muted;
    store.set('yurun-site.mute', muted);
    muteBtn.textContent = muted ? '🔈' : '🔇';
    if (!muted) speak(bubbleTxt.textContent);
  });
  // 首次访问自动打个招呼
  setTimeout(function () {
    if (!mascot.hidden) showTip();
  }, 2600);
})();
