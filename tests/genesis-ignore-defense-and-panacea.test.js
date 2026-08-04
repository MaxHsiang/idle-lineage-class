const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

// The Genesis sword advertises every engine capability used by the combat paths.
const itemContext = { window: { Genesis: {} }, Math };
vm.createContext(itemContext);
vm.runInContext(read('js', 'genesis', 'genesis-items.js'), itemContext);
const sword = itemContext.window.Genesis.items.definitions.wpn_genesis_omni_sword;
assert.strictEqual(sword.genesisIgnoreDefense, true);
assert.strictEqual(sword.genesisIgnoreRestrictions, true);
assert.strictEqual(sword.spellIgnoreMr, true);
assert.strictEqual(sword.ignHardSkin, true);

// The outgoing wrapper must scope bypass rules to the main player's own attack/cast.
const combatContext = {
  console,
  Math,
  setInterval: () => 1,
  player: { dead: false },
  mapState: { mobs: [] },
  DB: { skills: {} },
  playerAttack() {
    combatContext.attackSawBypass = combatContext.window.Genesis.combat.weaponRulesActive();
    return 'attack';
  },
  castSkillInner() {
    combatContext.castSawBypass = combatContext.window.Genesis.combat.weaponRulesActive();
    return true;
  }
};
combatContext.window = combatContext;
combatContext.Genesis = {
  classSystem: { isGenesisPlayer: () => true },
  stats: { has: id => id === 'wpn_genesis_omni_sword' }
};
combatContext.window.Genesis = combatContext.Genesis;
vm.createContext(combatContext);
vm.runInContext(read('js', 'genesis', 'genesis-combat.js'), combatContext);
combatContext.playerAttack();
combatContext.castSkillInner('none');
assert.strictEqual(combatContext.attackSawBypass, true, 'physical attack must activate sword bypass rules');
assert.strictEqual(combatContext.castSawBypass, true, 'skill cast must activate sword bypass rules');
assert.strictEqual(combatContext.Genesis.combat.weaponRulesActive(), false, 'bypass scope must close after the attack');

// Giant Skeleton-style melee/ranged/magic immunity must be skipped only while the rule is active.
const attack = read('js', '04-combat-attack.js');
const reflectCode = attack.slice(attack.indexOf('function reflectWallOnDamage'), attack.indexOf('// 🛡️ v3.3.33', attack.indexOf('function reflectWallOnDamage')));
const reflectContext = {
  window: { Genesis: { combat: { weaponRulesActive: () => true } } },
  Genesis: null,
  state: { ticks: 10 },
  player: { dead: false },
  Math,
  Date,
  trollCounterBarrierOnDamage() {},
  logCombat() {},
  getMobColor() { return ''; }
};
reflectContext.Genesis = reflectContext.window.Genesis;
vm.createContext(reflectContext);
vm.runInContext(`${reflectCode}\nthis.reflectWallOnDamage=reflectWallOnDamage;`, reflectContext);
const immuneMob = { hp: 100, curHp: 40, _reflectWall: { until: 20, kind: 'melee', block: true } };
reflectContext.reflectWallOnDamage(immuneMob, 30, 'melee', null);
assert.strictEqual(immuneMob.curHp, 40, 'Genesis sword must not restore blocked melee damage');
reflectContext.window.Genesis.combat.weaponRulesActive = () => false;
reflectContext.reflectWallOnDamage(immuneMob, 30, 'melee', null);
assert.strictEqual(immuneMob.curHp, 70, 'ordinary attacks must retain the monster immunity');

// Panacea paths must be limited only by owned quantity, never by 60-use/stat caps.
const items = read('js', '08-items-equip.js');
const batchBlock = items.slice(items.indexOf("if (d.eff === 'panacea')"), items.indexOf("if (d.eff !== 'expsoul')"));
const singleStart = items.indexOf("} else if (d.eff === 'panacea')");
const singleBlock = items.slice(singleStart, items.indexOf("} else if (d.eff === 'reset')", singleStart));
assert.ok(batchBlock.includes('let maxN = item.cnt;'), 'batch panacea use must allow the full stack');
assert.ok(!batchBlock.includes('remainQuota') && !batchBlock.includes('remainStat'), 'batch panacea caps must be removed');
assert.ok(!singleBlock.includes('>= 60') && !singleBlock.includes('naturalStat(st) >='), 'single panacea caps must be removed');

const physicalCore = read('js', '03-combat-core.js');
const attackCore = read('js', '04-combat-attack.js');
const skillCore = read('js', '07-skills-cast.js');
assert.ok(physicalCore.includes('forceLand || _ignoreDefense'), 'Genesis weapon must bypass the normal AC hit roll');
assert.ok(physicalCore.includes('_ignoreDefense ? 0'), 'Genesis weapon must bypass physical damage reductions');
assert.ok(attackCore.includes('genesisIgnoreDefense) && target.er'), 'Genesis weapon must bypass ER evasion');
assert.ok(skillCore.includes('let _ignoreDef = !!(wpn && wpn.genesisIgnoreDefense);'), 'weapon-based physical skills must bypass defense');

console.log('Genesis ignore-defense/restriction and unlimited panacea: OK');
