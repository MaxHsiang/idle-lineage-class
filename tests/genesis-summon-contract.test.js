const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', '23-summons.js'), 'utf8');
let nextUid = 1;
const player = {
  cls: 'omni',
  genesisOmni: true,
  lv: 80,
  hp: 10000,
  mhp: 10000,
  mp: 10000,
  d: { cha: 100, magicDmg: 100 },
  eq: {},
  skills: ['sk_channel_spirit', 'sk_zombie'],
  grantedSkills: [],
  buffs: {},
  summonsV2: []
};
const context = vm.createContext({
  console,
  Date,
  Math,
  Object,
  Number,
  Infinity,
  player,
  DB: {
    skills: {
      sk_channel_spirit: { dur: 3600 },
      sk_zombie: { dur: 3600 }
    },
    items: {}
  },
  state: { ticks: 0 },
  mapState: { current: 'field', mobs: [] },
  uid: () => `test-${nextUid++}`,
  setInterval: () => 0,
  logCombat: () => {},
  logSys: () => {},
  renderSquadPanel: () => {},
  getMobColor: () => '',
  hasSummonCtrlRing: () => false,
  entityHasMastery: () => false,
  _petInWild: () => true
});

vm.runInContext(source, context, { filename: '23-summons.js' });
const result = vm.runInContext(`(() => {
  const first = summonV2CastFor('sk_channel_spirit', true);
  const spiritAfterFirst = summonV2List().filter(s => s.skId === 'sk_channel_spirit');
  const second = summonV2CastFor('sk_channel_spirit', true);
  const spiritAfterSecond = summonV2List().filter(s => s.skId === 'sk_channel_spirit');
  const corpseMode = summonV2CastFor('sk_zombie', true);
  const beforeKills = summonV2List().filter(s => s.skId === 'sk_zombie').length;
  zombieCorpseOnKill({ n: '測試怪物一', lv: 1, race: '動物' });
  zombieCorpseOnKill({ n: '測試怪物二', lv: 1, race: '不死' });
  zombieCorpseOnKill({ n: '測試怪物三', lv: 1, race: '惡魔' });
  const skeletons = summonV2List().filter(s => s.skId === 'sk_zombie');
  summonV2Dismiss('sk_channel_spirit', true);
  const skeletonsAfterSpiritOff = summonV2List().filter(s => s.skId === 'sk_zombie').length;
  summonV2Dismiss('sk_zombie', true);
  return {
    first, second, corpseMode, beforeKills,
    spiritFirstCount: spiritAfterFirst.length,
    spiritSecondCount: spiritAfterSecond.length,
    spiritScale: spiritAfterSecond[0] && spiritAfterSecond[0].spriteScale,
    skeletonCount: skeletons.length,
    skeletonScales: skeletons.map(s => s.spriteScale),
    skeletonsAfterSpiritOff,
    finalCount: summonV2List().length
  };
})()`, context);

assert.strictEqual(result.first, true);
assert.strictEqual(result.second, true);
assert.strictEqual(result.corpseMode, true);
assert.strictEqual(result.spiritFirstCount, 1);
assert.strictEqual(result.spiritSecondCount, 1, '通靈之術重施後仍只能有一隻');
assert.strictEqual(result.spiritScale, 0.25);
assert.strictEqual(result.beforeKills, 0, '造屍術本身不應憑空召出巨大骷髏');
assert.strictEqual(result.skeletonCount, 2, '三具屍體仍只能留下兩隻巨大骷髏');
assert.deepStrictEqual(Array.from(result.skeletonScales), [0.25, 0.25]);
assert.strictEqual(result.skeletonsAfterSpiritOff, 2, '關閉通靈之術不可移除造屍術召喚物');
assert.strictEqual(result.finalCount, 0, '關閉造屍術應立即移除巨大骷髏');

console.log('genesis summon contracts: ok');
