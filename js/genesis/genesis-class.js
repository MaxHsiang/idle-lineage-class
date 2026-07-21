(function (G) {
  'use strict';

  function isGenesisPlayer() {
    return !!(window.player && (player.cls === G.config.classId || player.genesisClass === true));
  }

  function markPlayer() {
    if (!window.player) return false;
    if (player.cls === G.config.classId) player.genesisClass = true;
    return isGenesisPlayer();
  }

  function grantAllSkills() {
    if (!isGenesisPlayer() || !window.DB || !DB.skills) return;
    player.skills = Array.isArray(player.skills) ? player.skills : [];
    Object.keys(DB.skills).forEach(function (id) {
      if (!player.skills.includes(id)) player.skills.push(id);
    });
  }

  G.classSystem = { isGenesisPlayer, markPlayer, grantAllSkills };
})(window.Genesis = window.Genesis || {});
