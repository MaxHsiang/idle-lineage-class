(function () {
  'use strict';

  // 創世資料必須在一般 index.html 入口也完成註冊。匯入 omni 存檔時，
  // 若只在 ?genesis=1 載入，原版讀檔會先把未知的創世裝備 ID 清空。
  // 各模組本身都以 isGenesisPlayer() 隔離，因此常駐註冊不影響其他職業。
  let genesisEntry = false;
  try { genesisEntry = new URLSearchParams(location.search).get('genesis') === '1'; }
  catch (e) {}
  if (genesisEntry) document.title = '放置天堂－創世全能師';

  const files = [
    'js/genesis/genesis-config.js',
    'js/genesis/genesis-class.js',
    'js/genesis/genesis-items.js',
    'js/genesis/genesis-equipment.js',
    'js/genesis/genesis-stats.js',
    'js/genesis/genesis-combat.js',
    'js/genesis/genesis-poly.js',
    'js/genesis/genesis-content.js'
  ];

  function showFatal(file) {
    console.error('[Genesis] failed to load', file);
    const old = document.getElementById('genesis-load-error'); if (old) old.remove();
    const msg = document.createElement('div'); msg.id = 'genesis-load-error';
    msg.style.cssText = 'position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:#020617;color:#fca5a5;font:700 20px system-ui,sans-serif;padding:24px;text-align:center';
    msg.textContent = '創世模組載入失敗：' + file + '。請確認檔案完整後按 Ctrl+F5。';
    document.body.appendChild(msg);
  }

  function loadSequentially(index) {
    if (index >= files.length) {
      const G = window.Genesis;
      if (G && G.poly) G.poly.install();
      if (G && G.content) G.content.install();
      if (G && G.classSystem) {
        G.classSystem.installLoadHook();
        G.classSystem.reconcilePlayer(true, false);
        G.classSystem.installRuntimeRepair();
      }
      window.dispatchEvent(new CustomEvent('genesis:ready', { detail: G && G.config }));
      console.info('[Genesis] framework ready', G && G.config);
      return;
    }
    const script = document.createElement('script');
    script.src = files[index] + '?v=1.6.13-dev';
    script.onload = function () { loadSequentially(index + 1); };
    script.onerror = function () { showFatal(files[index]); };
    document.body.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { loadSequentially(0); });
  } else {
    loadSequentially(0);
  }
})();
