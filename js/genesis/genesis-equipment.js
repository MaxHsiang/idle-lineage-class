(function (G) {
  'use strict';

  const slots = Object.freeze([
    'wpn','helm','ear1','ear2','gloves','amulet','shield','armor','ring1',
    'tshirt','cloak','ring2','ring3','belt','boots','ring4','doll','shin','special',
    'rem_eye','rem_blood','rem_scale','rem_bone','rem_fang','rem_heart','rem_flesh','rem_claw'
  ]);

  function canEquipAny() {
    return !!(G.classSystem && G.classSystem.isGenesisPlayer());
  }

  G.equipment = { slots, canEquipAny };
})(window.Genesis = window.Genesis || {});
