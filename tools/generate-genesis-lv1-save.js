const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SOURCE = 'C:/Users/max74/Downloads/全能師_Lv1_創世套裝_v152.json';
const OUTPUT = path.resolve(__dirname, '..', '全能師_Lv1_創世套裝_v164.json');
const SAVE_SALT = 'fb5#9c3a7e1d-save-integrity-salt-do-not-edit#a1b2c3';

function unwrap(raw) {
  if (!raw.startsWith('SIG1:')) return raw;
  const separator = raw.indexOf(':', 5);
  if (separator < 0) throw new Error('來源存檔簽章格式錯誤');
  return raw.slice(separator + 1);
}

function seedHash(value) {
  const str = String(value);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

function sign(payload) {
  const a = seedHash(`${SAVE_SALT}::${payload}`);
  const b = seedHash(`${payload}::${SAVE_SALT}::${a}`);
  return `${(a >>> 0).toString(36)}.${(b >>> 0).toString(36)}.${payload.length.toString(36)}`;
}

function uid(label) {
  return `genesis-${label}-${crypto.randomBytes(5).toString('hex')}`;
}

function item(id, slot, enhance, attr = false) {
  return {
    id,
    uid: uid(slot),
    cnt: 1,
    en: enhance,
    bless: true,
    anc: 'unity',
    attr,
    lock: true,
    junk: false,
  };
}

const raw = fs.readFileSync(SOURCE, 'utf8').replace(/^\uFEFF/, '');
const source = JSON.parse(unwrap(raw));
const p = source.p;

// 保留現版本全能師的完整技能、專精與設定欄位，只重建角色進度及裝備。
p.cls = 'omni';
p.name = '創世全能師';
p.lv = 1;
p.exp = 0;
p.gold = 1000;
p.hp = 999999;
p.mhp = 999999;
p.mp = 999999;
p.mmp = 999999;
p.base = { str: 18, dex: 18, con: 18, int: 18, wis: 18, cha: 18 };
p.bonus = 0;
p.alloc = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
p.panacea = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
p.panaceaUsed = 0;
p.avatar = '公主';
p.poly = null;
p.dead = false;
p.allies = [];
p.summon = null;
p.charmed = [];
p.partners = [];
p.summonsV2 = [];
p.statuses = {};
p.hots = {};
p.hot = {};
p.cds = {};
p.manualCd = {};
p.buffs = {};
p.tracking = null;
p.siege = {
  active: false,
  gateKilled: false,
  towerKilled: false,
  endTime: 0,
  kills: 0,
  result: null,
  cooldownUntil: 0,
  rewardPending: false,
  victoryUntil: 0,
  accCdUntil: 0,
  city: 'kent',
  victoryCity: null,
};
p.enSeed = crypto.randomBytes(12).toString('hex');
p._roleEpoch = Date.now();
p.lootSeq = 0;
p.genesisClass = true;
p.genesisOmni = true;
p.className = '創世全能師';
p.genesisBaseClass = 'omni';
p.genesisLoadoutVersion = 'v1.6.4-dev';
p.genesisRuntimeVersion = 'v1.6.4-dev';
p.genesisSkillsVersion = 'v1.6.4-dev';
p.skills = Array.isArray(p.skills) ? p.skills.filter((id) => !String(id).startsWith('sk_helm_')) : [];
if (!p.skills.includes('sk_genesis_omni_awakening')) p.skills.push('sk_genesis_omni_awakening');
p.grantedSkills = Array.isArray(p.grantedSkills) ? p.grantedSkills.filter((id) => !String(id).startsWith('sk_helm_')) : [];

p.eq = {
  wpn: item('wpn_genesis_omni_sword', 'wpn', 15, 'all'),
  arrow: null,
  helm: item('hlm_genesis_omni', 'helm', 15),
  armor: item('amr_genesis_omni', 'armor', 15),
  shin: item('shin_genesis_immortal', 'shin', 15),
  shield: item('shd_genesis_omni', 'shield', 15),
  cloak: item('clk_genesis_astral', 'cloak', 15),
  tshirt: item('tsh_genesis_omni', 'tshirt', 15),
  gloves: item('glv_genesis_omni', 'gloves', 15),
  boots: item('bot_genesis_temporal', 'boots', 15),
  ring1: item('rng_genesis_life', 'ring1', 5),
  ring2: item('rng_genesis_control', 'ring2', 5),
  ring3: item('rng_genesis_void', 'ring3', 5),
  ring4: item('rng_genesis_chaos', 'ring4', 5),
  amulet: item('amu_genesis_omni_core', 'amulet', 5),
  ear1: item('ear_genesis_star_l', 'ear1', 5),
  ear2: item('ear_genesis_star_r', 'ear2', 5),
  belt: item('blt_genesis_order', 'belt', 5),
  pet: null,
  doll: item('doll_genesis_core', 'doll', 0),
  special: item('spc_genesis_origin', 'special', 5),
  rem_eye: item('rem_genesis_eye', 'rem_eye', 5, 'all'),
  rem_blood: item('rem_genesis_blood', 'rem_blood', 5, 'all'),
  rem_scale: item('rem_genesis_scale', 'rem_scale', 5, 'all'),
  rem_bone: item('rem_genesis_bone', 'rem_bone', 5, 'all'),
  rem_fang: item('rem_genesis_fang', 'rem_fang', 5, 'all'),
  rem_heart: item('rem_genesis_heart', 'rem_heart', 5, 'all'),
  rem_flesh: item('rem_genesis_flesh', 'rem_flesh', 5, 'all'),
  rem_claw: item('rem_genesis_claw', 'rem_claw', 5, 'all'),
};

// 阿卡塔變身需要變身卷軸；另外附上基本恢復藥水。
p.inv = [
  { id: 'item_genesis_perfect_pass', uid: uid('perfect-pass'), cnt: 1, en: 0, bless: true, anc: 'unity', attr: false, lock: true, junk: false },
  { id: 'scroll_poly', uid: uid('scroll-poly'), cnt: 100, en: 0, bless: false, anc: false, attr: false, lock: true, junk: false },
  { id: 'potion_heal', uid: uid('potion-heal'), cnt: 100, en: 0, bless: false, anc: false, attr: false, lock: false, junk: false },
];

const miniDragons = [
  ['\u8ff7\u4f60\u5b89\u5854\u745e\u65af', '\u5b89\u5854\u745e\u65af'],
  ['\u8ff7\u4f60\u6cd5\u5229\u6602', '\u6cd5\u5229\u6602'],
  ['\u8ff7\u4f60\u6797\u5fb7\u62dc\u723e', '\u6797\u5fb7\u62dc\u723e'],
  ['\u8ff7\u4f60\u5df4\u62c9\u5361\u65af', '\u5df4\u62c9\u5361\u65af'],
];
p.genesisMiniDragons = miniDragons.map(([form, gfx], index) => ({
  uid: uid(`mini-dragon-${index + 1}`), form, formGfx: gfx, name: form,
  lv: 1, exp: 0, expReqV: 1, mhp: 1200, mmp: 600, hp: 1200, mp: 600,
  outOwner: `char:${p.enSeed}`, outSlot: '0', outV: Date.now() + index,
  eqV: Date.now() + index, potPct: 0, locked: true, genesisMiniDragon: true,
  skillMode: 'auto',
  eq: {
    wpn: item('petwpn_genesis_dragon_fang', `petwpn-${index + 1}`, 15, 'all'),
    arm: item('petarm_genesis_dragon_armor', `petarm-${index + 1}`, 15, 'all'),
  },
}));

const save = {
  v: 2,
  p,
  ms: {
    current: 'town_silver_knight',
    mobs: [null, null, null, null, null],
    targetIdx: 0,
    forceBoss: false,
    spawnAt: [0, 0, 0, 0, 0],
    suppressSiegeBoss: true,
  },
  ticks: 0,
};

const payload = JSON.stringify(save);
const wrapped = `SIG1:${sign(payload)}:${payload}`;
fs.writeFileSync(OUTPUT, wrapped, 'utf8');

const genesisIds = Object.values(p.eq).filter(Boolean).filter((entry) => entry.id.includes('genesis_'));
if (p.lv !== 1 || p.cls !== 'omni' || genesisIds.length !== 27 || !Array.isArray(p.skills) || p.skills.length < 1) {
  throw new Error(`輸出驗證失敗：Lv=${p.lv}, cls=${p.cls}, 創世裝備=${genesisIds.length}, 技能=${p.skills && p.skills.length}`);
}

console.log(JSON.stringify({
  output: OUTPUT,
  bytes: Buffer.byteLength(wrapped, 'utf8'),
  name: p.name,
  level: p.lv,
  class: p.cls,
  genesisEquipment: genesisIds.length,
  skills: p.skills.length,
  inventory: p.inv.map((entry) => `${entry.id} x${entry.cnt}`),
  signed: wrapped.startsWith('SIG1:'),
}, null, 2));
