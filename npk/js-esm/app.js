import {
  loadData,
  applyBtypeCache,
  enrichUnknownBtypes,
} from './fetch.js';
import {
  goBack,
  goHome,
  resetHomeViewState,
  renderCurrent,
  updateBackButton,
  updateExtButton,
  getCurrentPageUrl,
} from './router.js';
import { legacyCurrentUrl, openLegacyPage } from './legacy.js';
import { escHtml, setScrollTop } from './utils.js';

// ═══════════════════════════════════════════════════════════════════════
// 16. 表示設定
// ═══════════════════════════════════════════════════════════════════════
const FS_STEPS = [
  { size: '13px', label: '特小' },
  { size: '15px', label: '小' },
  { size: '17px', label: '中' },
  { size: '19px', label: '大' },
  { size: '21px', label: '特大' },
];
let fsIdx = 2;

const PALETTES = [
  { key: 'light', label: 'ライト', font: 'sans' },
  { key: 'dark', label: 'ダーク', font: 'serif' },
  { key: 'sepia', label: 'レトロ', font: 'round' },
];

function applyFontSize(index) {
  fsIdx = Math.max(0, Math.min(FS_STEPS.length - 1, Number(index) || 0));
  document.documentElement.style.setProperty('--content-fs', FS_STEPS[fsIdx].size);
  const label = document.getElementById('font-label');
  if (label) label.textContent = FS_STEPS[fsIdx].label;
  localStorage.setItem('pinsalo_v2_font_size_idx', String(fsIdx));
}

function applyPalette(key) {
  const palette = PALETTES.find(p => p.key === key) || PALETTES[0];
  document.body.dataset.palette = palette.key;
  document.body.dataset.font = palette.font;
  const label = document.getElementById('palette-label');
  if (label) label.textContent = palette.label;
  localStorage.setItem('pinsalo_v2_palette', palette.key);
}

function cyclePalette() {
  const current = document.body.dataset.palette || PALETTES[0].key;
  const idx = PALETTES.findIndex(p => p.key === current);
  applyPalette(PALETTES[(idx + 1 + PALETTES.length) % PALETTES.length].key);
}

document.getElementById('b-palette')?.addEventListener('click', cyclePalette);

document.getElementById('b-font')?.addEventListener('click', () => {
  applyFontSize((fsIdx + 1) % FS_STEPS.length);
});

localStorage.removeItem('pinsalo_v2_font_kind');
applyPalette(localStorage.getItem('pinsalo_v2_palette') || 'light');
applyFontSize(localStorage.getItem('pinsalo_v2_font_size_idx') ?? fsIdx);

// ═══════════════════════════════════════════════════════════════════════
// 17-B. レガシーコンテンツ内リンク捕捉
// ═══════════════════════════════════════════════════════════════════════
document.getElementById('content').addEventListener('click', e => {
  if (!legacyCurrentUrl) return;
  const a = e.target.closest('a');
  if (!a || !a.href) return;
  const href = a.href;
  if (/pinsalo\.info/i.test(href) && !/\.(jpe?g|png|gif|webp|css|js)(\?|$)/i.test(href)) {
    e.preventDefault();
    e.stopPropagation();
    openLegacyPage(href, a.textContent.trim() || href.split('/').pop());
  }
}, true);

document.getElementById('page-title').onclick = () => goHome();

document.getElementById('b-back').onclick = goBack;
document.getElementById('b-home').onclick = goHome;
document.getElementById('b-ext').onclick  = () => {
  const currentPageUrl = getCurrentPageUrl();
  if (currentPageUrl) window.open(currentPageUrl, '_blank');
};
updateExtButton();

// データ再取得ボタン
document.getElementById('m-reload').onclick = async () => {
  if (!confirm('データを再取得します。よろしいですか？')) return;
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="loading">
      <div>データ再取得中…</div>
      <div class="prog-bar-bg"><div class="prog-bar" id="prog-bar"></div></div>
      <div id="prog-text">準備中</div>
    </div>`;
  try {
    await loadData(true);
    resetHomeViewState();
    renderCurrent();
    updateBackButton();
    setScrollTop(0);
  } catch (e) {
    c.innerHTML = `<div class="error">取得失敗: ${escHtml(e.message)}</div>
      <button style="margin:12px;padding:8px 16px;background:var(--primary);color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="location.reload()">再試行</button>`;
  }
};

function fadeOutInitialLogo() {
  const logo = document.querySelector('.initial-logo-loading');
  if (!logo) return Promise.resolve();

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    logo.remove();
    return Promise.resolve();
  }

  document.body.classList.remove('loading');
  logo.classList.add('fade-out');
  return new Promise(resolve => {
    window.setTimeout(() => {
      logo.remove();
      resolve();
    }, 460);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 19. 起動
// ═══════════════════════════════════════════════════════════════════════
(async () => {
  // Lucide アイコン初期化
  if (typeof lucide !== 'undefined') lucide.createIcons();

  try {
    await loadData(false);
    applyBtypeCache();
    await fadeOutInitialLogo();
    renderCurrent();
    updateBackButton();

    // 古い /reports/ 配下など、URLだけでは業種判定できないレポートをバックグラウンドで補完する。
    // 初回表示を待たせないため await しない。
    enrichUnknownBtypes().catch(e => console.warn('btype enrichment:', e));
  } catch (e) {
    document.getElementById('content').innerHTML = `
      <div class="error" style="margin:12px;">初回データ取得失敗: ${escHtml(e.message)}</div>
      <button style="margin:12px;padding:8px 16px;background:var(--primary);color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="location.reload()">再試行</button>`;
  }
})();
