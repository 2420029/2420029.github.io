import { TOKYO_SUBAREA, TOKYO_SUBAREA_ORDER } from './data.js';
import { ALL_REPORTS } from './fetch.js';
import { renderLegacyView, resetLegacyNav } from './legacy.js';
import {
  renderHome,
  renderFilteredView,
  renderYearView,
  renderHistoryAllView,
  renderKaimuYearGroupView,
  renderPageView,
  renderReport,
  cancelActiveChunkedRender,
} from './render.js';
import { escHtml, getScrollTop, setScrollTop } from './utils.js';

// ═══════════════════════════════════════════════════════════════════════
// 6. 集計ヘルパー
// ═══════════════════════════════════════════════════════════════════════
function reportsByPref(pref)       { return ALL_REPORTS.filter(r => !r.isOverseas && r.pref === pref); }
function reportsByCountry(country) { return ALL_REPORTS.filter(r => r.isOverseas && r.country === country); }

// ═══════════════════════════════════════════════════════════════════════
// 8. ナビゲーションスタック
// ═══════════════════════════════════════════════════════════════════════
const navStack = [{ type: 'home', params: {}, scrollY: 0, expandKeys: new Set(), locExpandKeys: new Set(), subareaExpandKeys: new Set() }];

function pushView(type, params) {
  cancelActiveChunkedRender();
  const cur = navStack[navStack.length - 1];
  cur.scrollY = getScrollTop();
  cur.expandKeys = collectExpandKeys();
  cur.locExpandKeys = collectLocExpandKeys();
  cur.subareaExpandKeys = collectSubareaExpandKeys();
  navStack.push({ type, params, scrollY: 0, expandKeys: new Set(), locExpandKeys: new Set(), subareaExpandKeys: new Set() });
  renderCurrent();
  setScrollTop(0);
  updateBackButton();
}

function goBack() {
  cancelActiveChunkedRender();
  if (navStack.length <= 1) return;
  const cur = navStack[navStack.length - 1];
  cur.scrollY = getScrollTop();
  cur.expandKeys = collectExpandKeys();
  cur.locExpandKeys = collectLocExpandKeys();
  cur.subareaExpandKeys = collectSubareaExpandKeys();

  navStack.pop();
  const prev = navStack[navStack.length - 1];
  if (prev.type !== 'legacy') {
    resetLegacyNav();
  }
  renderCurrent();
  requestAnimationFrame(() => requestAnimationFrame(() => setScrollTop(prev.scrollY || 0)));
  updateBackButton();
}

function goHome() {
  cancelActiveChunkedRender();
  resetHomeViewState();
  renderCurrent();
  setScrollTop(0);
  updateBackButton();
}

function resetHomeViewState() {
  resetLegacyNav();
  setCurrentPageUrl('');
  navStack.length = 1;
  navStack[0] = { type: 'home', params: {}, scrollY: 0, expandKeys: new Set(), locExpandKeys: new Set(), subareaExpandKeys: new Set() };
}

function updateBackButton() {
  const btn = document.getElementById('b-back');
  if (btn) btn.style.opacity = '1';
}

function collectExpandKeys() {
  const set = new Set();
  document.querySelectorAll('.shop-card.expanded').forEach(el => {
    if (el.dataset.shopKey) set.add(el.dataset.shopKey);
  });
  return set;
}

function collectLocExpandKeys() {
  const set = new Set();
  document.querySelectorAll('.loc-section.expanded').forEach(el => {
    if (el.dataset.loc) set.add(el.dataset.loc);
  });
  return set;
}

function collectSubareaExpandKeys() {
  const set = new Set();
  document.querySelectorAll('.tokyo-subarea-section.expanded').forEach(el => {
    if (el.dataset.subarea) set.add(el.dataset.subarea);
  });
  return set;
}

// ═══════════════════════════════════════════════════════════════════════
// 9. メイン描画ディスパッチャ
// ═══════════════════════════════════════════════════════════════════════
let currentPageUrl = '';

function updateExtButton() {
  const btn = document.getElementById('b-ext');
  if (!btn) return;
  btn.classList.toggle('ext-disabled', !currentPageUrl);
}

function setCurrentPageUrl(url) {
  currentPageUrl = url || '';
  updateExtButton();
}

function getCurrentPageUrl() {
  return currentPageUrl;
}

const TOP_SECTION_ICONS = {
  today: 'clipboard-list',
  region: 'map-pin',
  period: 'calendar-days',
  research: 'book-open',
  organization: 'users',
};

function setTopSectionHeader(el, iconName, text) {
  if (!el) return;
  el.innerHTML = `<i class="section-icon" data-lucide="${escHtml(iconName)}"></i><span>${escHtml(text)}</span>`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderCurrent() {
  const view = navStack[navStack.length - 1];
  document.getElementById('page-title').textContent = '日ピン研 Viewer β';

  switch (view.type) {
    case 'home':    renderHome();                              break;
    case 'pref':
      renderFilteredView(view.params.pref, reportsByPref(view.params.pref), {
        hideRegionFilter: true,
        subareaMap: view.params.pref === '東京' ? TOKYO_SUBAREA : null,
        subareaOrder: view.params.pref === '東京' ? TOKYO_SUBAREA_ORDER : null,
      });
      break;
    case 'country': renderFilteredView(view.params.country, reportsByCountry(view.params.country)); break;
    case 'year':    renderYearView(view.params.year);          break;
    case 'historyAll': renderHistoryAllView();                 break;
    case 'kaimuYears': renderKaimuYearGroupView(view.params);  return; // async
    case 'page':    renderPageView(view.params);              return; // async
    case 'report':  renderReport(view.params);                return; // async
    case 'legacy':  renderLegacyView(view.params);            return; // async
  }
}

export {
  navStack,
  pushView,
  goBack,
  goHome,
  resetHomeViewState,
  updateBackButton,
  updateExtButton,
  currentPageUrl,
  setCurrentPageUrl,
  getCurrentPageUrl,
  TOP_SECTION_ICONS,
  setTopSectionHeader,
  renderCurrent,
  collectExpandKeys,
  collectLocExpandKeys,
  collectSubareaExpandKeys,
};
