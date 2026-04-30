// ═══════════════════════════════════════════════════════════════════════
// 3-B. レガシーページ用データ構造（cf_only より移植）
// ═══════════════════════════════════════════════════════════════════════
const LEGACY_NAV_LABELS = {
  'pink.htm':       'トップページ',
  'today.htm':      '本日掲載',
  'repo_e.htm':     '東日本',
  'repo_w.htm':     '西日本',
  'oversea.htm':    '海外',
  'history.htm':    '更新履歴',
  'historyall.htm': '全期間履歴',
  'papers.htm':     '研究論文',
  'pape_b.htm':     '医学・心理学',
  'pape_d.htm':     'ぼったくり風俗',
  'pape_a.htm':     '経営・経済学',
  'pape_g.htm':     '業界動向調査',
  'pape_c.htm':     '風俗関連法規',
  'pape_h.htm':     'ノンセクション',
  'pape_g_e.htm':   '東日本',
  'pape_g_w.htm':   '西日本',
  'kansen.htm':     '感染症',
  'kensa.htm':      '性病検査',
  'ed.htm':         'ED（勃起障害）',
  'sinri.htm':      '心理学',
  'b_etc.htm':      'その他（医学）',
  'kaimuall.htm':   '会務報告',
  '20y.htm':        '20周年記念',
  'ranking.php':    'ランキング',
  'bosyu.htm':      '会員募集',
  'new_mmb.htm':    '人事異動',
  'organ.htm':      '会員一覧',
  'hokkai.htm':     '北海道',
  'aomori.htm':     '青森',
  'iwate.htm':      '岩手',
  'tohoku.htm':     '東北',
  'tochigi.htm':    '栃木',
  'ibaragi.htm':    '茨城',
  'gunma.htm':      '群馬',
  'saitama.htm':    '埼玉',
  'chiba.htm':      '千葉',
  'tokio_n.htm':    '東京北部',
  'tokio_c.htm':    '東京中央',
  'tokio_s.htm':    '東京南部',
  'tokio_w.htm':    '東京西部',
  'kanagawa_e.htm': '神奈川東部',
  'kanagawa_w.htm': '神奈川西部',
  'koshinetsu.htm': '甲信越',
  'hokuriku.htm':   '北陸',
  'shizuoka.htm':   '静岡',
  'tokai.htm':      '東海',
  'aichi.htm':      '愛知',
  'nagoya.htm':     '名古屋市内',
  'owari.htm':      '尾張',
  'mikawa.htm':     '三河',
  'kinki.htm':      '近畿',
  'kyoto.htm':      '京都',
  'n_osaka.htm':    '大阪北部',
  's_osaka.htm':    '大阪南部',
  'hyogo.htm':      '兵庫',
  'chugoku.htm':    '中国',
  'shikoku.htm':    '四国',
  'kyusyu_n.htm':   '九州北部',
  'kyusyu_s.htm':   '九州南部',
};

const LEGACY_NAV_CATEGORY_DEFS = [
  { label: 'レポート',  fnames: ['today.htm','history.htm','historyall.htm','repo_e.htm','repo_w.htm','oversea.htm'] },
  { label: '研究・情報', fnames: ['papers.htm','pape_b.htm','pape_d.htm','pape_a.htm','pape_g.htm','pape_c.htm','pape_h.htm','ranking.php','kaimuall.htm','20y.htm'] },
  { label: '組織・参加', fnames: ['bosyu.htm','new_mmb.htm','organ.htm'] },
  { label: '地域',      fnames: [
    'hokkai.htm','aomori.htm','iwate.htm','tohoku.htm',
    'tochigi.htm','ibaragi.htm','gunma.htm','saitama.htm','chiba.htm',
    'tokio_n.htm','tokio_c.htm','tokio_s.htm','tokio_w.htm',
    'kanagawa_e.htm','kanagawa_w.htm','koshinetsu.htm',
    'hokuriku.htm','shizuoka.htm','tokai.htm','aichi.htm',
    'nagoya.htm','owari.htm','mikawa.htm',
    'kinki.htm','kyoto.htm','n_osaka.htm','s_osaka.htm','hyogo.htm',
    'chugoku.htm','shikoku.htm','kyusyu_n.htm','kyusyu_s.htm',
  ]},
];

const LEGACY_PAGE_NAV_CONTROL = {
  'organ.htm':    { hideLabels: new Set(['組織・参加']), hideFnames: new Set(['organ.htm', 'new_mmb.htm']) },
  'new_mmb.htm':  { hideLabels: new Set(['組織・参加']), hideFnames: new Set(['organ.htm', 'new_mmb.htm']) },
  'bosyu.htm':    { hideLabels: new Set(['組織・参加']), hideFnames: new Set(['organ.htm']) },
  '20y.htm':      { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['kaimuall.htm']) },
  'papers.htm':   { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm']) },
  'pape_a.htm':   { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm']) },
  'pape_b.htm':   { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm']), renameLabels: new Map([['地区', 'カテゴリ']]), hideAreaLabel: true },
  'pape_c.htm':   { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm']) },
  'pape_d.htm':   { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm']) },
  'pape_g.htm':   { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm']), renameLabels: new Map([['地区', 'カテゴリ']]), hideAreaLabel: true },
  'pape_g_e.htm': { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm', 'pape_g.htm']), hideGenreTabs: true, hideAreaGroup: true },
  'pape_g_w.htm': { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm', 'pape_g.htm']), hideGenreTabs: true, hideAreaGroup: true },
  'pape_h.htm':   { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm']) },
  'kansen.htm':   { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm', 'pape_b.htm']), hideGenreTabs: true, hideAreaGroup: true },
  'kensa.htm':    { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm', 'pape_b.htm']), hideGenreTabs: true, hideAreaGroup: true },
  'ed.htm':       { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm', 'pape_b.htm']), hideGenreTabs: true, hideAreaGroup: true },
  'sinri.htm':    { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm', 'pape_b.htm']), hideGenreTabs: true, hideAreaGroup: true },
  'b_etc.htm':    { hideLabels: new Set(['研究・情報']), hideFnames: new Set(['papers.htm', 'pape_b.htm']), hideGenreTabs: true, hideAreaGroup: true },
};

const LEGACY_PAGE_NAV_CHILD_CONTROL = {
  'organ.htm': { hideLabels: new Set(['組織・参加']), hideFnames: new Set(['organ.htm', 'new_mmb.htm']) },
};

const LEGACY_GENRE_IMG_MAP = {
  'derh.png':  'デリヘル',
  'soap.png':  'ソープ',
  'helt.png':  'ヘルス',
  'psalo.png': 'ピンサロ',
  'cab.png':   'キャバ',
  'etc.png':   'その他',
};

const LEGACY_REGION_NAV_PAGES = new Set(['repo_e.htm','repo_w.htm']);
const LEGACY_NAV_HOME_FNAME   = 'pink.htm';

function legacyLabelFromImgSrc(img) {
  if (!img) return '';
  const fname = (img.getAttribute('src') || '').split('/').pop();
  let m = fname.match(/^R0*(\d+)\.png$/i);
  if (m) return `令和${m[1]}年`;
  m = fname.match(/^h(\d+)\.png$/i);
  if (m) return `平成${m[1]}年`;
  return '';
}

function legacyMergeNavControl(base, extra) {
  if (!extra || Object.keys(extra).length === 0) return base;
  const result = { ...base };
  if (extra.hideCategories) result.hideCategories = new Set([...(base.hideCategories || []), ...extra.hideCategories]);
  if (extra.hideLabels)     result.hideLabels     = new Set([...(base.hideLabels     || []), ...extra.hideLabels]);
  if (extra.hideFnames)     result.hideFnames     = new Set([...(base.hideFnames     || []), ...extra.hideFnames]);
  if (extra.hideGenreTabs)  result.hideGenreTabs  = true;
  if (extra.hideAreaGroup)  result.hideAreaGroup  = true;
  if (extra.hideAreaLabel)  result.hideAreaLabel  = true;
  if (extra.renameLabels)   result.renameLabels   = new Map([...(base.renameLabels || new Map()), ...extra.renameLabels]);
  return result;
}

function legacyReplaceImgButtons(doc, currentUrl = null) {
  const currentFname = (currentUrl || '').split('/').pop().split('?')[0].toLowerCase();
  const isRegionPage = LEGACY_REGION_NAV_PAGES.has(currentFname);
  const prefFnames   = new Set(LEGACY_NAV_CATEGORY_DEFS.find(c => c.label === '地域')?.fnames || []);
  const isPrefPage   = prefFnames.has(currentFname);
  const navControl   = legacyMergeNavControl(
    LEGACY_PAGE_NAV_CONTROL[currentFname] || {},
    LEGACY_PAGE_NAV_CHILD_CONTROL[legacyNavFromFname] || {}
  );

  const navEntries = [];
  const genreTabs  = [];

  doc.querySelectorAll('a').forEach(a => {
    if (a.textContent.trim()) return;
    const img = a.querySelector('img');
    if (!img) return;

    const href = a.getAttribute('href') || '';
    let label = '';
    let finalHref = href;
    let fname = '';
    let isYear = false;

    if (href.startsWith('mailto:')) {
      const mParent = a.parentNode;
      a.remove();
      if (mParent && mParent !== doc.body && !mParent.textContent.trim() && mParent.children.length === 0) mParent.remove();
      return;
    } else {
      const jtpMatch = href.match(/JavaScript:TP\(['"](.+?)['"]\)/i);
      if (jtpMatch) finalHref = new URL(jtpMatch[1], 'https://pinsalo.info/sp/').href;
      fname = finalHref.split('/').pop().split('?')[0];

      const imgFname  = (img.getAttribute('src') || '').split('/').pop();
      const yearLabel = legacyLabelFromImgSrc(img);
      if (LEGACY_NAV_LABELS[fname]) {
        label = LEGACY_NAV_LABELS[fname];
      } else if (LEGACY_GENRE_IMG_MAP[imgFname]) {
        if (!navControl.hideGenreTabs) {
          genreTabs.push({ href: finalHref, label: LEGACY_GENRE_IMG_MAP[imgFname] });
        }
        const gParent = a.parentNode;
        a.remove();
        if (gParent && gParent !== doc.body && !gParent.textContent.trim() && gParent.children.length === 0) gParent.remove();
        return;
      } else if (yearLabel) {
        label = yearLabel;
        isYear = true;
      } else {
        label = img.getAttribute('alt') || '';
      }
    }

    if (!label) return;

    const btn = doc.createElement('a');
    btn.setAttribute('href', finalHref);
    btn.setAttribute('data-nav-btn', '');
    btn.textContent = label;
    navEntries.push({ btn, fname, isYear });

    const parent = a.parentNode;
    a.remove();
    if (parent && parent !== doc.body && !parent.textContent.trim() && parent.children.length === 0) parent.remove();
  });

  doc.querySelectorAll('img').forEach(img => {
    if (/pinsalo\.info\/img\//i.test(img.getAttribute('src') || '')) img.remove();
  });

  (function cleanEmpty(el) {
    if (/\bbox[123]\b/.test(el.className)) return;
    if (/^(br|hr|wbr)$/i.test(el.tagName)) return;
    Array.from(el.children).forEach(cleanEmpty);
    if (el === doc.body) return;
    const text = (el.textContent || '').replace(/[\s 　]/g, '');
    if (!text && !el.querySelector('a[href],img[src],input,select,textarea')) el.remove();
  })(doc.body);

  if (navEntries.length === 0 && genreTabs.length === 0) return;

  const homeEntry = navEntries.find(e => e.fname === LEGACY_NAV_HOME_FNAME);
  let homeGroup = null;
  if (homeEntry) {
    homeGroup = doc.createElement('div');
    homeGroup.className = 'nav-btn-group';
    homeGroup.appendChild(homeEntry.btn);
    doc.body.insertBefore(homeGroup, doc.body.firstChild);
  }

  if (genreTabs.length > 0) {
    const tabStrip = doc.createElement('div');
    tabStrip.className = 'genre-tabs';
    genreTabs.forEach(({ href, label }) => {
      const tabFname = href.split('/').pop().split('?')[0].toLowerCase();
      const tab = doc.createElement('a');
      tab.setAttribute('href', href);
      tab.setAttribute('data-nav-btn', '');
      tab.className = 'genre-tab' + (tabFname === currentFname ? ' active' : '');
      tab.textContent = label;
      tabStrip.appendChild(tab);
    });
    const afterHome = homeGroup ? homeGroup.nextSibling : doc.body.firstChild;
    doc.body.insertBefore(tabStrip, afterHome);
  }

  const catGroup = doc.createElement('div');
  catGroup.className = 'nav-btn-group';
  let hasCatBtns = false;

  LEGACY_NAV_CATEGORY_DEFS.forEach(cat => {
    if (navControl.hideCategories?.has(cat.label)) return;
    const fnameSet = new Set(cat.fnames);
    let catEntries;
    if (cat.label === 'レポート') {
      if (isPrefPage) return;
      catEntries = navEntries.filter(e => fnameSet.has(e.fname) || e.isYear);
      catEntries.sort((a, b) => {
        const ai = a.isYear ? 999 : cat.fnames.indexOf(a.fname);
        const bi = b.isYear ? 999 : cat.fnames.indexOf(b.fname);
        return ai - bi;
      });
    } else {
      catEntries = navEntries.filter(e => fnameSet.has(e.fname));
    }
    if (navControl.hideFnames) catEntries = catEntries.filter(e => !navControl.hideFnames.has(e.fname));
    if (catEntries.length === 0) return;

    const displayLabel = (cat.label === '地域' && isRegionPage) ? 'エリア（広域）'
      : (navControl.renameLabels?.get(cat.label) ?? cat.label);

    if (!navControl.hideLabels?.has(cat.label)) {
      const header = doc.createElement('div');
      header.className = 'nav-category-header';
      header.textContent = displayLabel;
      catGroup.appendChild(header);
    }
    catEntries.forEach(e => catGroup.appendChild(e.btn));
    hasCatBtns = true;
  });

  const categorizedFnames = new Set([
    LEGACY_NAV_HOME_FNAME,
    ...LEGACY_NAV_CATEGORY_DEFS.flatMap(cat => cat.fnames),
  ]);
  const uncategorized = navEntries.filter(e => !categorizedFnames.has(e.fname) && !e.isYear);

  let areaGroup = null;
  if (uncategorized.length > 0 && !navControl.hideAreaGroup) {
    areaGroup = doc.createElement('div');
    areaGroup.className = 'nav-btn-group';
    if (!navControl.hideAreaLabel) {
      const areaHeader = doc.createElement('div');
      areaHeader.className = 'nav-category-header';
      areaHeader.textContent = isPrefPage ? 'エリア（詳細）'
        : (navControl.renameLabels?.get('地区') ?? '地区');
      areaGroup.appendChild(areaHeader);
    }
    uncategorized.forEach(e => areaGroup.appendChild(e.btn));
  }

  if (hasCatBtns || areaGroup) {
    const isEmptyNode = n => {
      if (n.nodeType === 3) return !n.textContent.replace(/[\s ]/g, '');
      if (n.nodeType !== 1) return true;
      const text = n.textContent.replace(/[\s ]/g, '');
      return !text && !n.querySelector('a,img,input,button,select,textarea');
    };
    let cur = homeGroup ? homeGroup.nextSibling : doc.body.firstChild;
    while (cur) {
      const next = cur.nextSibling;
      if (isEmptyNode(cur)) { cur.remove(); cur = next; }
      else break;
    }

    let bodyText = '';
    for (const child of doc.body.childNodes) {
      if (child !== homeGroup) bodyText += (child.textContent || '').replace(/[\s ]/g, '');
    }
    if (bodyText.length > 10) {
      if (areaGroup) doc.body.appendChild(areaGroup);
      if (hasCatBtns) doc.body.appendChild(catGroup);
    } else {
      const insertBefore = homeGroup ? homeGroup.nextSibling : null;
      if (areaGroup) doc.body.insertBefore(areaGroup, insertBefore);
      if (hasCatBtns) doc.body.insertBefore(catGroup, areaGroup ? areaGroup.nextSibling : insertBefore);
    }
  }
}

// ── レガシーページ並列フェッチ（cf_only の fetchFast 相当）──────────────────
async function fetchLegacy(url) {
  const candidates = /\/sp\/ranking\.php(?:$|[?#])/i.test(url)
    ? [
        url,
        url.replace(/ranking\.php/i, 'ranking.htm'),
        url.replace(/\/sp\/ranking\.php/i, '/ranking.php'),
        url.replace(/\/sp\/ranking\.php/i, '/ranking.htm'),
      ]
    : [url];
  let lastErr = null;

  for (const candidateUrl of candidates) {
    const proxyUrl = `https://npk-proxy.npk-proxy.workers.dev/?url=${encodeURIComponent(candidateUrl)}`;
    dbgLegacy('fetchLegacy:start', { url: candidateUrl, originalUrl: url, proxyUrl });
    const started = performance.now();
    let res;
    try {
      res = await fetch(proxyUrl, { signal: AbortSignal.timeout(28000) });
    } catch (err) {
      lastErr = err;
      dbgLegacyError('fetchLegacy:fetch failed', { url: candidateUrl, message: err?.message });
      continue;
    }

    dbgLegacy('fetchLegacy:response', { url: candidateUrl, ok: res.ok, status: res.status, ms: Math.round(performance.now() - started) });
    if (!res.ok) {
      lastErr = new Error(`HTTP ${res.status}`);
      if (res.status === 404) continue;
      throw lastErr;
    }

    const buf  = await res.arrayBuffer();
    dbgLegacy('fetchLegacy:arrayBuffer', { url: candidateUrl, bytes: buf.byteLength });
    const utf8 = new TextDecoder('utf-8').decode(buf);
    const m = utf8.match(/charset\s*=\s*["']?([^\s"';>]+)/i);
    const declared = (m ? m[1].trim().toLowerCase() : 'utf-8');
    dbgLegacy('fetchLegacy:charset', { url: candidateUrl, declared, utf8Length: utf8.length, sample: utf8.slice(0, 120) });
    if (declared.includes('shift') || declared.includes('sjis') || declared === 'x-sjis') {
      try {
        const sjis = new TextDecoder('shift-jis').decode(buf);
        dbgLegacy('fetchLegacy:decoded', { url: candidateUrl, encoding: 'shift-jis', length: sjis.length, sample: sjis.slice(0, 120) });
        return sjis;
      } catch (err) {
        dbgLegacyError('fetchLegacy:shift-jis decode failed; fallback utf-8', err);
        return utf8;
      }
    }
    dbgLegacy('fetchLegacy:decoded', { url: candidateUrl, encoding: 'utf-8', length: utf8.length });
    return utf8;
  }

  throw lastErr || new Error('取得できる候補URLがありません');
}

// ── レガシーページ状態変数 ────────────────────────────────────────────────────
let legacyCurrentUrl   = '';
let legacyNavFromFname = null;
const legacyHistoryStack = [];

// ── DEBUG: レガシー遷移ログ ───────────────────────────────────────────────
const DEBUG_LEGACY_NAV = false;
function dbgLegacy(...args) {
  if (!DEBUG_LEGACY_NAV) return;
  const stamp = new Date().toISOString().slice(11, 23);
  console.log(`[legacy-debug ${stamp}]`, ...args);
}
function dbgLegacyError(...args) {
  if (!DEBUG_LEGACY_NAV) return;
  const stamp = new Date().toISOString().slice(11, 23);
  console.error(`[legacy-debug ${stamp}]`, ...args);
}
function showLegacyDebugMessage(message) {
  const c = document.getElementById('content');
  if (!c) return;
  const box = document.createElement('div');
  box.style.cssText = 'margin:10px;padding:10px;border:1px solid #f59e0b;border-radius:8px;background:#fffbeb;color:#92400e;font-size:12px;line-height:1.6;white-space:pre-wrap;';
  box.textContent = `[DEBUG] ${message}`;
  c.prepend(box);
}

function hideFilterDashboardSafe(reason = '') {
  const fd = document.getElementById('filter-dashboard');
  if (!fd) {
    dbgLegacy('hideFilterDashboardSafe:skip #filter-dashboard not found', { reason });
    return;
  }
  fd.classList.add('hidden');
  dbgLegacy('hideFilterDashboardSafe:done', { reason });
}



const LEGACY_CARD_ORG_ROOTS = new Set(['bosyu.htm', 'new_mmb.htm', 'organ.htm']);
const LEGACY_CARD_RESEARCH_ROOTS = new Set([
  'papers.htm', 'pape_b.htm', 'pape_d.htm', 'pape_a.htm', 'pape_g.htm', 'pape_c.htm', 'pape_h.htm',
  'pape_g_e.htm', 'pape_g_w.htm', 'kansen.htm', 'kensa.htm', 'ed.htm', 'sinri.htm', 'b_etc.htm',
  'kaimuall.htm', 'ranking.php', 'ranking.htm'
]);
const LEGACY_CARD_EXCLUDE_ROOTS = new Set([
  'pink.htm', 'today.htm', 'history.htm', 'historyall.htm', 'repo_e.htm', 'repo_w.htm', 'oversea.htm',
  ...((LEGACY_NAV_CATEGORY_DEFS.find(c => c.label === '地域') || {}).fnames || [])
]);

function legacyFnameFromUrl(url) {
  return (url || '').split('/').pop().split('?')[0].toLowerCase();
}

function detectLegacyCardCategory(currentUrl) {
  const currentFname = legacyFnameFromUrl(currentUrl);
  if (LEGACY_CARD_ORG_ROOTS.has(currentFname)) return '組織・参加';
  if (LEGACY_CARD_RESEARCH_ROOTS.has(currentFname)) return '研究・情報';
  if (isKaimuYearPage(currentFname)) return '研究・情報';
  if (LEGACY_CARD_EXCLUDE_ROOTS.has(currentFname)) return null;

  const legacyFnames = navStack
    .filter(v => v?.type === 'legacy' && v?.params?.url)
    .map(v => legacyFnameFromUrl(v.params.url));

  for (let i = legacyFnames.length - 1; i >= 0; i--) {
    const fname = legacyFnames[i];
    if (LEGACY_CARD_EXCLUDE_ROOTS.has(fname)) return null;
    if (LEGACY_CARD_ORG_ROOTS.has(fname)) return '組織・参加';
    if (LEGACY_CARD_RESEARCH_ROOTS.has(fname)) return '研究・情報';
  }
  return null;
}

function isKaimuYearPage(fname) {
  return /^kaimu(?!all)[a-z0-9_,-]*\.html?$/i.test(fname || '');
}

function kaimuYearLabelFromFname(fname, fallback = '') {
  const fallbackText = String(fallback || '');
  let m = fallbackText.match(/(令和|平成|昭和)\s*(\d{1,2})\s*年/);
  if (m) return `${m[1]}${Number(m[2])}年`;

  const name = String(fname || '').toLowerCase();
  m = name.match(/(?:^|[_-])(?:h|heisei)(\d{1,2})(?:[^0-9]|$)/i);
  if (m) return `平成${Number(m[1])}年`;
  m = name.match(/(?:^|[_-])(?:r|reiwa)(\d{1,2})(?:[^0-9]|$)/i);
  if (m) return `令和${Number(m[1])}年`;

  // 旧会務報告の kaimu1〜kaimu9 は、平成14〜22年に対応する連番。
  m = name.match(/^kaimu[_-]?([1-9])\.html?$/i);
  if (m) return `平成${Number(m[1]) + 13}年`;

  m = name.match(/(19|20)\d{2}/);
  if (m) {
    const year = Number(m[0]);
    if (year >= 1989 && year <= 2019) return `平成${year - 1988}年`;
    if (year >= 2019) return `令和${year - 2018}年`;
  }
  return '年別';
}

const kaimuAuthorCache = new Map();

function extractKaimuAuthor(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  const text = (doc.body?.textContent || '').replace(/\u00a0/g, ' ');
  let m = text.match(/by\s*[　\s]*([^\n\r。<]{1,40}?氏)/i);
  if (m) return m[1].replace(/\s+/g, ' ').trim();
  m = text.match(/(?:著者|投稿者|筆者)\s*[：:　\s]*([^\n\r。<]{1,40}?氏)/);
  if (m) return m[1].replace(/\s+/g, ' ').trim();
  return '';
}

function linkAlreadyHasKaimuAuthor(link) {
  if (link?.querySelector?.('.paper-author')) return true;
  let node = link.nextSibling;
  while (node) {
    if (node.nodeType === 1 && node.tagName?.toLowerCase() === 'a') return false;
    const text = (node.textContent || '').replace(/[\s　]/g, '');
    if (text) return true;
    node = node.nextSibling;
  }
  return false;
}

function appendKaimuAuthor(link, author) {
  if (!link || !author || linkAlreadyHasKaimuAuthor(link)) return;
  const span = document.createElement('span');
  span.className = 'paper-author kaimu-author';
  span.textContent = author;
  if (link.classList.contains('paper-list-item')) {
    link.appendChild(span);
  } else {
    link.insertAdjacentElement('afterend', span);
  }
}

function extractInlineKaimuAuthor(link) {
  const removeNodes = [];
  const parts = [];
  let node = link.nextSibling;
  while (node) {
    if (node.nodeType === 1 && node.tagName?.toLowerCase() === 'a') break;
    const text = (node.textContent || '').replace(/\u00a0/g, ' ');
    if (text.trim()) {
      parts.push(text);
      removeNodes.push(node);
    } else if (node.nodeType === 1 && node.tagName?.toLowerCase() === 'br') {
      removeNodes.push(node);
    }
    node = node.nextSibling;
  }

  const author = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!author || author.length > 40) return '';
  if (/報告|調査|体験記|会務|研究|論文/.test(author)) return '';
  removeNodes.forEach(n => n.remove());
  return author;
}

function formatKaimuYearLinks(container) {
  if (!container) return;
  const cards = [...container.querySelectorAll('.org-legacy-card')];
  cards.forEach(card => {
    [...card.childNodes].forEach(node => {
      const text = (node.textContent || '').replace(/[\s　]/g, '');
      if (/^[HR]\d{1,2}年会務報告$/i.test(text)) node.remove();
    });
  });
  cards.forEach(card => card.querySelectorAll('a[href]').forEach(link => {
    if (!/\/papers\//i.test(link.href)) return;
    const existingTitle = link.querySelector('.paper-title')?.textContent || '';
    const existingAuthor = link.querySelector('.paper-author')?.textContent || '';
    const title = (existingTitle || link.textContent || '').replace(/\s+/g, ' ').trim();
    if (!title) return;
    const author = existingAuthor.trim() || extractInlineKaimuAuthor(link);
    link.classList.add('paper-list-item', 'kaimu-list-item');
    link.innerHTML = `<span class="paper-title">${escHtml(title)}</span>`;
    if (author) appendKaimuAuthor(link, author);
    const parent = link.parentElement;
    if (parent && parent !== card) parent.classList.add('kaimu-box-reset');
  }));

  cards.forEach(card => {
    [...card.childNodes].forEach(node => {
      if (node.nodeType === 3 && !node.textContent.replace(/[\s 　]/g, '')) node.remove();
      if (node.nodeType === 1 && node.tagName?.toLowerCase() === 'br') node.remove();
    });
  });
}

function formatKaimuAllPage(container) {
  const navWrap = container?.querySelector('.org-legacy-nav');
  if (!navWrap) return;
  const anniversaryLink = [...navWrap.querySelectorAll('a[data-nav-btn]')]
    .find(a => legacyFnameFromUrl(a.href) === '20y.htm');

  const yearLinks = [...navWrap.querySelectorAll('a[data-nav-btn]')]
    .map(a => {
      const label = (a.textContent || '').trim();
      let m = label.match(/^令和(\d{1,2})年$/);
      if (m) return { href: a.href, label, era: 'R', year: Number(m[1]), original: a };
      m = label.match(/^平成(\d{1,2})年$/);
      if (m) return { href: a.href, label, era: 'H', year: Number(m[1]), original: a };
      return null;
    })
    .filter(Boolean);
  if (yearLinks.length === 0) return;

  if (anniversaryLink) {
    const group = anniversaryLink.closest('.nav-btn-group');
    anniversaryLink.remove();
    if (group && !group.querySelector('a[data-nav-btn]')) group.remove();
  }

  yearLinks.forEach(({ original }) => {
    const group = original.closest('.nav-btn-group');
    original.remove();
    if (group && !group.querySelector('a[data-nav-btn]')) group.remove();
  });
  navWrap.querySelectorAll('.nav-category-header').forEach(header => {
    const group = header.closest('.nav-btn-group') || header.parentElement;
    if (group && !group.querySelector('a[data-nav-btn]')) group.remove();
  });

  const groups = [
    { label: '令和（R02-R08）', items: yearLinks.filter(x => x.era === 'R' && x.year >= 2 && x.year <= 8) },
    { label: '平成後期（H21-H31）', items: yearLinks.filter(x => x.era === 'H' && x.year >= 21 && x.year <= 31) },
    { label: '平成前期（H12-H20）', items: yearLinks.filter(x => x.era === 'H' && x.year >= 12 && x.year <= 20) },
  ];

  const section = document.createElement('div');
  section.className = 'nav-btn-group kaimu-year-accordion-group';
  groups.forEach(group => {
    if (group.items.length === 0) return;
    group.items.sort((a, b) => b.year - a.year);

    const wrap = document.createElement('div');
    wrap.className = 'region-accordion';
    const toggle = document.createElement('div');
    toggle.className = 'region-accordion-toggle';
    toggle.textContent = group.label;
    const body = document.createElement('div');
    body.className = 'region-accordion-body';

    group.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'region-pref-item';
      row.innerHTML = `<span>${escHtml(item.label)}</span>`;
      row.onclick = () => openLegacyPage(item.href, item.label);
      body.appendChild(row);
    });

    toggle.onclick = () => {
      toggle.classList.toggle('open');
      body.classList.toggle('open');
    };
    wrap.appendChild(toggle);
    wrap.appendChild(body);
    section.appendChild(wrap);
  });
  if (anniversaryLink) {
    const wrap = document.createElement('div');
    wrap.className = 'region-accordion';
    const item = document.createElement('div');
    item.className = 'region-accordion-toggle kaimu-single-toggle';
    item.textContent = '20周年記念';
    item.onclick = () => openLegacyPage(anniversaryLink.href, '20周年記念');
    wrap.appendChild(item);
    section.appendChild(wrap);
  }

  if (section.childNodes.length > 0) navWrap.insertBefore(section, navWrap.firstChild);
  navWrap.querySelectorAll('.nav-category-header').forEach(header => {
    if (header.textContent.trim() === 'レポート' || header.textContent.trim() === '研究・情報') header.remove();
  });
  navWrap.querySelectorAll('.nav-btn-group').forEach(group => {
    const text = (group.textContent || '').replace(/[\s 　]/g, '');
    if (!text && !group.querySelector('a[data-nav-btn],.region-accordion,.region-pref-item')) group.remove();
  });
}

function parseKaimuYearLinks(html) {
  const base = 'https://pinsalo.info/sp/';
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  const seen = new Set();
  return [...doc.querySelectorAll('a[href]')]
    .map(a => {
      let href = a.getAttribute('href') || '';
      const jtpMatch = href.match(/JavaScript:TP\(['"](.+?)['"]\)/i);
      if (jtpMatch) href = jtpMatch[1];

      let absUrl = '';
      try {
        absUrl = new URL(href, base).href;
      } catch {
        return null;
      }

      const img = a.querySelector('img');
      let label = (a.textContent || '').trim() || legacyLabelFromImgSrc(img);
      if (!label) label = kaimuYearLabelFromFname(legacyFnameFromUrl(absUrl));

      let m = label.match(/^令和(\d{1,2})年$/);
      if (m) {
        return { href: absUrl, label, era: 'R', year: Number(m[1]) };
      }
      m = label.match(/^平成(\d{1,2})年$/);
      if (m) {
        return { href: absUrl, label, era: 'H', year: Number(m[1]) };
      }
      return null;
    })
    .filter(item => {
      if (!item || seen.has(item.href)) return false;
      seen.add(item.href);
      return true;
    });
}

function collectInlineKaimuAuthor(link) {
  const parts = [];
  let node = link.nextSibling;
  while (node) {
    if (node.nodeType === 1 && node.tagName?.toLowerCase() === 'a') break;
    const text = (node.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) parts.push(text);
    node = node.nextSibling;
  }
  const author = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!author || author.length > 40) return '';
  if (/報告|調査|体験記|会務|研究|論文/.test(author)) return '';
  return author;
}

function rebuildKaimuYearReportList(container) {
  const wrap = container?.querySelector('.org-legacy-wrap');
  if (!wrap) return;

  const reports = [...wrap.querySelectorAll('.org-legacy-card a[href]')]
    .filter(link => /\/papers\//i.test(link.href))
    .map(link => {
      const title = (link.querySelector('.paper-title')?.textContent || link.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
      const author = (link.querySelector('.paper-author')?.textContent || collectInlineKaimuAuthor(link)).trim();
      return { href: link.href, title, author };
    })
    .filter(item => item.href && item.title);

  if (reports.length === 0) return;

  wrap.querySelectorAll('.org-legacy-card').forEach(card => card.remove());

  const card = document.createElement('div');
  card.className = 'org-legacy-card kaimu-report-list-card';
  const list = document.createElement('div');
  list.className = 'kaimu-report-list';

  reports.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'paper-list-item kaimu-list-item kaimu-report-card';
    a.innerHTML = `<span class="paper-title">${escHtml(item.title)}</span>`;
    if (item.author) {
      const author = document.createElement('span');
      author.className = 'paper-author kaimu-author';
      author.textContent = item.author;
      a.appendChild(author);
    }
    list.appendChild(a);
  });

  card.appendChild(list);
  wrap.appendChild(card);
}

async function hydrateKaimuYearAuthors(container, pageUrl) {
  if (!container) return;
  const links = [...container.querySelectorAll('.org-legacy-card a[href]')]
    .filter(link => !linkAlreadyHasKaimuAuthor(link))
    .filter(link => /\/papers\//i.test(link.href));
  if (links.length === 0) return;

  await Promise.allSettled(links.map(async link => {
    const href = link.href;
    let author = kaimuAuthorCache.get(href);
    if (author === undefined) {
      try {
        author = extractKaimuAuthor(await fetchLegacy(href));
      } catch {
        author = '';
      }
      kaimuAuthorCache.set(href, author);
    }
    if (legacyCurrentUrl !== pageUrl) return;
    appendKaimuAuthor(link, author);
  }));
}

function normalizeResearchPaperAuthorLines(container) {
  if (!container) return;

  const nextMeaningfulSibling = node => {
    let current = node?.nextSibling || null;
    while (current && current.nodeType === 3 && !current.textContent.trim()) {
      current = current.nextSibling;
    }
    return current;
  };

  container.querySelectorAll('a[href]').forEach(link => {
    link.querySelectorAll('br').forEach(br => {
      const afterText = [];
      let current = br.nextSibling;
      while (current) {
        afterText.push(current.textContent || '');
        current = current.nextSibling;
      }
      const authorText = afterText.join('').trim();
      if (authorText && /氏$/.test(authorText) && authorText.length <= 40) {
        br.replaceWith(document.createTextNode('　'));
      }
    });

    const br = nextMeaningfulSibling(link);
    if (!br || br.nodeType !== 1 || br.tagName.toLowerCase() !== 'br') return;

    const authorNode = nextMeaningfulSibling(br);
    const authorText = (authorNode?.textContent || '').trim();
    if (!authorText || !/氏$/.test(authorText) || authorText.length > 40) return;

    br.replaceWith(document.createTextNode('　'));
  });
}

function formatResearchPaperListLinks(container) {
  if (!container) return;

  container.querySelectorAll('.org-legacy-card a[href]').forEach(link => {
    if (link.matches('[data-nav-btn], .genre-tab, .paper-list-item')) return;

    const rawText = (link.textContent || '').replace(/\s+/g, ' ').trim();
    if (!rawText) return;

    const authorMatch = rawText.match(/^(.+?)[ 　]+([^ 　]{1,40}氏)$/);
    const title = authorMatch ? authorMatch[1].trim() : rawText;
    const author = authorMatch ? authorMatch[2].trim() : '';
    if (!title) return;

    link.classList.add('paper-list-item');
    link.textContent = '';

    const titleEl = document.createElement('span');
    titleEl.className = 'paper-title';
    titleEl.textContent = title;
    link.appendChild(titleEl);

    if (author) {
      const authorEl = document.createElement('span');
      authorEl.className = 'paper-author';
      authorEl.textContent = author;
      link.appendChild(authorEl);
    }
  });

  container.querySelectorAll('.org-legacy-card').forEach(card => {
    const firstItem = card.querySelector('a.paper-list-item');
    if (!firstItem) return;

    const removable = [];
    let node = card.firstChild;
    while (node && node !== firstItem) {
      const next = node.nextSibling;
      const text = (node.textContent || '').replace(/[\s 　]/g, '');
      const isPlainHeading = node.nodeType === 3
        || (node.nodeType === 1 && !node.querySelector('a[href],img,table,input,button,select,textarea'));
      if (isPlainHeading && text.length <= 30) removable.push(node);
      node = next;
    }

    removable.forEach(node => node.remove());
  });
}

function collectRankingPagerLinks(container) {
  const links = [];
  const seen = new Set();

  container.querySelectorAll('.org-legacy-card a[href]').forEach(a => {
    const href = a.href || a.getAttribute('href') || '';
    const raw = (a.textContent || '').replace(/\s+/g, '').trim();
    if (!href) return;

    let start = 0;
    let end = 0;
    let m = raw.match(/(\d{1,5})[－ー\-〜～~](\d{1,5})/);
    if (m) {
      start = Number(m[1]);
      end = Number(m[2]);
    } else {
      m = raw.match(/^[－ー\-](\d{2,5})$/);
      if (m) {
        end = Number(m[1]);
        start = end - 99;
      }
    }

    if (!start || !end || start < 1 || end < start) return;
    const key = `${start}-${end}:${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ href, start, end, label: `${start}-${end}位` });
  });

  links.sort((a, b) => a.start - b.start);
  return links;
}

function formatRankingPage(container) {
  if (!container) return;

  const pagerLinks = collectRankingPagerLinks(container);
  let pagerRendered = false;

  container.querySelectorAll('.org-legacy-card').forEach(card => {
    const text = (card.textContent || '').replace(/\u00a0/g, ' ');
    const entries = [];
    const re = /(\d+)\s*[\.．]\s*([^（()\n\r]{1,60}?氏)\s*[（(]\s*(\d{1,6})\s*[）)]/g;
    let match;
    while ((match = re.exec(text)) !== null) {
      entries.push({
        rank: match[1],
        name: match[2].replace(/\s+/g, ' ').trim(),
        score: Number(match[3]),
      });
    }
    if (entries.length < 3) return;

    const list = document.createElement('div');
    list.className = 'ranking-list';
    if (!pagerRendered && pagerLinks.length > 0) {
      pagerRendered = true;
      const pager = document.createElement('div');
      pager.className = 'ranking-pager';
      pagerLinks.forEach(link => {
        const a = document.createElement('a');
        a.className = 'ranking-page-link';
        a.href = link.href;
        a.textContent = link.label;
        pager.appendChild(a);
      });
      list.appendChild(pager);
    }

    let currentGroupStart = null;
    entries.forEach(entry => {
      const rankNum = Number(entry.rank);
      const groupStart = Math.floor((rankNum - 1) / 100) * 100 + 1;
      if (groupStart !== currentGroupStart) {
        currentGroupStart = groupStart;
        const groupTitle = document.createElement('div');
        groupTitle.className = 'ranking-group-title';
        groupTitle.textContent = `${groupStart}-${groupStart + 99}位`;
        list.appendChild(groupTitle);
      }

      const item = document.createElement('div');
      item.className = 'ranking-item';
      item.innerHTML = `
        <span class="ranking-rank">${escHtml(entry.rank)}</span>
        <span class="ranking-main">
          <span class="ranking-name">${escHtml(entry.name)}</span>
          <span class="ranking-score">${entry.score.toLocaleString()} pt</span>
        </span>`;
      list.appendChild(item);
    });

    card.innerHTML = '';
    card.appendChild(list);
  });
}

function formatOrganizationMembersPage(container) {
  if (!container) return;

  const textFromNodes = nodes => {
    let text = '';
    nodes.forEach(node => {
      if (node.nodeType === 3) {
        text += node.textContent || '';
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      if (/^(br|p|div|center|tr)$/i.test(tag)) text += '\n';
      text += node.textContent || '';
      if (/^(br|p|div|center|tr)$/i.test(tag)) text += '\n';
    });
    return text;
  };

  const buildMemberOrg = rawText => {
    let text = rawText
      .replace(/会員一覧/g, '')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/(元老委員会|運営諮問委員会)/g, '\n$1\n')
      .replace(/(副委員長|主席委員|委員長|副会長|会長|委員(?!会))(?=[ 　A-Za-zＡ-Ｚａ-ｚ一-龥ぁ-んァ-ヶ])/g, '\n$1 ');

    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    const execRows = []; // 会長・副会長（委員会に属さないトップレベル役員）
    const sections = [];
    let current = null;
    const EXEC_ORDER = ['会長', '副会長'];
    lines.forEach(line => {
      if (line === '元老委員会' || line === '運営諮問委員会') {
        current = { title: line, rows: [] };
        sections.push(current);
        return;
      }
      const m = line.match(/^(副委員長|主席委員|委員長|副会長|会長|委員)\s*(.+)$/);
      if (!m) return;
      const names = (m[2].match(/[^氏]+氏/g) || [m[2]])
        .map(s => s.trim())
        .filter(Boolean);
      const row = { role: m[1], names };
      // 会長・副会長は委員会の前後に関わらず独立枠へ
      if (EXEC_ORDER.includes(m[1])) {
        execRows.push(row);
      } else if (current) {
        current.rows.push(row);
      }
    });

    // 会長→副会長の順に並べ直す
    execRows.sort((a, b) => EXEC_ORDER.indexOf(a.role) - EXEC_ORDER.indexOf(b.role));

    // 表示順: 会長/副会長（タイトルなし）→ 各委員会
    const allSections = [];
    if (execRows.length > 0) allSections.push({ title: null, rows: execRows });
    allSections.push(...sections.filter(s => s.rows.length > 0));

    if (allSections.length === 0) return null;

    const wrap = document.createElement('div');
    wrap.className = 'member-org';
    allSections.forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.className = section.title ? 'member-org-section' : 'member-org-section member-org-section--exec';
      if (section.title) {
        sectionEl.innerHTML = `<div class="member-org-title">${escHtml(section.title)}</div>`;
      }
      section.rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'member-role-row';
        rowEl.innerHTML = `
          <div class="member-role">${escHtml(row.role)}</div>
          <div class="member-names">${row.names.map(name => `<div class="member-name">${escHtml(name)}</div>`).join('')}</div>`;
        sectionEl.appendChild(rowEl);
      });
      wrap.appendChild(sectionEl);
    });
    return wrap;
  };

  container.querySelectorAll('.org-legacy-card').forEach(card => {
    let removedTitle = false;
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue || '';
      if (!text.replace(/[\s 　]/g, '')) continue;
      const normalized = text.replace(/^[\s 　]+/, '');
      if (normalized.startsWith('会員一覧')) {
        node.nodeValue = text.replace('会員一覧', '').replace(/^[\s 　\r\n]+/, '');
        removedTitle = true;
      }
      break;
    }

    if (removedTitle) {
      while (card.firstChild) {
        const first = card.firstChild;
        const isEmptyText = first.nodeType === 3 && !first.textContent.replace(/[\s 　]/g, '');
        const isBreak = first.nodeType === 1 && /^(br|hr)$/i.test(first.tagName);
        if (!isEmptyText && !isBreak) break;
        first.remove();
      }
    }

    card.querySelectorAll('a[href]').forEach(link => {
      if (link.matches('[data-nav-btn], .genre-tab')) return;
      link.classList.add('member-list-link');
    });

    const firstLink = card.querySelector('a[href]');
    const memberNodes = [];
    let node = card.firstChild;
    while (node && node !== firstLink) {
      const next = node.nextSibling;
      memberNodes.push(node);
      node = next;
    }
    const org = buildMemberOrg(textFromNodes(memberNodes));
    if (org) {
      memberNodes.forEach(node => node.remove());
      const sectionCards = [...org.children].map(section => {
        const sectionCard = document.createElement('div');
        sectionCard.className = 'org-legacy-card member-org-card';
        sectionCard.appendChild(section);
        return sectionCard;
      });
      sectionCards.forEach(sectionCard => card.parentNode.insertBefore(sectionCard, card));
    }
  });

  container.querySelectorAll('.org-legacy-card').forEach(card => {
    const text = (card.textContent || '').replace(/[\s 　]/g, '');
    if (!text && !card.querySelector('a[href],img,table,input,button,select,textarea')) card.remove();
  });
}

function formatRecruitmentPage(container) {
  if (!container) return;

  container.querySelectorAll('.org-legacy-card').forEach(card => {
    const links = Array.from(card.querySelectorAll('a[href]'));
    const ctaLink = links.find(link => /こちら|メール|送信/i.test(link.textContent || '')) || links[0] || null;
    const ctaHref = ctaLink?.href || ctaLink?.getAttribute('href') || '';
    const rawText = (card.textContent || '')
      .replace(/会員募集/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    // innerHTML → 行配列に変換（<br>/<p> を改行として扱う）
    let rawHtml = card.innerHTML;
    rawHtml = rawHtml.replace(/<br\s*\/?>\s*/gi, '\n');
    rawHtml = rawHtml.replace(/<\/?(p|div|li)[^>]*>/gi, '\n');
    rawHtml = rawHtml.replace(/<[^>]+>/g, '');
    const lines = rawHtml
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ').replace(/ /g, ' ')
      .split('\n').map(s => s.trim()).filter(Boolean);

    if (!lines.some(l => /入会案内/.test(l))) return;

    // ステートマシンで各セクションに仕分け
    const bodyLines = [];
    const exampleEntries = [];
    let state = 'body'; // body → cta → examples → done
    let cur = null;

    lines.forEach(line => {
      if (/^(会員募集|入会案内)$/.test(line)) return;
      if (/^入会ご希望の方は/.test(line)) { state = 'cta'; return; }
      if (/^記載例$/.test(line)) { state = 'examples'; return; }
      if (/^ふるって/.test(line)) { state = 'done'; return; }
      if (state === 'cta' || state === 'done') return;

      if (state === 'examples') {
        const m = line.match(/^(ハンドルネーム|居住地域|活動地域)[　\s]+(.+)$/);
        if (!m) return;
        const [, key, val] = m;
        if (key === 'ハンドルネーム') { if (cur) exampleEntries.push(cur); cur = { handle: val }; }
        else if (key === '居住地域' && cur) cur.residence = val;
        else if (key === '活動地域' && cur) cur.activity = val;
        return;
      }
      bodyLines.push(line);
    });
    if (cur) exampleEntries.push(cur);

    const paragraphs = bodyLines.join(' ')
      .split(/(?<=。)\s*/).map(s => s.trim()).filter(Boolean);

    // HTML組み立て
    const wrap = document.createElement('div');
    wrap.className = 'recruit-page';
    let innerHtml = `
      <div class="recruit-lead">
        <div class="recruit-heading">入会案内</div>
        <div class="recruit-body">
          ${paragraphs.map(p => `<p>${escHtml(p)}</p>`).join('')}
        </div>
      </div>
      <div class="recruit-requirements">
        <div class="recruit-requirements-title">メールに記載する内容</div>
        <ul>
          <li>ハンドルネーム</li>
          <li>居住地域（市町村まで。住居表示地番は不要）</li>
          <li>活動地域</li>
        </ul>
      </div>`;

    if (exampleEntries.length > 0) {
      innerHtml += `<div class="recruit-examples"><div class="recruit-examples-title">記載例</div>`;
      exampleEntries.forEach(entry => {
        innerHtml += `<div class="recruit-example-card">` +
          [['ハンドルネーム', entry.handle], ['居住地域', entry.residence], ['活動地域', entry.activity]]
            .filter(([, v]) => v)
            .map(([label, val]) =>
              `<div class="recruit-example-row">` +
              `<div class="recruit-example-label">${escHtml(label)}</div>` +
              `<div class="recruit-example-value">${escHtml(val)}</div>` +
              `</div>`)
            .join('') +
          `</div>`;
      });
      innerHtml += `</div>`;
    }

    if (ctaHref) innerHtml += `<a class="recruit-cta" href="${escHtml(ctaHref)}">入会希望メールを送る</a>`;

    wrap.innerHTML = innerHtml;
    card.innerHTML = '';
    card.appendChild(wrap);
  });
}

function formatPersonnelPage(container) {
  if (!container) return;

  const SECTION_RE = /^[＜<]([^＞>]{1,20})[＞>]$/;
  const DATE_RE = /^(令和|平成|昭和)\d+年\d+月\d+日?/;
  const SECTION_COLORS = {
    '採用': '#15803d', '除籍': '#dc2626', '昇格': '#1d4ed8',
    '降格': '#b45309', '異動': '#7c3aed', '表彰': '#be185d',
  };
  const DEFAULT_COLOR = '#64748b';

  const wrap = container.querySelector('.org-legacy-wrap') || container;
  const cards = [...wrap.querySelectorAll('.org-legacy-card')];
  if (cards.length === 0) return;

  // カードのHTMLをプレーンテキスト行に変換
  function cardToLines(card) {
    let html = card.innerHTML;
    html = html.replace(/<br\s*\/?>\s*/gi, '\n');
    html = html.replace(/<\/?(li|p|div|h[1-6])[^>]*>/gi, '\n');
    html = html.replace(/<[^>]+>/g, '');
    return html
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ').replace(/&#39;/g, "\'").replace(/&quot;/g, '"')
      .replace(/\u00a0/g, ' ')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
  }

  // 全カードの行を結合
  const allLines = [];
  cards.forEach(card => allLines.push(...cardToLines(card)));

  // 行をパースして { date, sections:[ {name, color, items[]} ] } のグループに
  const groups = [];
  let currentDate = null;
  let currentSection = null;

  function flushSection() {
    if (!currentSection) return;
    if (currentSection.items.length > 0) {
      let group = groups.find(g => g.date === currentDate);
      if (!group) { group = { date: currentDate, sections: [] }; groups.push(group); }
      group.sections.push({ ...currentSection, items: [...currentSection.items] });
    }
    currentSection = null;
  }

  allLines.forEach(line => {
    if (/^人事異動(?:告示)?$/.test(line)) return;
    if (DATE_RE.test(line)) {
      flushSection();
      currentDate = line;
      return;
    }
    const secMatch = line.match(SECTION_RE);
    if (secMatch) {
      flushSection();
      const name = secMatch[1];
      currentSection = { name, color: SECTION_COLORS[name] || DEFAULT_COLOR, items: [] };
      return;
    }
    if (currentSection) {
      currentSection.items.push(line);
    } else {
      let group = groups.find(g => g.date === currentDate);
      if (!group) { group = { date: currentDate, sections: [] }; groups.push(group); }
      let defaultSec = group.sections.find(s => s.name === '');
      if (!defaultSec) {
        defaultSec = { name: '', color: DEFAULT_COLOR, items: [] };
        group.sections.push(defaultSec);
      }
      defaultSec.items.push(line);
    }
  });
  flushSection();

  if (groups.length === 0) return;

  // HTML生成
  let html = '';
  groups.forEach(group => {
    if (group.date) {
      html += `<div class="personnel-date-line">${escHtml(group.date)}</div>`;
    }
    group.sections.forEach(sec => {
      if (sec.name) {
        html += `<div class="personnel-section-hd">` +
          `<span class="personnel-badge" style="background:${sec.color}">${escHtml(sec.name)}</span>` +
          `</div>`;
      }
      if (sec.items.length > 0) {
        html += '<ul class="personnel-item-list">';
        sec.items.forEach(item => {
          // 辞令行・理由行はサブラインとして字下げ表示
          const isSub = /命ずる|命ず。|に補する|に任ずる|に充てる|により.{0,30}する。?$/.test(item);
          html += `<li class="${isSub ? 'personnel-line-sub' : 'personnel-line'}">${escHtml(item)}</li>`;
        });
        html += '</ul>';
      }
    });
  });

  // 既存カードを削除して新カードに差し替え
  cards.forEach(c => c.remove());
  const newCard = document.createElement('div');
  newCard.className = 'org-legacy-card personnel-redesign';
  newCard.innerHTML = html;
  wrap.appendChild(newCard);
}

function formatKaimuYearPage(container, yearLabel) {
  if (!container) return;
  const pageUrl = legacyCurrentUrl;

  container.querySelectorAll('.org-legacy-title').forEach(el => {
    el.textContent = `会務報告（${yearLabel}）`;
  });

  rebuildKaimuYearReportList(container);
  hydrateKaimuYearAuthors(container, pageUrl);
}

function enhanceOrganizationLegacyPage(container, currentUrl, title) {
  const fname = legacyFnameFromUrl(currentUrl);
  const cardCategory = detectLegacyCardCategory(currentUrl);
  if (!cardCategory) return;
  if (!container) return;
  const enhancedKey = `${cardCategory}:${fname}`;
  if (container.dataset.orgEnhanced === '1' && container.dataset.orgEnhancedUrl === enhancedKey) return;

  const pageMeta = {
    'bosyu.htm': {
      title: '会員募集',
    },
    'new_mmb.htm': {
      title: '人事異動',
    },
    'organ.htm': {
      title: '会員一覧',
    },
    'papers.htm': {
      title: '研究論文',
    },
    'pape_b.htm': {
      title: '医学・心理学',
    },
    'pape_d.htm': {
      title: 'ぼったくり風俗',
    },
    'pape_a.htm': {
      title: '経営・経済学',
    },
    'pape_g.htm': {
      title: '業界動向調査',
    },
    'pape_c.htm': {
      title: '風俗関連法規',
    },
    'pape_h.htm': {
      title: 'ノンセクション',
    },
    'pape_g_e.htm': {
      title: '東日本',
    },
    'pape_g_w.htm': {
      title: '西日本',
    },
    'kansen.htm': {
      title: '感染症',
    },
    'kensa.htm': {
      title: '性病検査',
    },
    'ed.htm': {
      title: 'ED（勃起障害）',
    },
    'sinri.htm': {
      title: '心理学',
    },
    'b_etc.htm': {
      title: 'その他（医学）',
    },
    'kaimuall.htm': {
      title: '会務報告',
    },
    '20y.htm': {
      title: '20周年記念',
    },
    'ranking.php': {
      title: 'ランキング',
    },
    'ranking.htm': {
      title: 'ランキング',
    }
  };
  const fallbackCategory = cardCategory || 'ページ';
  const isKaimuYear = isKaimuYearPage(fname);
  const kaimuYearLabel = isKaimuYear ? kaimuYearLabelFromFname(fname, title) : '';
  const meta = isKaimuYear
    ? { title: `会務報告（${kaimuYearLabel}）` }
    : (pageMeta[fname] || { title: title || fallbackCategory, sub: `${fallbackCategory}カテゴリ配下の内容をカード形式に整えて表示しています。` });

  if (cardCategory === '研究・情報') {
    normalizeResearchPaperAuthorLines(container);
  }

  const isNavNode = node => node.nodeType === 1 && node.matches('.nav-btn-group,.genre-tabs');
  const hasUsefulContent = node => {
    if (node.nodeType === 3) return !!node.textContent.replace(/[\s 　]/g, '');
    if (node.nodeType !== 1) return false;
    const el = node;
    if (isNavNode(el)) return true;
    if (el.matches('.org-legacy-wrap,.org-legacy-nav')) return true;
    const text = (el.textContent || '').replace(/[\s 　]/g, '');
    return !!text || !!el.querySelector('a[href],img[src],table,input,button,select,textarea');
  };

  const navNodes = [];
  const bodyNodes = [];
  Array.from(container.childNodes).forEach(node => {
    if (!hasUsefulContent(node)) { node.remove(); return; }
    if (isNavNode(node)) navNodes.push(node);
    else bodyNodes.push(node);
  });

  const wrap = document.createElement('div');
  wrap.className = 'org-legacy-wrap';
  if (cardCategory === '研究・情報') wrap.classList.add('research-legacy-wrap');
  wrap.innerHTML = `
    <div class="org-legacy-title-card">
      <div class="org-legacy-title">${escHtml(meta.title || title || LEGACY_NAV_LABELS[fname] || '組織・参加')}</div>
    </div>`;

  const appendCard = card => {
    if (!card || card.childNodes.length === 0) return;
    const text = (card.textContent || '').replace(/[\s 　]/g, '');
    if (!text && !card.querySelector('a[href],img[src],table,input,button,select,textarea')) return;
    wrap.appendChild(card);
  };

  let card = document.createElement('div');
  card.className = 'org-legacy-card';
  bodyNodes.forEach(node => {
    const tag = node.nodeType === 1 && node.tagName ? node.tagName.toLowerCase() : '';
    const isSeparator = tag === 'hr' || (tag === 'br' && card.childNodes.length > 0);
    if (isSeparator) {
      appendCard(card);
      card = document.createElement('div');
      card.className = 'org-legacy-card';
      node.remove();
      return;
    }
    card.appendChild(node);
  });
  appendCard(card);

  const navWrap = document.createElement('div');
  navWrap.className = 'org-legacy-nav';
  navNodes.forEach(node => navWrap.appendChild(node));

  container.innerHTML = '';
  container.appendChild(wrap);
  if (navWrap.childNodes.length > 0 && !isKaimuYear) container.appendChild(navWrap);
  if (cardCategory === '研究・情報' && !isKaimuYear) {
    formatResearchPaperListLinks(container);
  }
  if (fname === 'ranking.php' || fname === 'ranking.htm') {
    formatRankingPage(container);
  }
  if (fname === 'organ.htm') {
    formatOrganizationMembersPage(container);
  }
  if (fname === 'bosyu.htm') {
    formatRecruitmentPage(container);
  }
  if (fname === 'new_mmb.htm') {
    formatPersonnelPage(container);
  }
  if (fname === 'kaimuall.htm') {
    formatKaimuAllPage(container);
  }
  if (isKaimuYear) {
    formatKaimuYearPage(container, kaimuYearLabel);
  }
  container.dataset.orgEnhanced = '1';
  container.dataset.orgEnhancedUrl = enhancedKey;
}

function renderLegacy(html, url, restoreScroll = null, sourceTitle = '') {
  dbgLegacy('renderLegacy:start', { url, htmlLength: html?.length, restoreScroll });
  const doc  = new DOMParser().parseFromString(html, 'text/html');
  const base = new URL(url);
  dbgLegacy('renderLegacy:parsed', { title: doc.title, links: doc.querySelectorAll('a[href]').length, imgs: doc.querySelectorAll('img').length });

  doc.querySelectorAll('[src],[href]').forEach(el => {
    const attr = el.hasAttribute('href') ? 'href' : 'src';
    try { el.setAttribute(attr, new URL(el.getAttribute(attr), base).href); } catch {}
  });

  [
    'script','noscript','iframe','object','embed','ins','ads',
    '[src*="dtiserv"]','[href*="dtiserv"]',
    '[src*="affiliate"]','[href*="affiliate"]',
    '[src*="adserv"]','[href*="adserv"]',
    '[href*="precious"]',
  ].forEach(sel => doc.querySelectorAll(sel).forEach(e => e.remove()));

  doc.querySelectorAll('[bgcolor]').forEach(el => el.removeAttribute('bgcolor'));
  doc.querySelectorAll('[color="#000000"],[color="#000"],[color="black"]').forEach(el => el.removeAttribute('color'));

  dbgLegacy('renderLegacy:before legacyReplaceImgButtons');
  legacyReplaceImgButtons(doc, url);
  dbgLegacy('renderLegacy:after legacyReplaceImgButtons', { bodyLength: (doc.body?.innerHTML || '').length });
  try {
    postProcessReportDoc(doc);
  } catch (postProcessError) {
    console.warn('レガシーページ後処理失敗:', postProcessError);
  }

  const c = document.getElementById('content');
  delete c.dataset.orgEnhanced;
  delete c.dataset.orgEnhancedUrl;
  c.innerHTML = doc.body?.innerHTML ?? '';
  dbgLegacy('renderLegacy:content injected', { childCount: c.children.length });
  c.scrollTop = restoreScroll !== null ? restoreScroll : 0;

  c.querySelectorAll('.nav-btn-group').forEach(group => {
    const allBtns = group.querySelectorAll('a[data-nav-btn]');
    const topBtns = Array.from(allBtns).filter(a => /pink\.htm/i.test(a.getAttribute('href') || ''));
    if (topBtns.length > 0) {
      if (allBtns.length === topBtns.length) group.remove();
      else topBtns.forEach(a => a.remove());
    }
  });

  c.querySelectorAll('.nav-btn-group').forEach(group => {
    let node = group.nextSibling;
    while (node) {
      const next = node.nextSibling;
      const text = (node.textContent || '').replace(/[\s ]/g, '');
      const isEmpty = node.nodeType === 3
        ? !text
        : node.nodeType === 1 && !text && !node.querySelector('a,img,input,button,select');
      if (isEmpty) { node.remove(); node = next; }
      else break;
    }
  });

  enhanceOrganizationLegacyPage(c, url, sourceTitle || LEGACY_NAV_LABELS[url.split('/').pop().split('?')[0].toLowerCase()]);
}

async function renderLegacyView(params) {
  const url = params?.url || '';
  const title = params?.title || LEGACY_NAV_LABELS[url.split('/').pop().split('?')[0]] || url.split('/').pop().split('?')[0] || 'ページ';
  dbgLegacy('renderLegacyView:start', { url, title });
  if (!url) return;

  const c = document.getElementById('content');
  if (!c) return;

  const prevLegacy = [...navStack].reverse().slice(1).find(v => v.type === 'legacy');
  legacyNavFromFname = prevLegacy?.params?.url
    ? prevLegacy.params.url.split('/').pop().split('?')[0].toLowerCase()
    : null;
  legacyCurrentUrl = url;
  currentPageUrl = url;
  updateExtButton();
  c.innerHTML = `<div class="loading"><div>${escHtml(title)} 読み込み中…</div></div>`;
  hideFilterDashboardSafe('renderLegacyView');
  updateBackButton();

  try {
    const html = await fetchLegacy(url);
    renderLegacy(html, url, null, title);
    dbgLegacy('renderLegacyView:done', { url });
  } catch (err) {
    dbgLegacyError('renderLegacyView:error', { url, name: err?.name, message: err?.message, stack: err?.stack });
    c.innerHTML = `<div class="error">取得失敗: ${escHtml(err.message)}</div>
      <a class="ext-link" href="${escHtml(url)}" target="_blank" rel="noopener">元ページを直接開く ↗</a>`;
    showLegacyDebugMessage(`renderLegacyView error
url: ${url}
${err?.name || 'Error'}: ${err?.message || err}`);
  }
}

function openLegacyPage(url, title = '') {
  pushView('legacy', { url, title: title || LEGACY_NAV_LABELS[url.split('/').pop().split('?')[0]] || url.split('/').pop().split('?')[0] });
}

async function loadLegacyPage(url, push = true) {
  // 互換用。通常は openLegacyPage() / renderLegacyView() 経由で扱う。
  if (push) return openLegacyPage(url);
  return renderLegacyView({ url, title: LEGACY_NAV_LABELS[url.split('/').pop().split('?')[0]] || url.split('/').pop().split('?')[0] });
}
function updateLegacyBackBtn() {
  const btn = document.getElementById('b-back');
  if (!btn) return;
  btn.style.opacity = '1';
}
