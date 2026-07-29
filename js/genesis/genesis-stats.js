(function (G) {
  'use strict';

  function eachEquipped(fn) {
    if (!window.player || !player.eq || !window.DB) return;
    Object.keys(player.eq).forEach(function (slot) {
      const inst=player.eq[slot], def=inst&&DB.items[inst.id];
      if (inst&&def) fn(def,inst,slot);
    });
  }
  function has(id) { return !!(window.player&&player.eq&&Object.keys(player.eq).some(k=>player.eq[k]&&player.eq[k].id===id)); }
  function isActive() { return !!(G.classSystem&&G.classSystem.isGenesisPlayer()); }
  function activeCreatorForm() {
    return !!(isActive()&&window.player&&player.poly&&player.buffs&&player.buffs.poly>0&&
      (player.poly.genesisCreatorForm||player.poly.genesisArkata));
  }

  function applyCustomStats() {
    if (!isActive() || !player.d) return;
    const d=player.d;
    let full=0;
    eachEquipped(function (x,inst) {
      if (String(x.n||'').startsWith('創世') || inst.id==='doll_genesis_core') full++;
      const ad=x.genesisAllDmg||0, ah=x.genesisAllHit||0, ac=x.genesisAllCrit||0, cd=x.genesisAllCritDmg||0;
      d.meleeDmg+=ad; d.rangedDmg+=ad; d.magicDmg+=ad;
      d.meleeHit+=ah; d.rangedHit+=ah; d.magicHit+=ah;
      d.meleeCrit+=ac; d.rangedCrit+=ac; d.magicCrit+=ac;
      d.meleeCritDmg+=cd; d.rangedCritDmg+=cd; d.magicCritDmg+=cd;
      d.mpReduce+=(x.genesisMpReduce||0);
      d.magicCrit+=(x.genesisMagicCrit||0); d.magicCritDmg+=(x.genesisMagicCritDmg||0);
      d.genesisMeleeDr=(d.genesisMeleeDr||0)+(x.genesisMeleeDr||0);
      d.genesisRangedDr=(d.genesisRangedDr||0)+(x.genesisRangedDr||0);
      d.genesisMagicDr=(d.genesisMagicDr||0)+(x.genesisMagicDr||0);
    });
    const pageOneFull=!!(G.items&&G.items.loadout&&G.items.loadout.slice(0,19).every(function(row){return player.eq[row[0]]&&player.eq[row[0]].id===row[1];}));
    const pageTwoFull=!!(G.items&&G.items.loadout&&G.items.loadout.slice(19).every(function(row){return player.eq[row[0]]&&player.eq[row[0]].id===row[1];}));
    player._genesisPageOneSet=pageOneFull;
    player._genesisPageTwoSet=pageTwoFull;
    player._genesisFullSet=pageOneFull&&pageTwoFull&&full>=27;
    if (pageOneFull) {
      d.meleeDmg+=10; d.rangedDmg+=10; d.magicDmg+=10;
      d.meleeHit+=10; d.rangedHit+=10; d.magicHit+=10;
      d.meleeCrit+=5; d.rangedCrit+=5; d.magicCrit+=5;
      d.hpR+=20; d.mpR+=20;
    }
    if (player._genesisFullSet) {
      d.meleeDmg+=30; d.rangedDmg+=30; d.magicDmg+=30;
      d.meleeHit+=30; d.rangedHit+=30; d.magicHit+=30;
      d.meleeCrit+=8; d.rangedCrit+=8; d.magicCrit+=8;
      d.dr+=30; d.mr+=50; d.hpR+=30; d.mpR+=30;
      d.resFire+=30; d.resWater+=30; d.resEarth+=30; d.resWind+=30;
    }
    if (has('blt_genesis_order')) d.loadTier=0;
    if (activeCreatorForm()) {
      // Fixed final form speeds: exactly three attacks per second and 500%
      // movement. Equipment, buffs and all-class masteries cannot multiply it.
      d.aspd=1/3;
      d.moveSpeedPct=400;
      d.castLock=0;
    }
    if (player._genesisTemporalUntil && Date.now()<player._genesisTemporalUntil) {
      d.atkSpdPct+=20;
      d.castLock=Math.max(0,(d.castLock||0)*0.8);
    }
    player.hp=Math.min(player.hp,player.mhp); player.mp=Math.min(player.mp,player.mmp);
  }

  function install() {
    if (typeof window.recomputeStats==='function'&&!window.recomputeStats._genesisWrapped) {
      const original=window.recomputeStats;
      window.recomputeStats=function(){
        if(isActive()&&G.items){G.items.install();G.items.equipLoadout();}
        const r=original.apply(this,arguments);applyCustomStats();return r;
      };
      window.recomputeStats._genesisWrapped=true;
    }
    if (typeof window.playerMoveDelayMultiplier==='function'&&!window.playerMoveDelayMultiplier._genesisWrapped) {
      const originalMoveDelay=window.playerMoveDelayMultiplier;
      window.playerMoveDelayMultiplier=function(){
        return activeCreatorForm()?0.2:originalMoveDelay.apply(this,arguments);
      };
      window.playerMoveDelayMultiplier._genesisWrapped=true;
    }
    if (typeof window.playerEffectiveMoveSpeedPct==='function'&&!window.playerEffectiveMoveSpeedPct._genesisWrapped) {
      const originalMovePct=window.playerEffectiveMoveSpeedPct;
      window.playerEffectiveMoveSpeedPct=function(){
        return activeCreatorForm()?500:originalMovePct.apply(this,arguments);
      };
      window.playerEffectiveMoveSpeedPct._genesisWrapped=true;
    }
    if (typeof window.applyAncStats==='function'&&!window.applyAncStats._genesisWrapped) {
      const originalAnc=window.applyAncStats;
      window.applyAncStats=function(d,anc,slot){
        if(anc==='unity'){originalAnc(d,true,slot);originalAnc(d,'eternal',slot);originalAnc(d,'immortal',slot);originalAnc(d,'primordial',slot);return;}
        return originalAnc.apply(this,arguments);
      }; window.applyAncStats._genesisWrapped=true;
    }
    if (typeof window.ancName==='function'&&!window.ancName._genesisWrapped) {
      const originalName=window.ancName; window.ancName=function(v){return v==='unity'?'歸一':originalName(v);}; window.ancName._genesisWrapped=true;
    }
    if (typeof window.getAttrAffix==='function'&&!window.getAttrAffix._genesisWrapped) {
      const originalAttr=window.getAttrAffix; window.getAttrAffix=function(v){return v==='all'?{n:'全',dmg:9,mp:9,tier:5}:originalAttr(v);}; window.getAttrAffix._genesisWrapped=true;
    }
    if (typeof window.attrCanon==='function'&&!window.attrCanon._genesisWrapped) {
      const originalCanon=window.attrCanon; window.attrCanon=function(v){return v==='all'?'all':originalCanon(v);}; window.attrCanon._genesisWrapped=true;
    }
    if (typeof window.elementCounterMult==='function'&&!window.elementCounterMult._genesisWrapped) {
      const originalCounter=window.elementCounterMult;
      window.elementCounterMult=function(att,def){
        if(att==='all') return Math.max.apply(null,['fire','water','earth','wind'].map(function(e){return originalCounter(e,def);}));
        return originalCounter.apply(this,arguments);
      };
      window.elementCounterMult._genesisWrapped=true;
    }
  }
  function recompute(){install();if(typeof calcStats==='function')calcStats();else applyCustomStats();}
  G.stats={install:install,recompute:recompute,applyCustomStats:applyCustomStats,has:has};
})(window.Genesis=window.Genesis||{});
