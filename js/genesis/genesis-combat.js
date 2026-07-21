(function (G) {
  'use strict';

  function isActive() {
    return !!(G.classSystem && G.classSystem.isGenesisPlayer());
  }

  function restoreFromDamage(amount) {
    if (!isActive() || !window.player) return;
    const value = Math.max(0, Number(amount) || 0);
    const hp = Math.max(1, Math.floor(value * 0.05));
    const mp = Math.max(1, Math.floor(value * 0.02));
    player.hp = Math.min(player.mhp || player.hp, (player.hp || 0) + hp);
    player.mp = Math.min(player.mmp || player.mp, (player.mp || 0) + mp);
  }

  G.combat = { isActive, restoreFromDamage };
})(window.Genesis = window.Genesis || {});
