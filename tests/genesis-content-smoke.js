const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

global.window = global;
global.DB = {
  items:{}, skills:{}, maps:{},
  mobs:{
    boss_alpha:{n:'測試頭目',boss:true,hp:100,ac:-20,mr:10,dr:2,hit:30,dmg:[2,5],db:4,mag:{dmg:[1,8],db:3}},
    siege_tower:{n:'建築',boss:true,race:'建築',hp:999,dmg:[1,1],db:0}
  }
};
global.PET_BOOK = {};
global.EQUIP_ITEM_CAT = { sword:'wpn' };
global.MISC_ITEM_CAT = { potion:'misc' };
global.RELIC_ITEM_CAT = { relic:'relic' };
global.CARD_MOB_INFO = { dragon:{} };
global.currentSlot = 1;
global.player = { cls:'omni', genesisOmni:true, lv:1, skills:['sk_genesis_omni_awakening'], config:{autoBuffSkills:{sk_genesis_omni_awakening:true}}, inv:[], equipDex:{}, miscDex:{}, relicDex:{}, cardDex:{}, enSeed:'test-seed' };
global.MASTERY_DATA = { knight:{list:{k_counter:{},k_cleave:{}}}, mage:{list:{m_strike:{},m_echo:{}}} };
global.hasMastery = () => false;
global.entityHasMastery = () => false;
global.Genesis = { config:{version:'v1.6.15-dev'}, classSystem:{isGenesisPlayer:()=>true} };
let roster = [];
global.petRoster = () => roster;
global.petNewInstance = (form,lv) => ({uid:'pet-'+form,form,lv,mhp:100,mmp:50,hp:100,mp:50});
global._petCurrentOwnerKey = () => 'char:test-seed';
global.petMarkDirty = () => {};
global.petRosterSave = () => true;
global.mapOptDisabled = () => true;

const file = path.join(__dirname,'..','js','genesis','genesis-content.js');
vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});
assert.strictEqual(Genesis.content.install(),true);
assert.ok(DB.items.item_genesis_perfect_pass);
assert.ok(DB.skills.sk_genesis_omni_awakening.genesisAllMasteries);
assert.strictEqual(DB.skills.sk_genesis_omni_awakening.img, 'assets/icons/genesis/omni-awakening.png');
assert.ok(DB.skills.sk_genesis_omni_summon.summon);
assert.strictEqual(DB.skills.sk_genesis_omni_summon.img, 'assets/anim/死亡騎士/idle_0.png');
assert.deepStrictEqual(DB.maps.genesis_ultimate,['genesis_ultimate_boss_alpha']);
assert.strictEqual(DB.mobs.genesis_ultimate_boss_alpha.hp,10000);
assert.deepStrictEqual(DB.mobs.genesis_ultimate_boss_alpha.dmg,[200,500]);
assert.deepStrictEqual(DB.mobs.genesis_ultimate_boss_alpha.mag.dmg,[100,800]);
assert.strictEqual(DB.mobs.genesis_ultimate_boss_alpha.genesisUltimate,true);
assert.ok(!DB.mobs.genesis_ultimate_siege_tower);
assert.strictEqual(hasMastery('k_counter'),true);
assert.strictEqual(hasMastery('m_echo'),true);
assert.strictEqual(entityHasMastery(player,'m_strike'),true);
assert.strictEqual(genesisOmniAwakeningActive(player),true);
assert.deepStrictEqual(genesisOmniMasteryIds().sort(),['k_cleave','k_counter','m_echo','m_strike']);
assert.ok(player.inv.some(i=>i.id==='item_genesis_perfect_pass'));
assert.strictEqual(mapOptDisabled({disabled:true}),false);
assert.strictEqual(roster.length,4);
assert.strictEqual(player.genesisMiniDragons.length,4);
assert.ok(player.genesisMiniDragons.every(p=>p.genesisMiniDragon));
assert.ok(roster.every(p=>p.outOwner==='char:test-seed'));
assert.ok(roster.every(p=>p.eq.wpn.id==='petwpn_genesis_dragon_fang'));
assert.ok(roster.every(p=>p.eq.arm.id==='petarm_genesis_dragon_armor'));
assert.ok(roster.every(p=>PET_BOOK[p.form].cha===0));
assert.strictEqual(player.equipDex.sword,true);
assert.strictEqual(player.miscDex.potion,true);
assert.strictEqual(player.relicDex.relic,true);
assert.strictEqual(player.cardDex.dragon,100);
console.log('Genesis content smoke test passed: Ultimate Land, Omni summon, pass, collections, awakening and four deployed mini dragons.');
