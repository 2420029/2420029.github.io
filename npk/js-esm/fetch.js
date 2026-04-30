import {
  isNoise,
  normalizeLocation,
  extractLocation,
  extractShopName,
  classify,
  btypeFromUrl,
  btypeFromTitleText,
} from './data.js';
import { renderCurrent } from './router.js';

// ═══════════════════════════════════════════════════════════════════════
// 4. CORS プロキシ
// ═══════════════════════════════════════════════════════════════════════
const PROXIES = [
  u => `https://npk-proxy.npk-proxy.workers.dev/?url=${encodeURIComponent(u)}`,
  u => `https://api.allorigins.win/raw?disableCache=true&url=${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  u => `https://api.cors.lol/?url=${encodeURIComponent(u)}`,
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

async function fetchWithProxy(url) {
  for (const mkProxy of PROXIES) {
    try {
      const res = await fetch(mkProxy(url), { signal: AbortSignal.timeout(28000) });
      if (!res.ok) continue;
      const buf  = await res.arrayBuffer();
      const text = new TextDecoder('shift-jis').decode(buf);
      if (text && text.length > 50) return text;
    } catch { }
  }
  throw new Error(`取得失敗: ${url}`);
}

function yearLabelFromImg(img) {
  if (!img) return '';
  const fname = (img.getAttribute('src') || '').split('/').pop();
  let m = fname.match(/^R0*(\d+)\.png$/i);
  if (m) return `令和${m[1]}年`;
  m = fname.match(/^h(\d+)\.png$/i);
  if (m) return `平成${m[1]}年`;
  m = fname.match(/^s(\d+)\.png$/i);
  if (m) return `昭和${m[1]}年`;
  return '';
}

function yearKey(label) {
  let m = label.match(/令和(\d+)/);  if (m) return 3000 + parseInt(m[1]);
  m = label.match(/平成(\d+)/);       if (m) return 2000 + parseInt(m[1]);
  m = label.match(/昭和(\d+)/);       if (m) return 1000 + parseInt(m[1]);
  return 0;
}

// ═══════════════════════════════════════════════════════════════════════
// 5. データロード（localStorage cache 1日）
// ═══════════════════════════════════════════════════════════════════════
const CACHE_KEY = 'pinsalo_v2_data_v1';
const CACHE_TTL = 86400000;

let ALL_REPORTS = [];

function normalizeReportBtypesFromUrl(reports) {
  if (!Array.isArray(reports)) return false;
  let changed = false;
  reports.forEach(r => {
    const detected = btypeFromUrl(r.href);
    if (!detected || detected === '不明') return;
    if (r.btype === '不明' || (r.btype === 'その他' && detected !== 'その他')) {
      r.btype = detected;
      changed = true;
    }
  });
  return changed;
}

function normalizeReportLocationsFromMap(reports) {
  if (!Array.isArray(reports)) return false;
  let changed = false;
  reports.forEach(r => {
    if (!r?.loc) return;
    const cls = classify(r.loc);
    if (cls.isOverseas) {
      if (!r.isOverseas || r.country !== cls.country || r.pref !== undefined || r.subregion !== undefined) {
        r.isOverseas = true;
        r.country = cls.country;
        delete r.pref;
        delete r.subregion;
        changed = true;
      }
      return;
    }

    if (r.isOverseas || r.pref !== cls.pref || r.subregion !== cls.subregion || r.country !== undefined) {
      r.isOverseas = false;
      r.pref = cls.pref;
      r.subregion = cls.subregion;
      delete r.country;
      changed = true;
    }
  });
  return changed;
}

async function loadData(forceRefresh = false) {
  if (!forceRefresh) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Date.now() - cached.ts < CACHE_TTL && Array.isArray(cached.reports)) {
          ALL_REPORTS = cached.reports;
          const changedLocation = normalizeReportLocationsFromMap(ALL_REPORTS);
          const changedBtype = normalizeReportBtypesFromUrl(ALL_REPORTS);
          if (changedLocation || changedBtype) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ...cached, reports: ALL_REPORTS }));
          }
          return;
        }
      }
    } catch {}
  }

  setProgress(0, 'historyall.htm 取得中…');
  const masterHtml = await fetchWithProxy('https://pinsalo.info/sp/historyall.htm');
  const masterDoc  = new DOMParser().parseFromString(masterHtml, 'text/html');

  const yearPages = Array.from(masterDoc.querySelectorAll('a[href]'))
    .filter(a => {
      const h = a.getAttribute('href') || '';
      return /history[a-z0-9]+\.htm/i.test(h) && !/historyall\.htm/i.test(h);
    })
    .map(a => {
      const img       = a.querySelector('img');
      const yearLabel = yearLabelFromImg(img);
      const href      = a.getAttribute('href');
      return {
        url:   new URL(href, 'https://pinsalo.info/sp/').href,
        label: yearLabel || a.textContent.trim() || href.split('/').pop().replace('.htm','').toUpperCase(),
      };
    });

  if (yearPages.length === 0) throw new Error('年次ページが見つかりませんでした');

  const BATCH = 4;
  const htmlResults = new Array(yearPages.length).fill(null);
  for (let i = 0; i < yearPages.length; i += BATCH) {
    const batch   = yearPages.slice(i, i + BATCH);
    const settled = await Promise.allSettled(batch.map(p => fetchWithProxy(p.url)));
    settled.forEach((r, j) => {
      if (r.status === 'fulfilled') htmlResults[i + j] = r.value;
    });
    const done = Math.min(i + BATCH, yearPages.length);
    setProgress(done / yearPages.length, `${done} / ${yearPages.length} ページ取得`);
  }

  const reports = [];
  const seenUrls = new Set();

  htmlResults.forEach((html, i) => {
    if (!html) return;
    const yUrl   = yearPages[i].url;
    const yLabel = yearPages[i].label;
    const tpl    = document.createElement('template');
    tpl.innerHTML = html;

    tpl.content.querySelectorAll('a[href]').forEach(a => {
      const raw = a.getAttribute('href') || '';
      if (!raw || /^#|^javascript/i.test(raw)) return;
      let absUrl;
      try { absUrl = new URL(raw, yUrl).href; } catch { return; }
      if (/history[a-z0-9]*\.htm/i.test(absUrl)) return;
      if (!/\.html?($|\?)/i.test(absUrl)) return;

      const text = a.textContent.trim();
      if (text.length < 4) return;
      if (seenUrls.has(absUrl)) return;
      seenUrls.add(absUrl);

      let loc = extractLocation(text);
      if (!loc || loc.length < 1) return;
      loc = normalizeLocation(loc);
      if (!loc || loc.length < 1) return;
      if (isNoise(loc)) return;

      const cls = classify(loc);
      reports.push({
        href: absUrl,
        text,
        year: yLabel,
        loc,
        shop: extractShopName(text),
        btype: btypeFromUrl(absUrl),
        ...cls,
      });
    });
  });

  ALL_REPORTS = reports;
  normalizeReportLocationsFromMap(ALL_REPORTS);

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), reports }));
  } catch (e) {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), reports }));
    } catch (retryError) {
      console.info('データ量が大きいためキャッシュ保存をスキップしました。次回起動時は再取得します。', retryError);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 5-B. 古いアーカイブ向け 業種補完キャッシュ
// ═══════════════════════════════════════════════════════════════════════
const BTYPE_ENRICH_KEY = 'pinsalo_v2_btype_v1';

function loadBtypeCache() {
  try {
    const raw = localStorage.getItem(BTYPE_ENRICH_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveBtypeCache(cache) {
  try { localStorage.setItem(BTYPE_ENRICH_KEY, JSON.stringify(cache || {})); } catch {}
}

function applyBtypeCache(cache = loadBtypeCache()) {
  let changed = false;
  ALL_REPORTS.forEach(r => {
    // 'その他' も対象: URLコード推測よりTITLE由来キャッシュを優先する
    if ((r.btype === '不明' || r.btype === 'その他') &&
        Object.prototype.hasOwnProperty.call(cache, r.href)) {
      const cached = cache[r.href];
      if (cached && cached !== '不明' && cached !== 'その他' && r.btype !== cached) {
        r.btype = cached;
        changed = true;
      }
    }
  });
  return changed;
}

function persistBtypeToMainCache(cache) {
  try {
    const main = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    if (!main || !Array.isArray(main.reports)) return;
    let changed = false;
    main.reports.forEach(r => {
      if (Object.prototype.hasOwnProperty.call(cache, r.href) && r.btype !== cache[r.href]) {
        r.btype = cache[r.href];
        changed = true;
      }
    });
    if (changed) localStorage.setItem(CACHE_KEY, JSON.stringify(main));
  } catch {}
}

async function enrichUnknownBtypes() {
  const cache = loadBtypeCache();
  const applied = applyBtypeCache(cache);

  // 未処理の「不明」のみ対象。キャッシュ済みの「不明」は再フェッチしない。
  const targets = ALL_REPORTS.filter(r =>
    r.btype === '不明' && !Object.prototype.hasOwnProperty.call(cache, r.href)
  );

  if (targets.length === 0) {
    if (applied) renderCurrent();
    return;
  }

  let idx = 0;
  let detectedChanged = false;

  async function worker() {
    while (idx < targets.length) {
      const r = targets[idx++];
      try {
        const html = await fetchWithProxy(r.href);
        const detected = btypeFromTitleText(html);
        const nextBtype = detected ?? '不明';

        r.btype = nextBtype;
        cache[r.href] = nextBtype; // キーワード不一致の「不明」はキャッシュして再フェッチを防ぐ
        if (detected) detectedChanged = true;
      } catch (e) {
        // 通信失敗・プロキシ失敗は一時的な可能性があるため「不明」として永続キャッシュしない。
        console.warn('業種補完取得失敗:', r.href, e);
      }
    }
  }

  await Promise.all([worker(), worker(), worker()]);
  saveBtypeCache(cache);

  if (detectedChanged) {
    persistBtypeToMainCache(cache);
    renderCurrent();
  }
}


function setProgress(ratio, text) {
  const bar = document.getElementById('prog-bar');
  const txt = document.getElementById('prog-text');
  if (bar) bar.style.width = `${Math.round(ratio * 100)}%`;
  if (txt) txt.textContent = text;
}

export {
  fetchWithProxy,
  yearKey,
  ALL_REPORTS,
  loadData,
  applyBtypeCache,
  enrichUnknownBtypes,
  setProgress,
};
