const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

global.window = global;
global.location = { search: '?genesis=1' };
global.DB = { items: {}, skills: { sk_test: { n: '測試技能' } } };
global.uid = (() => { let n = 0; return () => `test-${++n}`; })();

const launcherHtml = fs.readFileSync(path.join(__dirname, '..', 'genesis.html'), 'utf8');
const gameHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const loaderJs = fs.readFileSync(path.join(__dirname, '..', 'js/genesis/genesis-loader.js'), 'utf8');
const dataJs = fs.readFileSync(path.join(__dirname, '..', 'js/00-data.js'), 'utf8');
const dropsJs = fs.readFileSync(path.join(__dirname, '..', 'js/01-drops-config.js'), 'utf8');
const tabsJs = fs.readFileSync(path.join(__dirname, '..', 'js/10-ui-tabs.js'), 'utf8');
const polyJs = fs.readFileSync(path.join(__dirname, '..', 'js/genesis/genesis-poly.js'), 'utf8');
assert.ok(!/<iframe\b/i.test(launcherHtml), 'file launcher must not use a cross-origin iframe');
assert.ok(launcherHtml.includes("location.replace('index.html?genesis=1&build=174')"), 'file launcher redirect missing');
assert.ok(gameHtml.includes('js/genesis/genesis-loader.js?v=1.6.14-static-bootstrap'), 'static genesis loader bootstrap missing');
assert.ok(!loaderJs.includes("get('genesis') !== '1') return"), 'genesis item registry must load from the normal index entry');
assert.ok(loaderJs.includes("get('genesis') === '1'"), 'genesis entry title detection missing');
assert.ok(dataJs.includes("Object.defineProperty(window, 'DB'"), 'DB window bridge missing');
assert.ok(dropsJs.includes("Object.defineProperty(window, 'player'"), 'live player window bridge missing');
assert.ok(dropsJs.includes("Object.defineProperty(window, 'mapState'"), 'live mapState window bridge missing');
assert.ok(tabsJs.includes('let ed = DB.items[e.id] || {}'), 'legacy set-item guard missing');
assert.ok(tabsJs.includes('if (eq && !eqDef) eq = null'), 'legacy equipped-item guard missing');
['法師','王族','騎士','妖精','黑妖','龍騎','幻術','戰士'].forEach(label => {
  assert.ok(tabsJs.includes("'" + label + "'"), `missing Omni profession skill tab: ${label}`);
});
assert.ok(tabsJs.includes('classicSkillChooseClass'), 'Omni profession skill pager missing');
assert.ok(tabsJs.includes('playerHasOmniSkillAccess'), 'Omni Lv1 skill availability override missing');
assert.ok(polyJs.includes('keepClassAppearance:true'), 'Arkata must keep native Princess animation set');
assert.ok(polyJs.includes('noCastMotion:true'), 'Creator form must cast without motion');
assert.ok(polyJs.includes("n:'創世神型態'"), 'Creator form name missing');
[launcherHtml, gameHtml].forEach(html => {
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) new Function(match[1]);
});

function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { filename: file });
}

load('js/genesis/genesis-config.js');
load('js/genesis/genesis-class.js');
load('js/genesis/genesis-items.js');

global.player = {
  cls: 'royal', skills: [], inv: [{ id: 'retired_custom_item', cnt: 1 }],
  eq: { wpn: { id: 'retired_custom_weapon', uid: 'old' } }
};

assert.strictEqual(Genesis.classSystem.markPlayer(), true);
assert.strictEqual(player.genesisBaseClass, 'royal');
Genesis.classSystem.grantAllSkills();
assert.ok(player.skills.includes('sk_test'));
assert.strictEqual(Genesis.items.migrateLegacy(), true);
assert.strictEqual(Object.keys(Genesis.items.definitions).length, 27);
assert.strictEqual(Genesis.items.loadout.length, 27);
assert.strictEqual(player.eq.special.id, 'spc_genesis_origin');
assert.strictEqual(player.eq.wpn.id, 'wpn_genesis_omni_sword');
assert.strictEqual(player.eq.wpn.en, 15);
assert.strictEqual(player.eq.wpn.attr, 'all');
Object.values(Genesis.items.definitions).forEach(def => {
  assert.ok(def.n && !def.n.includes('?'), `invalid genesis item name: ${def.n}`);
  assert.ok(def.img && fs.existsSync(path.join(__dirname, '..', def.img)), `missing genesis icon: ${def.img}`);
});

load('js/genesis/genesis-poly.js');
assert.strictEqual(Genesis.poly.form.n, '創世神型態');
assert.strictEqual(Genesis.poly.form.keepClassAppearance, true);
assert.strictEqual(Genesis.poly.form.noCastMotion, true);
assert.strictEqual(player.eq.wpn.anc, 'unity');
assert.strictEqual(player.eq.wpn.bless, true);
assert.ok(Object.values(player.eq).filter(Boolean).every(x => x.lock === true));
assert.ok(player.inv.every(x => DB.items[x.id]));
assert.ok(player.genesisLegacyArchive.some(x => x.item.id === 'retired_custom_item'));
assert.ok(player.genesisLegacyArchive.some(x => x.item.id === 'retired_custom_weapon'));

const fields = {
  wpn_genesis_omni_sword: { dmgBonus:80, hit:100, mcrit:20, mcritDmg:100, extraDmg:40, genesisOmniElement:true },
  hlm_genesis_omni: { int:8, wis:8, cha:6, magicHit:40, mdmg:30, mmp:500, mpR:15, mr:50, immSilence:true },
  glv_genesis_omni: { str:6, dex:6, int:6, meleeDmg:30, rangedDmg:30, mdmg:30, meleeHit:40, rangedHit:40, magicHit:40, genesisAllCrit:10 },
  amu_genesis_omni_core: { str:8, dex:8, con:8, int:8, wis:8, cha:8, mhp:500, mmp:500, dr:20, mr:50, genesisMpReduce:15 },
  shd_genesis_omni: { ac:30, dr:35, mr:60, genesisMeleeDr:20, genesisRangedDr:20, genesisMagicDr:20 },
  amr_genesis_omni: { str:8, con:10, mhp:1500, mmp:500, ac:40, dr:40, mr:50, genesisDamageCapPct:35 },
  rng_genesis_control: { cha:8, wis:6, int:4, mmp:400, mpR:20, summonDmgPct:20, summonHpPct:20, genesisControl:true },
  bot_genesis_temporal: { dex:8, con:6, ac:20, er:40, atkSpdPct:20, moveSpeedPct:25, slowImmune:true },
  doll_genesis_core: { str:4, dex:4, int:4, wis:4, meleeDmg:15, mdmg:15, hpR:15, mpR:15, goldBonus:20, dropBonus:20 },
  spc_genesis_origin: { str:5, dex:5, con:5, int:5, wis:5, cha:5, mhp:300, mmp:300, genesisSetCore:true }
};
Object.entries(fields).forEach(([id, checks]) => Object.entries(checks).forEach(([key, value]) => {
  assert.strictEqual(DB.items[id][key], value, `${id}.${key}`);
}));

const expected = {
  wpn_genesis_omni_sword: 15, hlm_genesis_omni: 15, ear_genesis_star_l: 5,
  ear_genesis_star_r: 5, glv_genesis_omni: 15, amu_genesis_omni_core: 5,
  shd_genesis_omni: 15, amr_genesis_omni: 15, rng_genesis_life: 5,
  tsh_genesis_omni: 15, clk_genesis_astral: 15, rng_genesis_control: 5,
  rng_genesis_void: 5, blt_genesis_order: 5, bot_genesis_temporal: 15,
  rng_genesis_chaos: 5, doll_genesis_core: 0, shin_genesis_immortal: 15,
  spc_genesis_origin: 5
};
Object.entries(expected).forEach(([id, enhance]) => {
  assert.ok(DB.items[id], `missing definition: ${id}`);
  assert.ok(fs.existsSync(path.join(__dirname, '..', DB.items[id].img)), `missing icon: ${id}`);
  const equipped = Object.values(player.eq).find(x => x && x.id === id);
  assert.ok(equipped, `not equipped: ${id}`);
  assert.strictEqual(equipped.en, enhance, `wrong enhance: ${id}`);
});

// Runtime repair must recover an already-loaded character whose equipment/skill UI data is empty.
player.eq = {};
player.skills = [];
player.genesisRuntimeVersion = null;
assert.strictEqual(Genesis.classSystem.reconcilePlayer(true, false), true);
assert.strictEqual(Object.values(player.eq).filter(Boolean).length, 27);
assert.ok(player.skills.includes('sk_test'));
assert.strictEqual(player.genesisRuntimeVersion, Genesis.config.version);

console.log('Genesis smoke test passed: 27 definitions, two equipment pages, skills, affixes.');
