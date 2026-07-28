(function (G) {
  'use strict';
  function active(){return !!(G.classSystem&&G.classSystem.isGenesisPlayer()&&window.player);}
  function has(id){return !!(G.stats&&G.stats.has(id));}
  function mobsBefore(){return ((window.mapState&&mapState.mobs)||[]).filter(Boolean).map(function(m){return[m,Math.max(0,+m.curHp||0)];});}
  function actualDamage(before){return Math.floor((before||[]).reduce(function(n,r){return n+Math.max(0,r[1]-Math.max(0,+r[0].curHp||0));},0));}
  function spreadDamage(before,label){
    const changed=(before||[]).map(function(r){return{m:r[0],d:Math.max(0,r[1]-Math.max(0,+r[0].curHp||0))};}).filter(function(x){return x.d>0;});
    if(!changed.length)return 0;
    const seed=Math.max.apply(null,changed.map(function(x){return x.d;}));
    const touched=new Set(changed.map(function(x){return x.m;}));let extra=0;
    before.forEach(function(r){
      const m=r[0];if(!m||touched.has(m)||m._dead||m.curHp<=0)return;
      const dmg=Math.min(Math.max(0,+m.curHp||0),seed);if(!(dmg>0))return;
      m.curHp-=dmg;m.justHit='none';extra+=dmg;
      if(m.curHp<=0&&typeof killMob==='function'){const i=mapState.mobs.indexOf(m);if(i>=0)killMob(i);}
    });
    if(extra>0&&typeof logCombat==='function')logCombat('<span class="text-cyan-300 font-bold">【創世萬象・'+label+'全體化】</span>額外造成 '+extra+' 點範圍傷害。','player-special');
    return extra;
  }
  function restore(dmg,hpPct,mpPct,label){
    if(!active()||!(dmg>0)||player.dead)return;
    const hp=Math.floor(dmg*(hpPct||0)),mp=Math.floor(dmg*(mpPct||0));
    if(hp>0)player.hp=Math.min(player.mhp,(player.hp||0)+hp);
    if(mp>0)player.mp=Math.min(player.mmp,(player.mp||0)+mp);
    if((hp>0||mp>0)&&typeof logCombat==='function')logCombat('<span class="text-cyan-300 font-bold">【'+label+'】</span>依實際傷害 '+dmg+'，回復 '+hp+' HP、'+mp+' MP。','heal');
  }
  function chaosEcho(before,kind){
    const target=(before||[]).map(function(r){return r[0];}).find(function(m){return m&&!m._dead&&m.curHp>0;});if(!target)return;
    const base=Math.max(1,actualDamage(before)),dmg=Math.max(1,Math.floor(base*0.20));target.curHp-=dmg;target.justHit='none';
    if(typeof logCombat==='function')logCombat('<span class="text-fuchsia-300 font-bold">【創世混沌共鳴】</span>'+(kind==='magic'?'魔法':'物理')+'追擊 '+dmg+' 點。','player-special');
    if(target.curHp<=0&&typeof killMob==='function'){const i=mapState.mobs.indexOf(target);if(i>=0)killMob(i);}
  }
  function installOutgoing(){
    if(typeof window.playerAttack==='function'&&!window.playerAttack._genesisDrain){
      const original=window.playerAttack;
      window.playerAttack=function(){const b=active()&&has('wpn_genesis_omni_sword')?mobsBefore():null;const r=original.apply(this,arguments);if(b){spreadDamage(b,'物理');const dmg=actualDamage(b);restore(dmg,has('rng_genesis_life')?0.40:0.30,0.30,'創世萬象神劍');if(dmg>0&&has('rng_genesis_chaos')&&Math.random()<0.05)chaosEcho(b,'melee');}return r;};
      window.playerAttack._genesisDrain=true;
    }
    if(typeof window.castSkillInner==='function'&&!window.castSkillInner._genesisDrain){
      const originalCast=window.castSkillInner;
      window.castSkillInner=function(skId){const sk=window.DB&&DB.skills&&DB.skills[skId];const kind=sk&&sk.dmgType;const eligible=active()&&has('wpn_genesis_omni_sword')&&sk&&sk.type==='atk'&&(kind==='magic'||kind==='physical');const b=eligible?mobsBefore():null;const r=originalCast.apply(this,arguments);if(r&&b){if(sk.target!=='all'&&!sk.aoe)spreadDamage(b,kind==='magic'?'魔法':'物理技能');const dmg=actualDamage(b);restore(dmg,0.30,0.30,'創世萬象神劍・技能');if(dmg>0&&has('rng_genesis_chaos')&&Math.random()<0.05)chaosEcho(b,kind==='magic'?'magic':'melee');}return r;};
      window.castSkillInner._genesisDrain=true;
    }
  }
  function installKill(){
    if(typeof window.killMob!=='function'||window.killMob._genesisKill)return;
    const original=window.killMob;
    window.killMob=function(idx){const m=window.mapState&&mapState.mobs&&mapState.mobs[idx],boss=!!(m&&m.boss);const r=original.apply(this,arguments);if(active()&&m&&m._dead&&has('amu_genesis_omni_core')){const pct=boss?15:3;player.hp=Math.min(player.mhp,(player.hp||0)+Math.floor(player.mhp*pct/100));player.mp=Math.min(player.mmp,(player.mp||0)+Math.floor(player.mmp*pct/100));}return r;};
    window.killMob._genesisKill=true;
  }
  function incoming(amount,kind){
    if(!active())return amount;let n=Math.max(0,Math.floor(+amount||0));
    if(kind==='magic')n=Math.max(0,n-((player.d&&player.d.genesisMagicDr)||0));else if(kind==='ranged')n=Math.max(0,n-((player.d&&player.d.genesisRangedDr)||0));else n=Math.max(0,n-((player.d&&player.d.genesisMeleeDr)||0));
    if(has('rng_genesis_life')&&kind!=='magic')n=Math.max(0,n-10);if(has('amr_genesis_omni'))n=Math.min(n,Math.floor((player.mhp||1)*0.35));return n;
  }
  function afterIncoming(amount,kind,mob){
    if(!active()||!(amount>0)||kind==='magic'||!has('shd_genesis_omni')||!mob||mob.curHp<=0||Math.random()>=0.20)return;
    const dmg=Math.max(1,Math.floor(amount*0.25));mob.curHp-=dmg;mob.justHit='none';
    if(typeof logCombat==='function')logCombat('<span class="text-sky-300 font-bold">【創世反震】</span>反彈 '+dmg+' 點傷害。','player-special');
    if(mob.curHp<=0&&typeof killMob==='function'){const i=mapState.mobs.indexOf(mob);if(i>=0)killMob(i);}
  }
  function periodic(){
    if(!active())return;
    if(G.poly&&G.poly.active&&G.poly.active()){
      if(player.cds)Object.keys(player.cds).forEach(function(k){player.cds[k]=0;});
      if(player.manualCd)Object.keys(player.manualCd).forEach(function(k){player.manualCd[k]=0;});
      player._castLock=0;player.castLock=0;
    }
    if(player.statuses&&has('hlm_genesis_omni')){player.statuses.silence=0;player.statuses.magicSeal=0;player.statuses.magicseal=0;}
    if(player.statuses&&has('bot_genesis_temporal')){player.statuses.slow=0;if(player.statuses.stun>0&&!player._genStunHalf){player.statuses.stun=Math.ceil(player.statuses.stun*0.5);player._genStunHalf=true;}if(player.statuses.freeze>0&&!player._genFreezeHalf){player.statuses.freeze=Math.ceil(player.statuses.freeze*0.5);player._genFreezeHalf=true;}if(!(player.statuses.stun>0))player._genStunHalf=false;if(!(player.statuses.freeze>0))player._genFreezeHalf=false;}
    const now=Date.now();
    if(has('bot_genesis_temporal')&&window.mapState&&mapState.current&&player._genesisLastMap!==mapState.current){player._genesisLastMap=mapState.current;player._genesisTemporalUntil=now+10000;if(G.stats)G.stats.recompute();}
    if(has('doll_genesis_core')&&(!player._genDollPulseAt||now-player._genDollPulseAt>=20000)){player._genDollPulseAt=now;player.hp=Math.min(player.mhp,(player.hp||0)+Math.floor(player.mhp*0.05));player.mp=Math.min(player.mmp,(player.mp||0)+Math.floor(player.mmp*0.05));}
    if(has('shin_genesis_immortal')&&player.hp>0&&player.hp<player.mhp*0.20&&now>=(player._genImmortalCd||0)){player._genImmortalCd=now+60000;player.hp=Math.min(player.mhp,player.hp+Math.floor(player.mhp*0.20));player.mp=Math.min(player.mmp,player.mp+Math.floor(player.mmp*0.20));if(typeof logCombat==='function')logCombat('<span class="text-amber-300 font-bold">【創世不滅】</span>回復 HP、MP 20%。','heal');}
  }
  function installControl(){
    ['hasPolyRing','hasTeleportRing','hasSummonCtrlRing'].forEach(function(name){const fn=window[name];if(typeof fn!=='function'||fn._genesisControl)return;window[name]=function(owner){const who=owner||player;if(who&&who.eq&&Object.keys(who.eq).some(function(k){return who.eq[k]&&who.eq[k].id==='rng_genesis_control';}))return true;return fn.apply(this,arguments);};window[name]._genesisControl=true;});
  }
  function install(){installOutgoing();installKill();installControl();if(!G.combat._timer)G.combat._timer=setInterval(periodic,250);}
  G.combat={install,incoming,afterIncoming,periodic};install();
})(window.Genesis=window.Genesis||{});
