(function(){
'use strict';

const GENESIS_NAME='創世全能師';
const GODDESS_NAME='創世女神';
const GODDESS_FORM={
  n:GODDESS_NAME,lv:1,genesisOnly:true,noCastMotion:true,
  atk:1,wlk:1,cast:0,stun:0,ed:25,eh:25,mgd:25,sp:25,
  atkSpdPct:1000,moveSpdPct:1000,c:'text-fuchsia-300'
};
let genesisSelected=false;

function isGenesis(){return !!(window.player&&(player.genesisOmni||player.cls==='omni'));}
function markGenesis(){
  if(!window.player)return;
  player.genesisOmni=true;
  player.cls='omni';
  player.className=GENESIS_NAME;
  player.genesisVersion='1.2.0';
}
function installCreationButton(){
  const nav=document.getElementById('creation-class-list');
  if(!nav||document.getElementById('btn-class-genesis'))return;
  const b=document.createElement('button');
  b.id='btn-class-genesis';b.type='button';b.title=GENESIS_NAME;
  b.className='creation-class-btn';
  b.style.cssText='position:absolute;left:50%;bottom:-62px;transform:translateX(-50%);width:118px;height:42px;border:1px solid #d946ef;border-radius:8px;background:linear-gradient(135deg,#312e81,#86198f);color:#fff;font-weight:800;z-index:20;';
  b.textContent='創世全能師';
  b.onclick=function(){
    genesisSelected=true;
    try{if(typeof selectClassBase==='function')selectClassBase('royal');}catch(_){ }
    const t=document.getElementById('creation-class-title');if(t)t.textContent=GENESIS_NAME;
    const d=document.getElementById('class-desc');if(d)d.innerHTML='王族基底・全技能・全裝備・創世女神・全範圍戰鬥';
  };
  nav.appendChild(b);
}
function wrapCreate(){
  ['createCharacter','confirmCreate','finishCreation'].forEach(function(name){
    const fn=window[name];if(typeof fn!=='function'||fn._genesisWrapped)return;
    window[name]=function(){const r=fn.apply(this,arguments);if(genesisSelected){setTimeout(function(){markGenesis();applyGenesis();save();},0);}return r;};
    window[name]._genesisWrapped=true;
  });
}
function installPoly(){
  try{
    if(typeof POLY_TIERS==='undefined'||!Array.isArray(POLY_TIERS))return;
    for(const tier of POLY_TIERS){if(tier&&Array.isArray(tier.forms)&&tier.forms.some(f=>f&&f.n===GODDESS_NAME))return;}
    const target=POLY_TIERS[0]&&POLY_TIERS[0].forms;
    if(Array.isArray(target))target.unshift(Object.assign({},GODDESS_FORM));
  }catch(_){ }
}
function allSkills(){
  if(!isGenesis()||!window.DB||!DB.skills)return;
  if(!Array.isArray(player.skills))player.skills=[];
  Object.keys(DB.skills).forEach(function(id){if(!player.skills.includes(id))player.skills.push(id);});
}
function equipFreedom(){
  ['canEquip','classCanEquip','canUseWeapon','canWearItem'].forEach(function(name){
    const fn=window[name];if(typeof fn!=='function'||fn._genesisWrapped)return;
    window[name]=function(){if(isGenesis())return true;return fn.apply(this,arguments);};
    window[name]._genesisWrapped=true;
  });
}
function noCastMotion(){
  const fn=window._playerMorphTrigger;if(typeof fn!=='function'||fn._genesisWrapped)return;
  window._playerMorphTrigger=function(kind){if(isGenesis()&&player.poly&&player.poly.n===GODDESS_NAME&&['skill','cast','magic','spell'].includes(kind))return;return fn.apply(this,arguments);};
  window._playerMorphTrigger._genesisWrapped=true;
}
function restoreOnHit(){
  ['playerAttack','doPlayerAttack','attackMob'].forEach(function(name){
    const fn=window[name];if(typeof fn!=='function'||fn._genesisWrapped)return;
    window[name]=function(){const r=fn.apply(this,arguments);if(isGenesis()){player.hp=Math.min(player.mhp||player.hp,(player.hp||0)+Math.max(1,Math.floor((player.mhp||1)*0.02)));player.mp=Math.min(player.mmp||player.mp,(player.mp||0)+Math.max(1,Math.floor((player.mmp||1)*0.02)));}return r;};
    window[name]._genesisWrapped=true;
  });
}
function applyGoddess(){
  if(!isGenesis())return;
  if(!player.poly||player.poly.n==='終極死亡騎士'||player.poly.n==='全能覺醒・死亡騎士')player.poly=Object.assign({},GODDESS_FORM);
}
function applyStats(){
  if(!isGenesis()||!player.d)return;
  player.d.atkSpdPct=Math.max(player.d.atkSpdPct||0,1000);
  player.d.moveSpeedPct=Math.max(player.d.moveSpeedPct||0,1000);
}
function renderGoddess(){
  const active=isGenesis()&&player.poly&&player.buffs&&player.buffs.poly>0&&player.poly.n===GODDESS_NAME;
  let el=document.getElementById('genesis-goddess-sprite');
  if(!active){if(el)el.remove();document.querySelectorAll('[data-genesis-hidden="1"]').forEach(x=>{x.style.visibility='';delete x.dataset.genesisHidden;});return;}
  const host=document.getElementById('battle-view');if(!host)return;
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  document.querySelectorAll('#player-morph-sprite,.player-sprite,#player-sprite').forEach(x=>{if(x.id!=='genesis-goddess-sprite'){x.dataset.genesisHidden='1';x.style.visibility='hidden';}});
  if(!el){el=document.createElement('img');el.id='genesis-goddess-sprite';el.alt=GODDESS_NAME;el.draggable=false;el.style.cssText='position:absolute;left:44%;bottom:5%;height:118px;width:auto;z-index:65;pointer-events:none;image-rendering:pixelated;filter:drop-shadow(0 0 3px #fff) drop-shadow(0 0 8px #22d3ee) drop-shadow(0 0 13px #8b5cf6);';host.appendChild(el);}
  el.src='assets/npc/2141/idle_'+(Math.floor(Date.now()/160)%6)+'.png';
}
function save(){try{if(typeof saveGame==='function')saveGame();}catch(_){ }}
function migrate(){if(window.player&&(player.cls==='omni'||player.genesisOmni)){markGenesis();applyGoddess();}}
function applyGenesis(){installPoly();migrate();allSkills();equipFreedom();noCastMotion();restoreOnHit();applyGoddess();applyStats();renderGoddess();}
function init(){installCreationButton();wrapCreate();applyGenesis();setInterval(function(){installCreationButton();wrapCreate();applyGenesis();},250);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
