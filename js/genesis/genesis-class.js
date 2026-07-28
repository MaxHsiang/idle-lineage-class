(function (G) {
  'use strict';

  function genesisEntryRequested() {
    try { return new URLSearchParams(window.location.search).get('genesis') === '1'; }
    catch (e) { return false; }
  }

  function isGenesisPlayer() {
    return !!(window.player && player.cls && (genesisEntryRequested() || player.cls === G.config.classId || player.cls === 'omni' || player.genesisClass === true || player.genesisOmni === true));
  }

  function markPlayer() {
    if (!window.player) return false;
    if (player.cls && (genesisEntryRequested() || player.cls === G.config.classId || player.cls === 'omni' || player.genesisOmni)) {
      if (!player.genesisBaseClass && player.cls !== G.config.classId && player.cls !== 'omni') player.genesisBaseClass = player.cls;
      player.genesisClass = true;
      player.genesisOmni = true;
      player.className = G.config.className;
      if (!player.avatar) player.avatar = '公主';
    }
    return isGenesisPlayer();
  }

  function grantAllSkills() {
    if (!isGenesisPlayer() || !window.DB || !DB.skills) return;
    player.skills = Array.isArray(player.skills) ? player.skills : [];
    player.skills = player.skills.filter(function (id) { return !String(id).startsWith('sk_helm_'); });
    player.grantedSkills = Array.isArray(player.grantedSkills) ? player.grantedSkills.filter(function (id) { return !String(id).startsWith('sk_helm_'); }) : [];
    Object.keys(DB.skills).filter(function (id) { return !String(id).startsWith('sk_helm_'); }).forEach(function (id) {
      if (!player.skills.includes(id)) player.skills.push(id);
    });
    player.genesisSkillsVersion = G.config.version;
  }

  function loadoutReady() {
    return !!(G.items && player && player.eq && G.items.loadout.every(function (row) {
      return player.eq[row[0]] && player.eq[row[0]].id === row[1];
    }));
  }

  function reconcilePlayer(force, persist) {
    if (!markPlayer()) return false;
    const healthy = player.genesisRuntimeVersion === G.config.version &&
      player.genesisSkillsVersion === G.config.version && loadoutReady();
    if (healthy && !force) { if (G.content && G.content.runtimeRepair) G.content.runtimeRepair(); return true; }
    try {
      if (G.items) {
        G.items.install();
        if (G.items.migrateLegacy) G.items.migrateLegacy();
        else G.items.equipLoadout();
      }
      if (G.content) G.content.install();
      grantAllSkills();
      installFreedom();
      if (G.stats) G.stats.install();
      if (typeof calcStats === 'function') calcStats();
      if (typeof renderTabs === 'function') renderTabs(true);
      if (typeof renderSkillSelects === 'function') renderSkillSelects();
      if (typeof updateUI === 'function') updateUI();
      player.genesisRuntimeVersion = G.config.version;
      if (persist && typeof saveGame === 'function') saveGame();
      return true;
    } catch (e) {
      console.error('[Genesis] player reconciliation failed', e);
      return false;
    }
  }

  function installRuntimeRepair() {
    if (G.classSystem._repairTimer) return;
    G.classSystem._repairTimer = setInterval(function () { reconcilePlayer(false, false); }, 1000);
  }

  function installFreedom() {
    if (typeof window.checkCanEquip === 'function' && !window.checkCanEquip._genesisWrapped) {
      const original = window.checkCanEquip;
      window.checkCanEquip = function () { return isGenesisPlayer() ? true : original.apply(this, arguments); };
      window.checkCanEquip._genesisWrapped = true;
    }
    if (typeof window.hasMastery === 'function' && !window.hasMastery._genesisWrapped) {
      const originalMastery = window.hasMastery;
      window.hasMastery = function () { return isGenesisPlayer() ? true : originalMastery.apply(this, arguments); };
      window.hasMastery._genesisWrapped = true;
    }
  }

  function installLoadHook() {
    if (typeof window.loadGame !== 'function' || window.loadGame._genesisWrapped) return;
    const originalLoad = window.loadGame;
    window.loadGame = function () {
      const result = originalLoad.apply(this, arguments);
      reconcilePlayer(true, true);
      return result;
    };
    window.loadGame._genesisWrapped = true;
  }

  G.classSystem = { isGenesisPlayer, markPlayer, grantAllSkills, installFreedom, installLoadHook, reconcilePlayer, installRuntimeRepair };
})(window.Genesis = window.Genesis || {});
