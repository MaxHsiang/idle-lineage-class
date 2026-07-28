(function (G) {
  'use strict';

  const PASS_ID = 'item_genesis_perfect_pass';
  const AWAKEN_ID = 'sk_genesis_omni_awakening';
  const PET_WPN_ID = 'petwpn_genesis_dragon_fang';
  const PET_ARM_ID = 'petarm_genesis_dragon_armor';
  let lastRuntimeRepair = 0;
  let lastRuntimeOwner = '';
  const DRAGONS = [
    { form:'迷你安塔瑞斯', gfx:'安塔瑞斯', ele:'earth', skill:'大地龍息' },
    { form:'迷你法利昂', gfx:'法利昂', ele:'water', skill:'海嘯龍息' },
    { form:'迷你林德拜爾', gfx:'林德拜爾', ele:'wind', skill:'暴風龍息' },
    { form:'迷你巴拉卡斯', gfx:'巴拉卡斯', ele:'fire', skill:'煉獄龍息' }
  ];

  function isGenesis() { return !!(G.classSystem && G.classSystem.isGenesisPlayer()); }
  function makeUid(prefix) { return (prefix || 'gen') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9); }
  function hasPerfectPass() {
    return !!(isGenesis() && window.player && Array.isArray(player.inv) && player.inv.some(function (i) {
      return i && i.id === PASS_ID && (i.cnt || 1) > 0;
    }));
  }
  window.hasGenesisPerfectPass = hasPerfectPass;

  function installDefinitions() {
    if (!window.DB || !DB.items || !DB.skills) return false;
    DB.items[PASS_ID] = {
      n:'創世完美通行證', type:'etc', req:'all', p:0, gachaWeight:0, noUse:true,
      img:'assets/icons/genesis/genesis-perfect-pass-v2.png', genesisItem:true, genesisPerfectPass:true,
      d:'持有即可無條件前往所有已實裝地圖；進入時不消耗鑰匙、票券、傳送卷軸、裂痕核心或金幣。'
    };
    DB.items[PET_WPN_ID] = {
      n:'創世寵物武器・四龍神之牙', type:'arm', slot:'petwpn', req:'all', safe:15, p:0, gachaWeight:0,
      petDmg:80, petHit:100, petStr:12, petDex:12, genesisItem:true, genesisPetGear:true, genesisFixedPetGear:true,
      img:'assets/icons/genesis/relic-fang.png', d:'迷你四龍專屬武器。寵物傷害+80、命中+100、力量與敏捷+12。'
    };
    DB.items[PET_ARM_ID] = {
      n:'創世寵物盔甲・四龍神之甲', type:'arm', slot:'petarm', req:'all', safe:15, p:0, gachaWeight:0,
      petAc:40, petMr:100, petInt:20, petWis:20, petDmgReduce:0.50, genesisItem:true, genesisPetGear:true, genesisFixedPetGear:true,
      img:'assets/icons/genesis/omni-armor.png', d:'迷你四龍專屬盔甲。AC-40、MR+100、智力與精神+20，受到傷害減少50%。'
    };
    DB.skills[AWAKEN_ID] = {
      n:'全能覺醒', type:'passive', tier:1, reqGenesis:1, genesisSkill:true, genesisAllMasteries:true,
      d:'同時啟用所有職業的全部50級覺醒／專精，不需要在每個職業中擇一。'
    };
    try {
      DRAGONS.forEach(function (x) {
        PET_BOOK[x.form] = {
          kind:'spec', tier:2, lv0:1, hp0:1200, mp0:600, hpUp:[30,45], mpUp:[15,25],
          hpReg:40, mpReg:30, apm:100, capm:80, stun:0.42, cha:0, evo:null,
          genesisMiniDragon:true, formGfx:x.gfx, sk:[
            { n:x.skill, mp:18, kind:'magic', d:[6,30], ele:x.ele, aoe:true, w:70 },
            { n:'創世龍牙', mp:8, kind:'extra', crit:true, add:30, w:30 }
          ]
        };
      });
    } catch (e) {}
    return true;
  }

  function omniAwakeningActive(owner) {
    if (!(owner && (owner.cls === 'omni' || owner.genesisOmni === true) && Array.isArray(owner.skills) && owner.skills.includes(AWAKEN_ID))) return false;
    if (owner === window.player && typeof document !== 'undefined') {
      const box = document.getElementById('auto-sk-' + AWAKEN_ID);
      if (box) return !!box.checked;
    }
    return !!(owner.config && owner.config.autoBuffSkills && owner.config.autoBuffSkills[AWAKEN_ID] === true);
  }
  function allMasteryIds() {
    const ids = new Set();
    try { Object.keys(MASTERY_DATA || {}).forEach(function (cls) { Object.keys((MASTERY_DATA[cls] || {}).list || {}).forEach(function (id) { ids.add(id); }); }); } catch (e) {}
    return ids;
  }
  function installOmniAwakening() {
    if (typeof window.hasMastery === 'function' && !window.hasMastery._genesisAllMasteries) {
      const original = window.hasMastery;
      window.hasMastery = function (id) {
        if (omniAwakeningActive(window.player) && allMasteryIds().has(id)) return true;
        return original.apply(this, arguments);
      };
      window.hasMastery._genesisAllMasteries = true;
    }
    if (typeof window.entityHasMastery === 'function' && !window.entityHasMastery._genesisAllMasteries) {
      const original = window.entityHasMastery;
      window.entityHasMastery = function (owner, id) {
        if (omniAwakeningActive(owner) && allMasteryIds().has(id)) return true;
        return original.apply(this, arguments);
      };
      window.entityHasMastery._genesisAllMasteries = true;
    }
    window.genesisOmniMasteryIds = function () { return Array.from(allMasteryIds()); };
    window.genesisOmniAwakeningActive = omniAwakeningActive;
    window.onGenesisOmniAwakeningToggle = function () {
      if (!window.player) return;
      const box=document.getElementById('auto-sk-' + AWAKEN_ID);
      player.config=player.config||{};player.config.autoBuffSkills=player.config.autoBuffSkills||{};
      player.config.autoBuffSkills[AWAKEN_ID]=!!(box&&box.checked);
      try { if(typeof calcStats==='function')calcStats(); if(typeof renderStatusEffects==='function')renderStatusEffects(); if(typeof updateUI==='function')updateUI(); if(typeof saveGame==='function')saveGame(); } catch(e) {}
    };
  }

  function ensureInventory() {
    if (!isGenesis() || !window.player) return;
    player.inv = Array.isArray(player.inv) ? player.inv : [];
    if (!player.inv.some(function (i) { return i && i.id === PASS_ID; })) {
      player.inv.push({id:PASS_ID,uid:makeUid('perfect-pass'),cnt:1,en:0,bless:true,anc:'unity',attr:false,lock:true,junk:false});
    }
  }

  function completeCollections() {
    if (!isGenesis() || !window.player) return false;
    player.equipDex = player.equipDex || {};
    player.miscDex = player.miscDex || {};
    player.relicDex = player.relicDex || {};
    player.cardDex = player.cardDex || {};
    try { Object.keys(EQUIP_ITEM_CAT || {}).forEach(function (id) { player.equipDex[id] = true; }); } catch (e) {}
    try { Object.keys(MISC_ITEM_CAT || {}).forEach(function (id) { player.miscDex[id] = true; }); } catch (e) {}
    try { Object.keys(RELIC_ITEM_CAT || {}).forEach(function (id) { player.relicDex[id] = true; }); } catch (e) {}
    try { Object.keys(CARD_MOB_INFO || {}).forEach(function (name) { player.cardDex[name] = 100; }); player.cardDexV = 2; } catch (e) {}
    if (!player.genesisCollectionsSaved) {
      try { if (typeof saveEquipDex === 'function') saveEquipDex(); } catch (e) {}
      try { if (typeof saveMiscDex === 'function') saveMiscDex(); } catch (e) {}
      try { if (typeof saveRelicDex === 'function') saveRelicDex(); } catch (e) {}
      try { if (typeof saveCardDex === 'function') saveCardDex(); } catch (e) {}
      player.genesisCollectionsSaved = G.config.version;
    }
    return true;
  }

  function petGear(id, slot) {
    return {id:id,uid:makeUid(slot),en:15,bless:true,anc:'unity',attr:'all',lock:true};
  }
  function ensureMiniDragons() {
    if (!isGenesis()) return false;
    try {
      let list = [], owner = _petCurrentOwnerKey(), changed = false;
      if (!owner || typeof currentSlot === 'undefined' || currentSlot == null) return false;
      try { list = petRoster(); } catch (e) { list = []; }
      const dragonForms = DRAGONS.map(function (d) { return d.form; });
      list.forEach(function (p) {
        if (p && String(p.outOwner || '') === owner && !dragonForms.includes(p.form)) {
          p.outOwner=null;p.outSlot=null;p.outV=Date.now();changed=true;
        }
      });
      player.genesisMiniDragons = Array.isArray(player.genesisMiniDragons) ? player.genesisMiniDragons : [];
      DRAGONS.forEach(function (cfg, idx) {
        let p = player.genesisMiniDragons.find(function (x) { return x && x.form === cfg.form; });
        if (!p) p = list.find(function (x) { return x && x.form === cfg.form; });
        if (!p) {
          p = petNewInstance(cfg.form, Math.max(1, player.lv || 1));
          if (!p) return;
          p.genesisMiniDragon = true;
          p.formGfx = cfg.gfx;
          p.locked = true;
          p.name = cfg.form;
          changed = true;
        }
        p.genesisMiniDragon = true;
        p.formGfx = cfg.gfx;
        if (!p.locked) { p.locked = true; changed = true; }
        const targetLv=Math.max(1,player.lv||1);
        if (p.lv !== targetLv) {
          const scaled=petNewInstance(cfg.form,targetLv);
          p.lv=targetLv;p.exp=0;p.mhp=scaled.mhp;p.mmp=scaled.mmp;p.hp=p.mhp;p.mp=p.mmp;changed=true;
        }
        p.eq = p.eq || {};
        if (!p.eq.wpn || p.eq.wpn.id !== PET_WPN_ID) { p.eq.wpn=petGear(PET_WPN_ID,'petwpn'); changed=true; }
        if (!p.eq.arm || p.eq.arm.id !== PET_ARM_ID) { p.eq.arm=petGear(PET_ARM_ID,'petarm'); changed=true; }
        if (p.skillMode == null) { p.skillMode='auto'; changed=true; }
        if (p.outOwner !== owner || String(p.outSlot||'') !== String(currentSlot)) {
          p.outOwner=owner;p.outSlot=String(currentSlot);p.outV=Date.now()+idx;changed=true;
        }
        // 換圖／地圖重啟不可再用基礎 mhp/mmp 裁切，否則 25% 主角繼承量會被當成超額血魔刪除。
        const derivedPet=(typeof petDerive==='function'?petDerive(p):null)||{};
        if(typeof petSyncInheritedVitals==='function')petSyncInheritedVitals(p,derivedPet);
        const effectiveMhp=typeof petMhpEff==='function'?petMhpEff(p):(p.mhp||1);
        const effectiveMmp=(p.mmp||0)+(derivedPet.mmpBonus||0);
        p.hp=Math.max(p._downed?0:1,Math.min(effectiveMhp,p.hp==null?effectiveMhp:p.hp));
        p.mp=Math.max(0,Math.min(effectiveMmp,p.mp==null?effectiveMmp:p.mp));
        player.genesisMiniDragons[idx] = p;
      });
      player.genesisMiniDragons = player.genesisMiniDragons.filter(function (p) { return p && dragonForms.includes(p.form); }).slice(0, 4);
      // 角色存檔是四龍的權威來源；共用寵物桶只作保管畫面的相容鏡像。
      if (player.genesisMiniDragons.length === 4) {
        for (let i=list.length-1;i>=0;i--) if (list[i] && dragonForms.includes(list[i].form)) list.splice(i,1);
        Array.prototype.push.apply(list, player.genesisMiniDragons);
        changed = true;
      }
      if (changed) { petMarkDirty(); try { petRosterSave(); } catch (e) {} }
      return true;
    } catch (e) { console.warn('[Genesis] mini dragons unavailable', e); return false; }
  }

  function installTravelPass() {
    if (typeof window.mapOptDisabled === 'function' && !window.mapOptDisabled._genesisPass) {
      const original = window.mapOptDisabled;
      window.mapOptDisabled = function (m) { return hasPerfectPass() ? false : original.apply(this, arguments); };
      window.mapOptDisabled._genesisPass = true;
    }
    if (typeof window.prideHasTalisman === 'function' && !window.prideHasTalisman._genesisPass) {
      const original = window.prideHasTalisman;
      window.prideHasTalisman = function () { return hasPerfectPass() ? true : original.apply(this, arguments); };
      window.prideHasTalisman._genesisPass = true;
    }
    if (typeof window._sanctConsume === 'function' && !window._sanctConsume._genesisPass) {
      const original = window._sanctConsume;
      window._sanctConsume = function () { return hasPerfectPass() ? true : original.apply(this, arguments); };
      window._sanctConsume._genesisPass = true;
    }
    if (typeof window.changeMap === 'function' && !window.changeMap._genesisPass) {
      const original = window.changeMap;
      window.changeMap = function () {
        if (!hasPerfectPass()) return original.apply(this, arguments);
        let def = null, saved = null;
        try {
          const el = document.getElementById('map-select');
          def = el && typeof mapEntryOf === 'function' ? mapEntryOf(el.value) : null;
          if (def) { saved = {needKey:def.needKey, keyHoldReq:def.keyHoldReq, questReq:def.questReq, affinityReq:def.affinityReq, prideReq:def.prideReq, disabled:def.disabled}; delete def.needKey; delete def.keyHoldReq; delete def.questReq; delete def.affinityReq; delete def.prideReq; delete def.disabled; }
          return original.apply(this, arguments);
        } finally { if (def && saved) Object.keys(saved).forEach(function (k) { if (saved[k] !== undefined) def[k] = saved[k]; }); }
      };
      window.changeMap._genesisPass = true;
    }
    if (typeof window.startOblivion === 'function' && !window.startOblivion._genesisPass) {
      const original = window.startOblivion;
      window.startOblivion = function () { if (!hasPerfectPass()) return original.apply(this, arguments); const gold=player.gold||0; player.gold=Math.max(gold,100000); const r=original.apply(this,arguments); player.gold=gold; return r; };
      window.startOblivion._genesisPass = true;
    }
    if (typeof window.enterRift === 'function' && !window.enterRift._genesisPass) {
      const original = window.enterRift;
      window.enterRift = function () {
        if (!hasPerfectPass()) return original.apply(this, arguments);
        player.inv.push({id:'mat_crack_core',uid:makeUid('pass-core'),cnt:1});
        const r=original.apply(this,arguments);
        player.inv=player.inv.filter(function(i){return !(i&&i.uid&&String(i.uid).indexOf('pass-core-')===0);});
        return r;
      };
      window.enterRift._genesisPass = true;
    }
  }

  function install() {
    installDefinitions(); installOmniAwakening(); ensureInventory(); installTravelPass(); completeCollections(); ensureMiniDragons();
    return true;
  }

  function runtimeRepair() {
    const now=Date.now(), owner=(window.player&&player.enSeed)?String(player.enSeed):'';
    if(owner===lastRuntimeOwner&&now-lastRuntimeRepair<10000)return true;
    lastRuntimeOwner=owner;lastRuntimeRepair=now;
    installDefinitions();installOmniAwakening();ensureInventory();completeCollections();ensureMiniDragons();return true;
  }

  G.content = {install,runtimeRepair,installDefinitions,installOmniAwakening,ensureInventory,completeCollections,ensureMiniDragons,hasPerfectPass,dragons:DRAGONS};
})(window.Genesis = window.Genesis || {});
