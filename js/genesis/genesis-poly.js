(function (G) {
  'use strict';

  const form = Object.freeze({
    n: '創世女神', lv: 1, omniOnly: true, genesisGoddess: true,
    noCastMotion: true, atkSpdPct: 1000, moveSpdPct: 1000,
    wlk: 1, cast: 0, stun: 0, ed: 25, eh: 25, mgd: 25, sp: 25,
    apm: {
      '單手劍':3000,'單手鈍器':3000,'雙手鈍器':3000,'弓':3000,'十字弓':3000,
      '單手矛':3000,'雙手矛':3000,'魔杖':3000,'匕首':3000,'雙手劍':3000,
      '雙刀':3000,'鋼爪':3000,'奇古獸':3000,'鎖鏈劍':3000,'雙斧':3000
    }
  });

  function install() {
    if (!Array.isArray(window.POLY_TIERS) || !POLY_TIERS.length) return false;
    const forms = POLY_TIERS[0] && POLY_TIERS[0].forms;
    if (!Array.isArray(forms)) return false;
    if (!forms.some(x => x && x.n === form.n)) forms.unshift(Object.assign({}, form));
    return true;
  }

  G.poly = { form, install };
})(window.Genesis = window.Genesis || {});
