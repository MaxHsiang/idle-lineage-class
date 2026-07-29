const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const data = read('js', '00-data.js');
const expCode = data.slice(data.indexOf('const EXP_T'), data.indexOf('const DB ='));
const exp = {};
vm.createContext(exp);
vm.runInContext(`${expCode}\nthis.getExpReq=getExpReq;this.getExpGainMult=getExpGainMult;`, exp);
assert.ok(Number.isFinite(exp.getExpReq(100)), 'Lv100 must have a finite next-level requirement');
assert.ok(exp.getExpReq(250) > exp.getExpReq(100), 'requirements must keep growing above Lv100');
assert.strictEqual(exp.getExpGainMult(9999), 1, 'high levels must keep earning full EXP');

const drops = read('js', '01-drops-config.js');
const statCode = drops.slice(drops.indexOf('function lookupStep'), drops.indexOf('let _combatLogLocked'));
const stats = {};
vm.createContext(stats);
vm.runInContext(`${statCode}\nthis.api={getStrMeleeDmg,getDexRangedHit,getDexER,getIntMagicDmg,getIntExtraMp,getConGrowth,getWisMR};`, stats);
assert.ok(stats.api.getStrMeleeDmg(200) > stats.api.getStrMeleeDmg(100), 'STR effects must grow beyond 100');
assert.ok(stats.api.getDexRangedHit(200) > stats.api.getDexRangedHit(100), 'DEX effects must grow beyond 100');
assert.ok(stats.api.getDexER(200) > stats.api.getDexER(100), 'DEX ER must be uncapped');
assert.ok(stats.api.getIntMagicDmg(200) > stats.api.getIntMagicDmg(100), 'INT effects must grow beyond 100');
assert.ok(stats.api.getIntExtraMp(200) > stats.api.getIntExtraMp(100), 'INT SP must grow beyond 100');
assert.ok(stats.api.getConGrowth(200, 'omni') > stats.api.getConGrowth(100, 'omni'), 'CON growth must be uncapped');
assert.ok(stats.api.getWisMR(200) > stats.api.getWisMR(100), 'WIS MR must be uncapped');

const recompute = read('js', '02-stats-recompute.js');
const progression = read('js', '05-kill-progression.js');
const save = read('js', '13-shop-save.js');
const skills = read('js', '07-skills-cast.js');
assert.ok(!recompute.includes('_ATTR_CAP'), 'final attributes must not be clamped');
assert.ok(!progression.includes('while(player.lv < 100'), 'level-up loop must not stop at 100');
assert.ok(!save.includes('let capN = 60'), 'manual stat allocation must not stop at 60');
assert.ok(!skills.includes('Math.min(60'), 'CHA summon effects must not stop at 60');

const itemContext = { window: { Genesis: {} }, Math };
vm.createContext(itemContext);
vm.runInContext(read('js', 'genesis', 'genesis-items.js'), itemContext);
const genesisItems = itemContext.window.Genesis.items;
assert.strictEqual(genesisItems.loadout.length, 38, 'both equipment pages must contain 19 equipped slots');
assert.strictEqual(genesisItems.loadout.slice(19).length, 19, 'second equipment page must be full');
genesisItems.loadout.slice(19).forEach(([, id]) => {
  const def = genesisItems.definitions[id];
  assert.ok(def, `missing second-page definition: ${id}`);
  assert.ok(def.img && fs.existsSync(path.join(root, def.img)), `missing second-page icon: ${id}`);
});
const themed = Object.values(genesisItems.definitions).filter(def => def.ziweiCore);
assert.strictEqual(themed.length, 19, 'all second-page pieces must be Zi Wei Dou Shu cores');
assert.strictEqual(themed.filter(def => def.ziweiSystem === '北斗主星').length, 6, 'six Northern Dipper cores required');
assert.strictEqual(themed.filter(def => def.ziweiSystem === '南斗主星').length, 8, 'eight Southern Dipper cores required');
assert.strictEqual(themed.filter(def => def.ziweiSystem === '五方神獸').length, 5, 'five guardian beast cores required');
['紫微','大將軍武曲','破軍','天機','貪狼','巨門','天府','天相','天梁','天同','七殺','廉貞','太陽','太陰','青龍','白虎','朱雀','玄武','麒麟']
  .forEach(name => assert.ok(themed.some(def => def.ziweiCore === name), `missing themed core: ${name}`));

console.log('unbounded progression and full Genesis page 2: OK');
