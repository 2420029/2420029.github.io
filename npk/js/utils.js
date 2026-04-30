// ═══════════════════════════════════════════════════════════════════════
// 7. ユーティリティ
// ═══════════════════════════════════════════════════════════════════════
function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function getScrollTop() {
  return document.getElementById('content-area')?.scrollTop || 0;
}
function setScrollTop(y) {
  const el = document.getElementById('content-area');
  if (el) el.scrollTop = y;
}
