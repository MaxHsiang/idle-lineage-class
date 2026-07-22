(function () {
  'use strict';

  const files = [
    'js/genesis/genesis-config.js',
    'js/genesis/genesis-class.js',
    'js/genesis/genesis-equipment.js',
    'js/genesis/genesis-combat.js',
    'js/genesis/genesis-poly.js'
  ];

  function loadSequentially(index) {
    if (index >= files.length) {
      const G = window.Genesis;
      if (G && G.poly) G.poly.install();
      if (G && G.classSystem) {
        G.classSystem.markPlayer();
        G.classSystem.grantAllSkills();
      }
      window.dispatchEvent(new CustomEvent('genesis:ready', { detail: G && G.config }));
      console.info('[Genesis] framework ready', G && G.config);
      return;
    }
    const script = document.createElement('script');
    script.src = files[index] + '?v=1.3.0-dev';
    script.onload = function () { loadSequentially(index + 1); };
    script.onerror = function () { console.error('[Genesis] failed to load', files[index]); };
    document.body.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { loadSequentially(0); });
  } else {
    loadSequentially(0);
  }
})();
