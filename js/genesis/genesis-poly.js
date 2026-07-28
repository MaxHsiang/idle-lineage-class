(function (G) {
  'use strict';

  const form = Object.freeze({
    n:'創世神型態', lv:1, c:'text-cyan-300', controlOnly:true,
    genesisCreatorForm:true, genesisArkata:true, keepClassAppearance:true, noCastMotion:true,
    atkApm:180, wlk:3.2, cast:0, stun:5, ed:0, eh:0, rd:0, rh:0, mgd:0, sp:0
  });

  function active() {
    return !!(window.player && player.poly && (player.poly.genesisCreatorForm || player.poly.genesisArkata) && player.buffs && player.buffs.poly > 0);
  }
  function installForm() {
    try {
      if (typeof CONTROL_ONLY_POLY_FORMS !== 'undefined' && Array.isArray(CONTROL_ONLY_POLY_FORMS)) {
        for (let i = CONTROL_ONLY_POLY_FORMS.length - 1; i >= 0; i--) {
          const f = CONTROL_ONLY_POLY_FORMS[i];
          if (f && (f.genesisCreatorForm || f.genesisArkata || f.n === '創世神型態' || f.n === '阿卡塔')) CONTROL_ONLY_POLY_FORMS.splice(i, 1);
        }
        CONTROL_ONLY_POLY_FORMS.unshift(Object.assign({}, form));
      }
    } catch (e) {}
  }
  function render() {
    let customStyle=document.getElementById('genesis-creator-style');
    if(!customStyle){
      customStyle=document.createElement('style');customStyle.id='genesis-creator-style';
      customStyle.textContent='@keyframes genesisCreatorBreath{0%,100%{filter:drop-shadow(0 0 4px rgba(34,211,238,.65)) drop-shadow(0 0 8px rgba(139,92,246,.45))}50%{filter:drop-shadow(0 0 8px rgba(34,211,238,.95)) drop-shadow(0 0 15px rgba(139,92,246,.78))}}body.genesis-creator-active #player-morph-sprite .pm-body{animation:genesisCreatorBreath 1.8s ease-in-out infinite}';
      document.head.appendChild(customStyle);
    }
    document.body.classList.toggle('genesis-creator-active',active());
    document.body.classList.remove('genesis-arkata-active');
    ['genesis-arkata-battle','genesis-arkata-town'].forEach(function (id) { const el=document.getElementById(id); if(el)el.remove(); });
    document.querySelectorAll('[data-arkata-hidden="1"]').forEach(function (el) { el.style.visibility=''; delete el.dataset.arkataHidden; });
  }
  function install() {
    installForm(); render();
    if (!G.poly._timer) G.poly._timer=setInterval(function(){installForm();render();},200);
    return true;
  }
  G.poly={form,active,install,render};
})(window.Genesis=window.Genesis||{});
