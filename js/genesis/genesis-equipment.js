(function (G) {
  'use strict';

  const slots = Object.freeze([
    'wpn','offwpn','helm','armor','cloak','gloves','boots','shield','shirt',
    'belt','neck','ear1','ear2','ring1','ring2','ring3','ring4','rune','doll'
  ]);

  function canEquipAny() {
    return !!(G.classSystem && G.classSystem.isGenesisPlayer());
  }

  G.equipment = { slots, canEquipAny };
})(window.Genesis = window.Genesis || {});
