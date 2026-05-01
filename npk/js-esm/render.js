import {
  REGIONS,
  OVERSEAS_COUNTRY,
  TOKYO_SUBAREA,
  TOKYO_SUBAREA_ORDER,
  BTYPE_LIST,
  PAPER_CATEGORIES,
} from './data.js';
import { ALL_REPORTS, fetchWithProxy, yearKey } from './fetch.js';
import { openLegacyPage, parseKaimuYearLinks, dbgLegacy } from './legacy.js';
import {
  navStack,
  pushView,
  setCurrentPageUrl,
  TOP_SECTION_ICONS,
  setTopSectionHeader,
  collectExpandKeys,
  collectLocExpandKeys,
  collectSubareaExpandKeys,
} from './router.js';
import { escHtml } from './utils.js';

// ═══════════════════════════════════════════════════════════════════════
// 10. トップページ描画
// ═══════════════════════════════════════════════════════════════════════
const _homeAccordionOpen = new Set();
let _kaimuYearCache = null;
let _kaimuYearLoadingPromise = null;
let _cancelChunkedRender = null;

function cancelActiveChunkedRender() {
  if (typeof _cancelChunkedRender === 'function') {
    _cancelChunkedRender();
    _cancelChunkedRender = null;
  }
}

const KAIMU_YEAR_GROUPS = [
  { key: 'reiwa', label: '令和（R02-R08）', match: x => x.era === 'R' && x.year >= 2 && x.year <= 8 },
  { key: 'heiseiLate', label: '平成後期（H21-H31）', match: x => x.era === 'H' && x.year >= 21 && x.year <= 31 },
  { key: 'heiseiEarly', label: '平成前期（H12-H20）', match: x => x.era === 'H' && x.year >= 12 && x.year <= 20 },
];

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysBetweenLocalDates(a, b) {
  if (!a || !b) return NaN;
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  if (![ay, am, ad, by, bm, bd].every(Number.isFinite)) return NaN;
  const start = new Date(ay, am - 1, ad);
  const end = new Date(by, bm - 1, bd);
  return Math.round((end - start) / 86400000);
}

function recentDateLabel(dateStr) {
  const [, month, day] = String(dateStr || '').split('-');
  if (!month || !day) return '';
  return `${Number(month)}/${Number(day)}`;
}

function recentReportsWithinDays(days = 7) {
  const today = localDateString();
  return ALL_REPORTS
    .filter(r => {
      const diff = daysBetweenLocalDates(r.postedDate, today);
      return Number.isFinite(diff) && diff >= 0 && diff < days;
    })
    .sort((a, b) => {
      const dateOrder = String(b.postedDate || '').localeCompare(String(a.postedDate || ''));
      if (dateOrder) return dateOrder;
      return yearKey(b.year) - yearKey(a.year);
    });
}

function createRecentReportItem({ text, href, year = '', postedDate = '', isToday = false }) {
  const item = document.createElement('div');
  item.className = 'nav-btn-item recent-report-item';
  const badge = isToday ? '本日' : recentDateLabel(postedDate);
  item.innerHTML = `
    ${badge ? `<span class="recent-report-badge${isToday ? ' today' : ''}">${escHtml(badge)}</span>` : ''}
    <span class="recent-report-text">${escHtml(text)}</span>`;
  item.onclick = () => pushView('report', { href, title: text, year });
  return item;
}

function renderHome() {
  setCurrentPageUrl('');
  const prefCnt = {};
  ALL_REPORTS.forEach(r => {
    if (!r.isOverseas) prefCnt[r.pref] = (prefCnt[r.pref] || 0) + 1;
  });

  const c = document.getElementById('content');
  c.innerHTML = '';

  // ─ バナー ─
  const banner = document.createElement('div');
  banner.className = 'home-banner';
  banner.innerHTML = '<img src="./ad.png" alt="" class="home-banner-img">';
  c.appendChild(banner);

  // ─ 新着レポート ─
  const todaySection = document.createElement('div');
  todaySection.className = 'nav-section-wrap';
  const todayHdr = document.createElement('div');
  todayHdr.className = 'nav-category-header';
  setTopSectionHeader(todayHdr, TOP_SECTION_ICONS.today, '新着レポート（読み込み中…）');
  todaySection.appendChild(todayHdr);
  c.appendChild(todaySection);
  fetchTodayReports(todaySection); // 非同期

  // ─ レポート（8地域アコーディオン） ─
  const reportSection = document.createElement('div');
  reportSection.className = 'nav-section-wrap';
  const reportHdr = document.createElement('div');
  reportHdr.className = 'nav-category-header';
  setTopSectionHeader(reportHdr, TOP_SECTION_ICONS.region, 'レポート（地域別）');
  reportSection.appendChild(reportHdr);

  REGIONS.forEach(region => {
    const total = region.prefs.reduce((s, p) => s + (prefCnt[p] || 0), 0);
    if (total > 0) reportSection.appendChild(buildRegionAccordionEl(region, prefCnt));
  });

  // 海外アコーディオン
  const overseasCnt = ALL_REPORTS.filter(r => r.isOverseas).length;
  if (overseasCnt > 0) reportSection.appendChild(buildOverseasAccordionEl());
  c.appendChild(reportSection);

  // ─ レポート（期間別） ─
  const periodSection = document.createElement('div');
  periodSection.className = 'nav-section-wrap';
  const periodHdr = document.createElement('div');
  periodHdr.className = 'nav-category-header';
  setTopSectionHeader(periodHdr, TOP_SECTION_ICONS.period, 'レポート（期間別）');
  periodSection.appendChild(periodHdr);
  buildPeriodSection(periodSection);
  c.appendChild(periodSection);

  // ─ 研究・報告 ─
  const researchSection = document.createElement('div');
  researchSection.className = 'nav-section-wrap';
  const researchHdr = document.createElement('div');
  researchHdr.className = 'nav-category-header';
  setTopSectionHeader(researchHdr, TOP_SECTION_ICONS.research, '研究・報告');
  researchSection.appendChild(researchHdr);
  researchSection.appendChild(buildPapersAccordionEl());
  researchSection.appendChild(buildKaimuAccordionEl());
  c.appendChild(researchSection);

  // ─ 組織・人事 ─
  appendNavSection(c, '組織・人事', [
    { label: '会員一覧', url: 'https://pinsalo.info/sp/organ.htm' },
    { label: 'ランキング', url: 'https://pinsalo.info/sp/ranking.php' },
    { label: '人事異動', url: 'https://pinsalo.info/sp/new_mmb.htm' },
    { label: '会員募集', url: 'https://pinsalo.info/sp/bosyu.htm' },
  ], TOP_SECTION_ICONS.organization);
}

// ─ 新着レポート取得（非同期）─
async function fetchTodayReports(container) {
  try {
    const html = await fetchWithProxy('https://pinsalo.info/sp/today.htm');
    const doc  = new DOMParser().parseFromString(html, 'text/html');
    const todayReports = Array.from(doc.querySelectorAll('a[href]'))
      .map(a => {
        const text = a.textContent.trim();
        if (!text) return null;
        const raw = a.getAttribute('href') || '';
        if (!/\.html?/i.test(raw)) return null;
        try {
          return { text, href: new URL(raw, 'https://pinsalo.info/sp/').href };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const todayHrefSet = new Set(todayReports.map(r => {
      try { return new URL(r.href).href; } catch { return r.href; }
    }));
    const otherReports = recentReportsWithinDays(7).filter(r => {
      try { return !todayHrefSet.has(new URL(r.href).href); } catch { return !todayHrefSet.has(r.href); }
    });

    const hdr = container.querySelector('.nav-category-header');
    if (hdr) setTopSectionHeader(hdr, TOP_SECTION_ICONS.today, `新着レポート（本日 ${todayReports.length}件）`);
    todayReports.forEach(report => {
      container.appendChild(createRecentReportItem({ ...report, isToday: true }));
    });
    container.appendChild(buildOtherRecentReportsAccordionEl(otherReports));
  } catch (e) {
    console.warn('新着レポート取得失敗:', e);
    const hdr = container.querySelector('.nav-category-header');
    if (hdr) setTopSectionHeader(hdr, TOP_SECTION_ICONS.today, '新着レポート（取得失敗）');
  }
}

function buildOtherRecentReportsAccordionEl(reports) {
  const key = 'recent:other';
  const wrap = document.createElement('div');
  wrap.className = 'region-accordion recent-other-accordion';

  const toggle = document.createElement('div');
  toggle.className = 'region-accordion-toggle';
  toggle.innerHTML = `その他の新着レポート<span class="region-cnt">${reports.length.toLocaleString()}件</span>`;

  const body = document.createElement('div');
  body.className = 'region-accordion-body';

  if (reports.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'accordion-loading';
    empty.textContent = '過去7日以内の追加レポートはありません';
    body.appendChild(empty);
  } else {
    reports.forEach(r => body.appendChild(createRecentReportItem(r)));
  }

  toggle.onclick = () => setHomeAccordionState(key, !isHomeAccordionOpen(key), toggle, body);
  setHomeAccordionState(key, isHomeAccordionOpen(key), toggle, body);

  wrap.appendChild(toggle);
  wrap.appendChild(body);
  return wrap;
}

// ─ 地域アコーディオン要素生成 ─
function buildRegionAccordionEl(region, prefCnt) {
  const key = `region:${region.name}`;
  const total = region.prefs.reduce((s, p) => s + (prefCnt[p] || 0), 0);
  const wrap = document.createElement('div');
  wrap.className = 'region-accordion';

  const toggle = document.createElement('div');
  toggle.className = 'region-accordion-toggle';
  toggle.innerHTML = `${escHtml(region.name)}<span class="region-cnt">${total.toLocaleString()}件</span>`;

  const body = document.createElement('div');
  body.className = 'region-accordion-body';

  region.prefs.forEach(p => {
    const c = prefCnt[p] || 0;
    if (c === 0) return;
    const item = document.createElement('div');
    item.className = 'region-pref-item';
    item.innerHTML = `<span>${escHtml(p)}</span><span class="pref-cnt">${c.toLocaleString()}件</span>`;
    item.onclick = () => pushView('pref', { pref: p });
    body.appendChild(item);
  });

  toggle.onclick = () => setHomeAccordionState(key, !isHomeAccordionOpen(key), toggle, body);
  setHomeAccordionState(key, isHomeAccordionOpen(key), toggle, body);

  wrap.appendChild(toggle);
  wrap.appendChild(body);
  return wrap;
}

// ─ 海外アコーディオン要素生成 ─
function buildOverseasAccordionEl() {
  const key = 'region:overseas';
  const countryCnt = {};
  ALL_REPORTS.filter(r => r.isOverseas).forEach(r => {
    countryCnt[r.country] = (countryCnt[r.country] || 0) + 1;
  });
  const overseasCnt = Object.values(countryCnt).reduce((s, v) => s + v, 0);

  const wrap = document.createElement('div');
  wrap.className = 'region-accordion';

  const toggle = document.createElement('div');
  toggle.className = 'region-accordion-toggle';
  toggle.innerHTML = `海外<span class="region-cnt">${overseasCnt.toLocaleString()}件</span>`;

  const body = document.createElement('div');
  body.className = 'region-accordion-body';

  Object.entries(countryCnt).sort((a, b) => b[1] - a[1]).forEach(([country, c]) => {
    const item = document.createElement('div');
    item.className = 'region-pref-item';
    item.innerHTML = `<span>${escHtml(country)}</span><span class="pref-cnt">${c.toLocaleString()}件</span>`;
    item.onclick = () => pushView('country', { country });
    body.appendChild(item);
  });

  toggle.onclick = () => setHomeAccordionState(key, !isHomeAccordionOpen(key), toggle, body);
  setHomeAccordionState(key, isHomeAccordionOpen(key), toggle, body);

  wrap.appendChild(toggle);
  wrap.appendChild(body);
  return wrap;
}

function getHomeAccordionKeys() {
  const view = navStack[navStack.length - 1];
  if (!view || view.type !== 'home') return _homeAccordionOpen;
  if (!(view.homeAccordionKeys instanceof Set)) view.homeAccordionKeys = new Set();
  return view.homeAccordionKeys;
}

function isHomeAccordionOpen(key) {
  return getHomeAccordionKeys().has(key);
}

function setHomeAccordionState(key, open, toggle, body) {
  toggle.classList.toggle('open', open);
  body.classList.toggle('open', open);
  const keys = getHomeAccordionKeys();
  if (open) {
    keys.add(key);
    _homeAccordionOpen.add(key);
  } else {
    keys.delete(key);
    _homeAccordionOpen.delete(key);
  }
}

function buildPapersAccordionEl() {
  const key = 'papers';
  const wrap = document.createElement('div');
  wrap.className = 'region-accordion';

  const toggle = document.createElement('div');
  toggle.className = 'region-accordion-toggle';
  toggle.textContent = '研究論文';

  const body = document.createElement('div');
  body.className = 'region-accordion-body';

  PAPER_CATEGORIES.forEach(({ label, url }) => {
    const item = document.createElement('div');
    item.className = 'region-pref-item';
    item.innerHTML = `<span>${escHtml(label)}</span>`;
    item.onclick = () => openLegacyPage(url, label);
    body.appendChild(item);
  });

  toggle.onclick = () => setHomeAccordionState(key, !isHomeAccordionOpen(key), toggle, body);
  setHomeAccordionState(key, isHomeAccordionOpen(key), toggle, body);

  wrap.appendChild(toggle);
  wrap.appendChild(body);
  return wrap;
}

function buildKaimuAccordionEl() {
  const key = 'kaimu';
  const wrap = document.createElement('div');
  wrap.className = 'region-accordion';

  const toggle = document.createElement('div');
  toggle.className = 'region-accordion-toggle';
  toggle.textContent = '会務報告';

  const body = document.createElement('div');
  body.className = 'region-accordion-body';

  KAIMU_YEAR_GROUPS.forEach(group => {
    const item = document.createElement('div');
    item.className = 'region-pref-item';
    item.innerHTML = `<span>${escHtml(group.label)}</span>`;
    item.onclick = () => pushView('kaimuYears', { groupKey: group.key, title: group.label });
    body.appendChild(item);
  });

  toggle.onclick = () => {
    const nextOpen = !isHomeAccordionOpen(key);
    setHomeAccordionState(key, nextOpen, toggle, body);
  };

  const initiallyOpen = isHomeAccordionOpen(key);
  setHomeAccordionState(key, initiallyOpen, toggle, body);

  wrap.appendChild(toggle);
  wrap.appendChild(body);
  return wrap;
}

function loadKaimuYearLinks() {
  if (_kaimuYearCache) return Promise.resolve(_kaimuYearCache);
  if (!_kaimuYearLoadingPromise) {
    _kaimuYearLoadingPromise = fetchWithProxy('https://pinsalo.info/sp/kaimuall.htm')
      .then(html => {
        _kaimuYearCache = parseKaimuYearLinks(html);
        return _kaimuYearCache;
      })
      .finally(() => {
        _kaimuYearLoadingPromise = null;
      });
  }
  return _kaimuYearLoadingPromise;
}

function getKaimuYearGroup(groupKey, items) {
  const group = KAIMU_YEAR_GROUPS.find(g => g.key === groupKey) || KAIMU_YEAR_GROUPS[0];
  return {
    ...group,
    items: items.filter(group.match).slice().sort((a, b) => b.year - a.year),
  };
}

function renderKaimuYearGroupView(params) {
  setCurrentPageUrl('https://pinsalo.info/sp/kaimuall.htm');
  const groupDef = KAIMU_YEAR_GROUPS.find(g => g.key === params?.groupKey) || KAIMU_YEAR_GROUPS[0];
  const c = document.getElementById('content');
  document.getElementById('page-title').textContent = groupDef.label;
  c.innerHTML = `<div class="loading"><div>${escHtml(groupDef.label)} 読み込み中…</div></div>`;

  loadKaimuYearLinks()
    .then(items => {
      const group = getKaimuYearGroup(groupDef.key, items);
      const section = document.createElement('div');
      section.className = 'nav-section-wrap';
      const hdr = document.createElement('div');
      hdr.className = 'nav-category-header';
      setTopSectionHeader(hdr, TOP_SECTION_ICONS.research, group.label);
      section.appendChild(hdr);

      group.items.forEach(({ href, label }) => {
        const item = document.createElement('div');
        item.className = 'nav-btn-item';
        item.textContent = label;
        item.onclick = () => openLegacyPage(href, label);
        section.appendChild(item);
      });

      if (group.items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'accordion-loading';
        empty.textContent = '年代リストが見つかりませんでした';
        section.appendChild(empty);
      }

      c.innerHTML = '';
      c.appendChild(section);
    })
    .catch(e => {
      console.warn('会務報告 年代リスト取得失敗:', e);
      c.innerHTML = `<div class="error">取得失敗: ${escHtml(e.message)}</div>`;
    });
}

function renderPaperList(papers, container) {
  if (!container) return;

  const card = document.createElement('div');
  card.className = 'org-legacy-card paper-card-list-card';
  const list = document.createElement('div');
  list.className = 'paper-card-list';

  papers.forEach(({ href, title, author }) => {
    const a = document.createElement('a');
    a.href = href;
    a.className = 'paper-card paper-list-item';
    a.innerHTML = `<span class="paper-title">${escHtml(title)}</span>`;
    if (author) {
      const authorEl = document.createElement('span');
      authorEl.className = 'paper-author';
      authorEl.textContent = author;
      a.appendChild(authorEl);
    }
    list.appendChild(a);
  });

  card.appendChild(list);
  container.appendChild(card);
}

function renderLegacyEmptyCard(container, message = 'データが見つかりませんでした') {
  if (!container) return;
  const card = document.createElement('div');
  card.className = 'org-legacy-card';
  const empty = document.createElement('div');
  empty.className = 'legacy-empty-message';
  empty.textContent = message;
  card.appendChild(empty);
  container.appendChild(card);
}

// ─ ナビセクション（研究・情報 / 組織・参加）追加 ─
function appendNavSection(container, label, items, iconName = '') {
  const section = document.createElement('div');
  section.className = 'nav-section-wrap';
  const hdr = document.createElement('div');
  hdr.className = 'nav-category-header';
  if (iconName) setTopSectionHeader(hdr, iconName, label);
  else hdr.textContent = label;
  section.appendChild(hdr);
  items.forEach(({ label: itemLabel, url }) => {
    const item = document.createElement('div');
    item.className = 'nav-btn-item';
    item.textContent = itemLabel;
    item.onclick = () => {
      dbgLegacy('appendNavSection:click', { section: label, item: itemLabel, url });
      openLegacyPage(url, itemLabel);
    };
    section.appendChild(item);
  });
  container.appendChild(section);
}

// ═══════════════════════════════════════════════════════════════════════
// 11. 都道府県 / 国 / 年 フィルタービュー
// ═══════════════════════════════════════════════════════════════════════
let currentFilter = { region: '', prefs: new Set(), country: '', btypes: new Set(), q: '' }; // btypesが空なら全業種表示

function createDefaultFilter() {
  return { region: '', prefs: new Set(), country: '', btypes: new Set(), q: '' };
}

function cloneFilter(filter) {
  return {
    region: filter?.region || '',
    prefs: new Set(filter?.prefs || []),
    country: filter?.country || '',
    btypes: new Set(filter?.btypes || []),
    q: filter?.q || '',
  };
}

function persistCurrentFilter() {
  const view = navStack[navStack.length - 1];
  if (view) view.filter = cloneFilter(currentFilter);
}


function getRegionNameByPref(pref) {
  const region = REGIONS.find(r => r.prefs.includes(pref));
  return region ? region.name : '';
}

function sameReportHref(a, b) {
  if (!a || !b) return false;
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return a === b;
  }
}

function findReportByHref(href) {
  return ALL_REPORTS.find(r => sameReportHref(r.href, href)) || null;
}

function extractShopNameFromTitle(text) {
  const m = String(text || '').match(/「([^」]+)」/);
  return m ? m[1].trim() : '';
}

function createHistoryPresetFilter(params = {}) {
  const shop = (params.presetQ || '').trim();
  if (!shop) return null;

  const filter = createDefaultFilter();
  filter.q = shop;

  if (params.presetIsOverseas) {
    if (params.presetCountry) {
      filter.region = '海外';
      filter.country = params.presetCountry;
    }
    return filter;
  }

  if (params.presetPref) {
    const region = getRegionNameByPref(params.presetPref);
    if (region) {
      filter.region = region;
      filter.prefs = new Set([params.presetPref]);
    }
  }
  return filter;
}

function getReportHistoryLinkInfo(params = {}, doc = null) {
  const report = findReportByHref(params.href);
  const sourceTitle = params.title || report?.text || doc?.title || '';
  const shop = report?.shop || extractShopNameFromTitle(sourceTitle);
  if (!shop) return null;

  return {
    shop,
    loc: report?.loc || '',
    pref: report?.pref || '',
    country: report?.country || '',
    isOverseas: !!report?.isOverseas,
    title: sourceTitle || shop,
  };
}

function buildReportHistoryCardHtml(info) {
  if (!info?.shop) return '';
  return `
    <div class="report-history-card">
      <button type="button" class="report-shop-history-link" id="report-shop-history-link">
        <span class="report-shop-history-icon"><i data-lucide="calendar-days"></i></span>
        <span class="report-shop-history-label">
          <span class="report-shop-history-name">「${escHtml(info.shop)}」</span>
          <span class="report-shop-history-text">の全期間レポート</span>
        </span>
      </button>
    </div>`;
}

function prefBelongsToRegion(pref, regionName) {
  if (!pref || !regionName) return false;
  const region = REGIONS.find(r => r.name === regionName);
  return !!region && region.prefs.includes(pref);
}

function syncRegionDetailSelection() {
  // 広域エリアと都道府県/国は親子関係として扱う。
  // 親と矛盾する子条件が残っていた場合は、AND条件で破綻しないように破棄する。
  if (!currentFilter.region) {
    currentFilter.prefs = new Set();
    currentFilter.country = '';
    return;
  }
  if (currentFilter.region === '海外') {
    currentFilter.prefs = new Set();
    return;
  }
  currentFilter.country = '';
  currentFilter.prefs = new Set([...currentFilter.prefs].filter(pref => prefBelongsToRegion(pref, currentFilter.region)));
}

function countReportsByRegion(reports) {
  const counts = new Map();
  REGIONS.forEach(region => counts.set(region.name, 0));
  counts.set('海外', 0);
  reports.forEach(r => {
    if (r.isOverseas) counts.set('海外', (counts.get('海外') || 0) + 1);
    else {
      const regionName = getRegionNameByPref(r.pref);
      if (regionName) counts.set(regionName, (counts.get(regionName) || 0) + 1);
    }
  });
  return counts;
}

function countReportsByPrefInRegion(reports, regionName) {
  const counts = new Map();
  const region = REGIONS.find(r => r.name === regionName);
  if (!region) return counts;
  region.prefs.forEach(pref => counts.set(pref, 0));
  reports.forEach(r => {
    if (!r.isOverseas && counts.has(r.pref)) counts.set(r.pref, (counts.get(r.pref) || 0) + 1);
  });
  return counts;
}

function countReportsByCountry(reports) {
  const counts = new Map();
  reports.forEach(r => {
    if (r.isOverseas && r.country) counts.set(r.country, (counts.get(r.country) || 0) + 1);
  });
  return counts;
}

function applyRegionFilterOnly(reports) {
  syncRegionDetailSelection();

  return reports.filter(r => {
    // 地域ブロック未選択時は、地域条件なし。
    if (!currentFilter.region) return true;

    // 海外は「海外 AND 国」で絞り込む。
    if (currentFilter.region === '海外') {
      if (!r.isOverseas) return false;
      if (currentFilter.country && r.country !== currentFilter.country) return false;
      return true;
    }

    // 国内は「広域エリア AND 都道府県」で絞り込む。
    if (r.isOverseas) return false;
    const reportRegion = getRegionNameByPref(r.pref);
    if (reportRegion !== currentFilter.region) return false;
    if (currentFilter.prefs.size > 0) {
      if (!currentFilter.prefs.has(r.pref)) return false;
    }
    return true;
  });
}


function renderBtypeFilterChips(reports, shopAreaOptions = {}) {
  const btypeBox = document.getElementById('filter-btypes');
  if (!btypeBox) return;

  const regionFiltered = applyRegionFilterOnly(reports);
  const btypeCnt = {};
  regionFiltered.forEach(r => { const b = r.btype === '不明' ? 'その他' : r.btype; btypeCnt[b] = (btypeCnt[b] || 0) + 1; });

  // 地域条件変更で0件になっても、ユーザーが選択した業種は勝手に外さない。
  // 0件になった選択中チップは残して件数0を表示し、ユーザー操作で解除できるようにする。
  btypeBox.innerHTML = '';
  BTYPE_LIST.filter(b => btypeCnt[b] || currentFilter.btypes.has(b)).forEach(b => {
    const count = btypeCnt[b] || 0;
    const selected = currentFilter.btypes.has(b);
    const chip = document.createElement('span');
    chip.className = `btype-chip${selected ? ' active' : ''}${count === 0 ? ' disabled' : ''}`;
    chip.dataset.btype = b;
    chip.innerHTML = `${escHtml(b)} <span class="chip-cnt">${count.toLocaleString()}</span>`;
    chip.addEventListener('click', () => {
      if (currentFilter.btypes.has(b)) currentFilter.btypes.delete(b);
      else if (count > 0) currentFilter.btypes.add(b);
      persistCurrentFilter();
      renderBtypeFilterChips(reports, shopAreaOptions);
      renderShopArea(reports, shopAreaOptions);
    });
    btypeBox.appendChild(chip);
  });
}

function renderRegionFilterChips(reports, shopAreaOptions = {}) {
  const regionBox = document.getElementById('filter-regions');
  const detailRow = document.getElementById('filter-region-detail-row');
  const detailLabel = document.getElementById('filter-region-detail-label');
  const detailBox = document.getElementById('filter-region-detail');
  if (!regionBox || !detailRow || !detailLabel || !detailBox) return;

  const regionCounts = countReportsByRegion(reports);
  const regionNames = [...REGIONS.map(r => r.name), '海外'];
  regionBox.innerHTML = regionNames
    .filter(name => (regionCounts.get(name) || 0) > 0)
    .map(name => `<span class="btype-chip region-chip${currentFilter.region === name ? ' active' : ''}" data-region="${escHtml(name)}">${escHtml(name)} <span class="chip-cnt">${(regionCounts.get(name) || 0).toLocaleString()}</span></span>`)
    .join('');

  regionBox.querySelectorAll('.region-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const selected = chip.dataset.region || '';
      currentFilter.region = currentFilter.region === selected ? '' : selected;
      currentFilter.prefs = new Set();
      currentFilter.country = '';
      persistCurrentFilter();
      renderRegionFilterChips(reports, shopAreaOptions);
      renderBtypeFilterChips(reports, shopAreaOptions);
      renderShopArea(reports, shopAreaOptions);
    });
  });

  detailBox.innerHTML = '';
  if (!currentFilter.region) {
    detailRow.style.display = 'none';
    return;
  }

  if (currentFilter.region === '海外') {
    const countries = [...countReportsByCountry(reports).entries()].filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
    detailLabel.textContent = '国';
    detailBox.innerHTML = countries.map(([country, count]) =>
      `<span class="btype-chip country-chip${currentFilter.country === country ? ' active' : ''}" data-country="${escHtml(country)}">${escHtml(country)} <span class="chip-cnt">${count.toLocaleString()}</span></span>`
    ).join('');
    detailBox.querySelectorAll('.country-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const selected = chip.dataset.country || '';
        currentFilter.country = currentFilter.country === selected ? '' : selected;
        persistCurrentFilter();
        renderRegionFilterChips(reports, shopAreaOptions);
        renderBtypeFilterChips(reports, shopAreaOptions);
        renderShopArea(reports, shopAreaOptions);
      });
    });
  } else {
    const prefs = [...countReportsByPrefInRegion(reports, currentFilter.region).entries()].filter(([, count]) => count > 0);
    detailLabel.textContent = '都道府県';
    detailBox.innerHTML = prefs.map(([pref, count]) =>
      `<span class="btype-chip pref-chip${currentFilter.prefs.has(pref) ? ' active' : ''}" data-pref="${escHtml(pref)}">${escHtml(pref)} <span class="chip-cnt">${count.toLocaleString()}</span></span>`
    ).join('');
    detailBox.querySelectorAll('.pref-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const selected = chip.dataset.pref || '';
        if (currentFilter.prefs.has(selected)) currentFilter.prefs.delete(selected);
        else currentFilter.prefs.add(selected);
        persistCurrentFilter();
        renderRegionFilterChips(reports, shopAreaOptions);
        renderBtypeFilterChips(reports, shopAreaOptions);
        renderShopArea(reports, shopAreaOptions);
      });
    });
  }
  detailRow.style.display = detailBox.children.length ? 'flex' : 'none';
}

function renderFilteredView(title, reports, options = {}) {
  const hideRegionFilter = !!options.hideRegionFilter;
  const hideTitleCount = options.hideTitleCount !== false;
  const useChunkedInitialRender = !!options.chunked;
  const shopAreaOptions = {
    subareaMap: options.subareaMap || null,
    subareaOrder: options.subareaOrder || null,
  };
  const currentView = navStack[navStack.length - 1];
  currentFilter = cloneFilter(currentView?.filter || createDefaultFilter());
  if (hideRegionFilter) {
    // 都道府県ページなど、地域ブロックを表示しないビューでは非表示条件を残さない。
    currentFilter.region = '';
    currentFilter.prefs = new Set();
    currentFilter.country = '';
  }
  persistCurrentFilter();
  setCurrentPageUrl('');
  const c = document.getElementById('content');
  c.innerHTML = '';

  // ヘッダー
  const hd = document.createElement('div');
  hd.className = 'pref-view-wrap';
  hd.innerHTML = `
    <div class="pref-view-title">${escHtml(title)}
      ${hideTitleCount ? '' : `<span style="font-size:13px;color:var(--muted);font-weight:400">(${reports.length.toLocaleString()}件)</span>`}
    </div>
    <div class="filter-card" id="filter-card">
      <div class="filter-toggle" id="filter-toggle">
        <span><span class="filter-arrow">▶</span> フィルター <span id="filter-cnt-label" style="color:var(--muted);font-size:12px;font-weight:400"></span></span>
      </div>
      <div class="filter-body">
        ${hideRegionFilter ? '' : `
        <div class="filter-row">
          <span class="filter-label">地域</span>
          <div id="filter-regions" style="display:flex;flex-wrap:wrap;gap:6px;flex:1"></div>
        </div>
        <div class="filter-row" id="filter-region-detail-row" style="display:none">
          <span class="filter-label" id="filter-region-detail-label">都道府県</span>
          <div id="filter-region-detail" style="display:flex;flex-wrap:wrap;gap:6px;flex:1"></div>
        </div>`}
        <div class="filter-row">
          <span class="filter-label">業種</span>
          <div id="filter-btypes" style="display:flex;flex-wrap:wrap;gap:6px;flex:1"></div>
        </div>
        <div class="filter-row">
          <span class="filter-label">キーワード</span>
          <input type="text" id="filter-q" class="filter-input" placeholder="店名・地名で絞り込み…">
          <button class="filter-btn" id="filter-clear">クリア</button>
        </div>
      </div>
    </div>`;
  c.appendChild(hd);

  if (!useChunkedInitialRender) {
    // 地域チップ（都道府県ページでは非表示）
    if (!hideRegionFilter) renderRegionFilterChips(reports, shopAreaOptions);

    // 業種チップ（地域・都道府県・国フィルタに連動）
    renderBtypeFilterChips(reports, shopAreaOptions);
  }

  // フィルター開閉
  document.getElementById('filter-toggle').addEventListener('click', () => {
    const card = document.getElementById('filter-card');
    const toggle = document.getElementById('filter-toggle');
    card.classList.toggle('expanded');
    toggle.classList.toggle('open', card.classList.contains('expanded'));
  });
  // キーワード
  const qInput = document.getElementById('filter-q');
  qInput.value = currentFilter.q || '';
  qInput.addEventListener('input', () => {
    currentFilter.q = qInput.value.trim();
    persistCurrentFilter();
    renderShopArea(reports, shopAreaOptions);
  });
  // クリア
  document.getElementById('filter-clear').addEventListener('click', () => {
    qInput.value = '';
    currentFilter.q = '';
    currentFilter.region = '';
    currentFilter.prefs = new Set();
    currentFilter.country = '';
    document.querySelectorAll('.btype-chip').forEach(el => el.classList.remove('active'));
    currentFilter.btypes = new Set();
    persistCurrentFilter();
    if (!hideRegionFilter) renderRegionFilterChips(reports, shopAreaOptions);
    renderBtypeFilterChips(reports, shopAreaOptions);
    renderShopArea(reports, shopAreaOptions);
  });

  // 店舗エリア
  const shopAreaWrap = document.createElement('div');
  shopAreaWrap.className = 'pref-view-wrap shop-area-wrap';
  const shopArea = document.createElement('div');
  shopArea.id = 'shop-area';
  shopAreaWrap.appendChild(shopArea);
  c.appendChild(shopAreaWrap);

  if (useChunkedInitialRender) {
    let cancelled = false;
    shopArea.innerHTML = `<div class="loading"><div>表示準備中…</div></div>`;
    _cancelChunkedRender = () => {
      cancelled = true;
      _cancelChunkedRender = null;
    };
    requestAnimationFrame(() => {
      if (cancelled) return;
      _cancelChunkedRender = null;
      if (!hideRegionFilter) renderRegionFilterChips(reports, shopAreaOptions);
      renderBtypeFilterChips(reports, shopAreaOptions);
      renderShopArea(reports, { ...shopAreaOptions, chunked: true });
    });
  } else {
    renderShopArea(reports, shopAreaOptions);
  }
}

function renderYearView(yearLabel) {
  const reports = ALL_REPORTS.filter(r => r.year === yearLabel);
  renderFilteredView(yearLabel, reports);
}


function renderHistoryAllView(params = {}) {
  const currentView = navStack[navStack.length - 1];
  const presetFilter = createHistoryPresetFilter(params);
  if (presetFilter && currentView && !currentView.filter) {
    currentView.filter = presetFilter;
  }
  if (params.expandAll && currentView && !currentView.expandAllApplied) {
    currentView.expandAllOnInitialRender = true;
  }
  renderFilteredView('全期間', ALL_REPORTS, { hideTitleCount: true, chunked: true });
  setCurrentPageUrl('https://pinsalo.info/sp/historyall.htm');
}

function buildLocSectionsHtml(sortedLocs, expandKeys, locExpandKeys) {
  let html = '';
  sortedLocs.forEach(([loc, shopMap]) => {
    const totalCnt = [...shopMap.values()].reduce((s, v) => s + v.length, 0);
    const locExpandedClass = locExpandKeys.has(loc) ? ' expanded' : '';
    html += `<div class="loc-section${locExpandedClass}" data-loc="${escHtml(loc)}">
      <div class="loc-hd" data-loc-toggle="${escHtml(loc)}">
        <span class="loc-hd-main"><span class="loc-arrow">▶</span><span>${escHtml(loc)}</span></span>
        <span class="loc-meta">${shopMap.size.toLocaleString()}店 / ${totalCnt.toLocaleString()}レポート</span>
      </div>
      <div class="shop-list">`;
    const sortedShops = [...shopMap.entries()].sort((a, b) => b[1].length - a[1].length);
    sortedShops.forEach(([shop, reports]) => {
      const btypeCnt = {};
      reports.forEach(r => { btypeCnt[r.btype] = (btypeCnt[r.btype] || 0) + 1; });
      const rawBtype = Object.entries(btypeCnt).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'その他';
      const mainBtype = rawBtype === '不明' ? 'その他' : rawBtype;
      const shopKey = `${loc}/${shop}`;
      const expandedClass = expandKeys.has(shopKey) ? ' expanded' : '';
      const sortedReports = reports.slice().sort((a, b) => yearKey(b.year) - yearKey(a.year));

      html += `<div class="shop-card${expandedClass}" data-shop-key="${escHtml(shopKey)}">
        <div class="shop-hd" data-shop-toggle="${escHtml(shopKey)}">
          <span class="shop-arrow">▶</span>
          <span class="btype-badge btype-${escHtml(mainBtype)}">${escHtml(mainBtype)}</span>
          <span class="shop-name">${escHtml(shop)}</span>
          <span class="shop-cnt">${reports.length}</span>
        </div>
        <div class="reports-list">`;
      sortedReports.forEach(r => {
        html += `<div class="report-item" data-report-href="${escHtml(r.href)}" data-report-text="${escHtml(r.text)}" data-report-year="${escHtml(r.year)}">
          <span class="report-year">${escHtml(r.year)}</span>
          <span class="report-text">${escHtml(r.text)}</span>
        </div>`;
      });
      html += `</div></div>`;
    });
    html += `</div></div>`;
  });
  return html;
}

const RENDER_CHUNK_SIZES = [3, 6, 12, 24];

function attachLocListeners(container, currentView) {
  container.querySelectorAll('.loc-hd').forEach(el => {
    el.addEventListener('click', () => {
      const section = el.closest('.loc-section');
      if (!section) return;
      section.classList.toggle('expanded');
      currentView.locExpandKeys = collectLocExpandKeys();
    });
  });

  container.querySelectorAll('.shop-hd').forEach(el => {
    el.addEventListener('click', () => {
      el.parentElement.classList.toggle('expanded');
      currentView.expandKeys = collectExpandKeys();
    });
  });

  container.querySelectorAll('.report-item').forEach(el => {
    el.addEventListener('click', () => {
      pushView('report', {
        href: el.dataset.reportHref,
        title: el.dataset.reportText,
        year: el.dataset.reportYear,
      });
    });
  });
}

function renderShopAreaChunked(sortedLocs, shopArea, expandKeys, locExpandKeys, currentView) {
  let i = 0;
  let chunkIndex = 0;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    if (i === 0) shopArea.innerHTML = '';

    const size = RENDER_CHUNK_SIZES[Math.min(chunkIndex++, RENDER_CHUNK_SIZES.length - 1)];
    const chunk = sortedLocs.slice(i, i + size);
    i += size;

    if (chunk.length > 0) {
      const tmp = document.createElement('div');
      tmp.innerHTML = buildLocSectionsHtml(chunk, expandKeys, locExpandKeys);
      attachLocListeners(tmp, currentView);
      while (tmp.firstChild) shopArea.appendChild(tmp.firstChild);
    }

    if (i < sortedLocs.length) {
      requestAnimationFrame(tick);
    } else {
      _cancelChunkedRender = null;
    }
  };

  _cancelChunkedRender = () => { cancelled = true; };
  tick();
}

function renderShopArea(allReports, options = {}) {
  cancelActiveChunkedRender();
  renderShopAreaNow(allReports, options);
}

// ─ 店舗一覧描画本体 ─
function renderShopAreaNow(allReports, options = {}) {
  const subareaMap = options.subareaMap || null;
  const subareaOrder = options.subareaOrder || null;
  // フィルター更新で再描画しても、詳細地域の展開状態を維持する
  const currentView = navStack[navStack.length - 1];
  const openedLocsBeforeRender = collectLocExpandKeys();
  if (openedLocsBeforeRender.size > 0) currentView.locExpandKeys = openedLocsBeforeRender;
  const openedSubareasBeforeRender = collectSubareaExpandKeys();
  if (openedSubareasBeforeRender.size > 0) currentView.subareaExpandKeys = openedSubareasBeforeRender;

  const q = currentFilter.q.toLowerCase();
  const filtered = applyRegionFilterOnly(allReports).filter(r => {
    // 業種未選択時は全業種を表示。1つ以上選択されている場合のみOR条件で絞り込み。
    if (currentFilter.btypes.size > 0 && !currentFilter.btypes.has(r.btype === '不明' ? 'その他' : r.btype)) return false;
    if (q && !(r.shop.toLowerCase().includes(q) || r.loc.toLowerCase().includes(q) || r.text.toLowerCase().includes(q))) return false;
    return true;
  });

  const lbl = document.getElementById('filter-cnt-label');
  if (lbl) lbl.textContent = `(${filtered.length.toLocaleString()}件 / ${allReports.length.toLocaleString()}件中)`;

  const locMap = new Map();
  filtered.forEach(r => {
    if (!locMap.has(r.loc)) locMap.set(r.loc, new Map());
    const m = locMap.get(r.loc);
    if (!m.has(r.shop)) m.set(r.shop, []);
    m.get(r.shop).push(r);
  });

  const sortedLocs = [...locMap.entries()].sort((a, b) => {
    const aCnt = [...a[1].values()].reduce((s, v) => s + v.length, 0);
    const bCnt = [...b[1].values()].reduce((s, v) => s + v.length, 0);
    return bCnt - aCnt;
  });

  const shopArea = document.getElementById('shop-area');
  if (sortedLocs.length === 0) {
    shopArea.innerHTML = `<div class="empty">該当する店舗・レポートはありません</div>`;
    return;
  }

  const validLocKeys = new Set(sortedLocs.map(([loc]) => loc));
  if (currentView.expandAllOnInitialRender) {
    currentView.locExpandKeys = new Set(sortedLocs.map(([loc]) => loc));
    currentView.expandKeys = new Set(
      sortedLocs.flatMap(([loc, shopMap]) => [...shopMap.keys()].map(shop => `${loc}/${shop}`))
    );
    currentView.expandAllOnInitialRender = false;
    currentView.expandAllApplied = true;
  }

  const expandKeys = currentView.expandKeys || new Set();
  currentView.locExpandKeys = new Set([...(currentView.locExpandKeys || new Set())].filter(k => validLocKeys.has(k)));
  const locExpandKeys = currentView.locExpandKeys;
  const validSubareaKeys = new Set();

  if (subareaMap && subareaOrder) {
    const subareaGroups = new Map(subareaOrder.map(k => [k, []]));
    const unclassified = [];
    sortedLocs.forEach(entry => {
      const sub = subareaMap[entry[0]];
      if (sub && subareaGroups.has(sub)) subareaGroups.get(sub).push(entry);
      else unclassified.push(entry);
    });

    let html = '';
    currentView.subareaExpandKeys = new Set([...(currentView.subareaExpandKeys || new Set())].filter(k => subareaGroups.has(k)));
    const subareaExpandKeys = currentView.subareaExpandKeys;
    subareaOrder.forEach(sub => {
      const locs = subareaGroups.get(sub);
      if (!locs || locs.length === 0) return;
      validSubareaKeys.add(sub);
      const subShopTotal = locs.reduce((s, [, shopMap]) => s + shopMap.size, 0);
      const subTotal = locs.reduce((s, [, shopMap]) =>
        s + [...shopMap.values()].reduce((ss, v) => ss + v.length, 0), 0);
      const isOpen = subareaExpandKeys.has(sub);
      html += `<div class="tokyo-subarea-section${isOpen ? ' expanded' : ''}" data-subarea="${escHtml(sub)}">
        <div class="tokyo-subarea-hd">
          <span class="tokyo-subarea-name">東京${escHtml(sub)}</span>
          <span class="tokyo-subarea-meta">${subShopTotal.toLocaleString()}店 / ${subTotal.toLocaleString()}レポート</span>
        </div>
        <div class="tokyo-subarea-body">`;
      html += buildLocSectionsHtml(locs, expandKeys, locExpandKeys);
      html += `</div></div>`;
    });
    currentView.subareaExpandKeys = new Set([...subareaExpandKeys].filter(k => validSubareaKeys.has(k)));
    if (unclassified.length > 0) html += buildLocSectionsHtml(unclassified, expandKeys, locExpandKeys);
    shopArea.innerHTML = html;
  } else {
    currentView.subareaExpandKeys = new Set();
    if (options.chunked) {
      renderShopAreaChunked(sortedLocs, shopArea, expandKeys, locExpandKeys, currentView);
      return;
    }
    shopArea.innerHTML = buildLocSectionsHtml(sortedLocs, expandKeys, locExpandKeys);
  }

  shopArea.querySelectorAll('.tokyo-subarea-hd').forEach(el => {
    el.addEventListener('click', () => {
      const section = el.closest('.tokyo-subarea-section');
      if (!section) return;
      section.classList.toggle('expanded');
      currentView.subareaExpandKeys = collectSubareaExpandKeys();
    });
  });

  attachLocListeners(shopArea, currentView);
}

// ═══════════════════════════════════════════════════════════════════════
// 12. レポート本文表示
// ═══════════════════════════════════════════════════════════════════════
function postProcessReportDoc(doc) {
  if (!doc?.body) return;

  const removableTextPatterns = [
    /トップページへ/,
    /©日本ピンサロ研究会/,
    /\(C\)日本ピンサロ研究会/i,
    /Copyright.*日本ピンサロ研究会/i,
  ];
  doc.body.querySelectorAll('a, p, div, center, font, span, td').forEach(el => {
    const text = (el.textContent || '').replace(/\s+/g, '');
    if (!text) return;
    const shouldRemove = removableTextPatterns.some(pattern => pattern.test(text));
    if (!shouldRemove) return;
    if (el.querySelector('img, table, iframe, object, embed')) return;
    if (text.length > 80 && !text.includes('トップページへ')) return;
    el.remove();
  });

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let baseTextNode = null;
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.includes('調査部から補足事項')) {
      baseTextNode = walker.currentNode;
      break;
    }
  }
  if (!baseTextNode) return;

  const baseStrong = doc.createElement('strong');
  baseStrong.textContent = baseTextNode.nodeValue;
  baseTextNode.replaceWith(baseStrong);
  baseTextNode = baseStrong.firstChild;

  const anchorsToUnwrap = [];
  const nodeWalker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let afterBase = false;
  while (nodeWalker.nextNode()) {
    const node = nodeWalker.currentNode;
    if (node === baseTextNode) {
      afterBase = true;
      continue;
    }
    if (afterBase && node.nodeType === 1 && node.tagName?.toLowerCase() === 'a') {
      anchorsToUnwrap.push(node);
    }
  }
  anchorsToUnwrap.forEach(a => {
    const frag = doc.createDocumentFragment();
    while (a.firstChild) frag.appendChild(a.firstChild);
    a.replaceWith(frag);
  });

  const textWalker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let inSupplement = false;
  const textNodes = [];
  while (textWalker.nextNode()) {
    const node = textWalker.currentNode;
    if (node === baseTextNode) inSupplement = true;
    if (inSupplement && node.nodeValue.includes('，')) textNodes.push(node);
  }

  textNodes.forEach(node => {
    const parts = node.nodeValue.split('，');
    const frag = doc.createDocumentFragment();
    parts.forEach((part, idx) => {
      if (idx > 0) frag.appendChild(doc.createElement('br'));
      if (part) frag.appendChild(doc.createTextNode(part));
    });
    node.replaceWith(frag);
  });

  const reportCreditWalker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const creditNodes = [];
  while (reportCreditWalker.nextNode()) {
    const node = reportCreditWalker.currentNode;
    if (node.nodeValue.includes('がレポートしております。')) creditNodes.push(node);
  }
  creditNodes.forEach(node => {
    const parts = node.nodeValue.split('がレポートしております。');
    if (parts.length < 2) return;
    const frag = doc.createDocumentFragment();
    parts.forEach((part, idx) => {
      if (part) frag.appendChild(doc.createTextNode(part));
      if (idx < parts.length - 1) {
        frag.appendChild(doc.createElement('br'));
        frag.appendChild(doc.createTextNode('がレポートしております。'));
      }
    });
    node.replaceWith(frag);
  });

  const supplementNodes = [];
  const supplementWalker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let inReportList = false;
  while (supplementWalker.nextNode()) {
    const node = supplementWalker.currentNode;
    const text = node.nodeValue || '';
    if (text.includes('本店舗は他に')) {
      inReportList = true;
      continue;
    }
    if (!inReportList) continue;
    if (text.includes('がレポートしております。')) break;
    if (node.nodeType === 3 && /氏/.test(text)) supplementNodes.push(node);
  }

  supplementNodes.forEach(node => {
    const text = node.nodeValue || '';
    if (/^[\s　]*・/.test(text)) return;
    const leading = text.match(/^[\s　]*/)?.[0] || '';
    node.nodeValue = `${leading}・${text.slice(leading.length)}`;
  });
}

async function renderReport(params) {
  setCurrentPageUrl(params.href || '');
  const c = document.getElementById('content');
  c.innerHTML = `<div class="loading"><div>レポート読み込み中…</div></div>`;

  try {
    const html   = await fetchWithProxy(params.href);
    const baseUrl = params.href;
    const doc    = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src) try { img.src = new URL(src, baseUrl).href; } catch {}
    });
    doc.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && !/^#/.test(href)) try {
        a.href = new URL(href, baseUrl).href;
        a.target = '_blank'; a.rel = 'noopener';
      } catch {}
    });
    doc.querySelectorAll('script,iframe,noscript').forEach(el => el.remove());
    ['[src*="dtiserv"]','[href*="dtiserv"]','[src*="affiliate"]','[href*="affiliate"]'].forEach(sel =>
      doc.querySelectorAll(sel).forEach(e => e.remove()));
    try {
      postProcessReportDoc(doc);
    } catch (postProcessError) {
      console.warn('レポート後処理失敗:', postProcessError);
    }
    const body = doc.body ? doc.body.innerHTML : html;
    const historyInfo = getReportHistoryLinkInfo(params, doc);

    c.innerHTML = `<div class="report-body">${body}</div>${buildReportHistoryCardHtml(historyInfo)}`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    const historyLink = document.getElementById('report-shop-history-link');
    if (historyLink && historyInfo?.shop) {
      historyLink.addEventListener('click', () => {
        pushView('historyAll', {
          presetQ: historyInfo.shop,
          presetPref: historyInfo.pref,
          presetCountry: historyInfo.country,
          presetIsOverseas: historyInfo.isOverseas,
          expandAll: true,
        });
      });
    }
  } catch (e) {
    c.innerHTML = `
      <div class="report-view-hd">
        <div class="report-view-title">${escHtml(params.title || 'レポート')}</div>
      </div>
      <div class="error">エラー: ${escHtml(e.message)}</div>
      <a class="ext-link" href="${escHtml(params.href)}" target="_blank" rel="noopener">元ページを直接開く ↗</a>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 13. 汎用ページ表示（研究・情報 / 組織・参加 等）
// ═══════════════════════════════════════════════════════════════════════
async function renderPageView(params) {
  setCurrentPageUrl(params.url || '');
  const c = document.getElementById('content');
  c.innerHTML = `<div class="loading"><div>${escHtml(params.title || '')} 読み込み中…</div></div>`;

  try {
    const html = await fetchWithProxy(params.url);
    const doc  = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,iframe,noscript').forEach(e => e.remove());
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src) try { img.src = new URL(src, params.url).href; } catch {}
    });
    doc.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && !/^#/.test(href)) try {
        a.href = new URL(href, params.url).href;
        a.target = '_blank'; a.rel = 'noopener';
      } catch {}
    });

    c.innerHTML = `
      <div class="report-view-hd">
        <div class="report-view-title">${escHtml(params.title || '')}</div>
        <div class="report-view-sub">
          <a href="${escHtml(params.url)}" target="_blank" rel="noopener" style="color:var(--primary);font-size:12px;">元ページ ↗</a>
        </div>
      </div>
      <div class="report-body">${doc.body ? doc.body.innerHTML : html}</div>`;
  } catch (e) {
    c.innerHTML = `
      <div class="report-view-hd">
        <div class="report-view-title">${escHtml(params.title || '')}</div>
      </div>
      <div class="error">取得失敗: ${escHtml(e.message)}</div>
      <a class="ext-link" href="${escHtml(params.url)}" target="_blank" rel="noopener">元ページを直接開く ↗</a>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 14. 期間別レポートリスト構築
// ═══════════════════════════════════════════════════════════════════════
function buildPeriodSection(sectionEl) {
  if (!sectionEl) return;

  const allItem = document.createElement('div');
  allItem.className = 'nav-btn-item';
  allItem.innerHTML = `<span>全期間</span><span class="region-cnt">${ALL_REPORTS.length.toLocaleString()}件</span>`;
  allItem.onclick = () => pushView('historyAll', {});
  sectionEl.appendChild(allItem);

  const years = new Set(ALL_REPORTS.map(r => r.year).filter(Boolean));

  const reiwa = [], heiseiLate = [], heiseiEarly = [];
  years.forEach(y => {
    const mR = y.match(/令和(\d+)/);
    const mH = y.match(/平成(\d+)/);
    if (mR) {
      const n = parseInt(mR[1], 10);
      if (!Number.isNaN(n)) reiwa.push({ year: y, n });
    } else if (mH) {
      const n = parseInt(mH[1], 10);
      if (Number.isNaN(n)) return;
      if (n >= 21) heiseiLate.push({ year: y, n });
      else heiseiEarly.push({ year: y, n });
    }
  });

  reiwa.sort((a, b) => b.n - a.n);
  heiseiLate.sort((a, b) => b.n - a.n);
  heiseiEarly.sort((a, b) => b.n - a.n);

  buildYearGroup(sectionEl, 'period:reiwa', '令和',     reiwa,       y => `R${String(y.n).padStart(2,'0')}`);
  buildYearGroup(sectionEl, 'period:heiseiLate', '平成後期', heiseiLate,  y => `H${y.n}`);
  buildYearGroup(sectionEl, 'period:heiseiEarly', '平成前期', heiseiEarly, y => `H${y.n}`);
}

function buildYearGroup(container, key, label, items, fmtLabel) {
  if (!Array.isArray(items) || items.length === 0) return;
  if (!container) return;
  const first = items[items.length - 1];
  const last  = items[0];
  if (!first || !last) return;
  const range = `（${fmtLabel(first)}-${fmtLabel(last)}）`;
  const total = items.reduce((sum, { year }) =>
    sum + ALL_REPORTS.filter(r => r.year === year).length, 0);

  const wrap = document.createElement('div');
  wrap.className = 'region-accordion';

  const toggle = document.createElement('div');
  toggle.className = 'region-accordion-toggle';
  toggle.innerHTML = `<span>${escHtml(label)}${escHtml(range)}</span><span class="region-cnt">${total.toLocaleString()}件</span>`;

  const body = document.createElement('div');
  body.className = 'region-accordion-body';

  items.forEach(({ year }) => {
    const count = ALL_REPORTS.filter(r => r.year === year).length;
    const el = document.createElement('div');
    el.className = 'region-pref-item';
    el.innerHTML = `<span>${escHtml(year)}</span><span class="pref-cnt">${count.toLocaleString()}件</span>`;
    el.onclick = () => pushView('year', { year });
    body.appendChild(el);
  });

  toggle.onclick = () => setHomeAccordionState(key, !isHomeAccordionOpen(key), toggle, body);
  setHomeAccordionState(key, isHomeAccordionOpen(key), toggle, body);

  wrap.appendChild(toggle);
  wrap.appendChild(body);
  container.appendChild(wrap);
}

export {
  renderHome,
  renderKaimuYearGroupView,
  renderPaperList,
  renderLegacyEmptyCard,
  renderFilteredView,
  renderYearView,
  renderHistoryAllView,
  cancelActiveChunkedRender,
  postProcessReportDoc,
  renderReport,
  renderPageView,
};
