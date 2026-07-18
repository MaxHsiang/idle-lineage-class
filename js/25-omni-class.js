// ===== ✨ Codex MOD：全能師 =====
const OMNI_CLASS_ID = 'omni';
const OMNI_AWAKEN_SKILL_ID = 'sk_omni_awaken';
const OMNI_AWAKEN_TICKS = 864000; // 24 小時；可隨時重施刷新
const OMNI_MINI_DRAGON_FORMS = ['迷你安塔瑞斯', '迷你法利昂', '迷你林德拜爾', '迷你巴拉卡斯'];
[['迷你安塔瑞斯',0.20],['迷你法利昂',0.20],['迷你林德拜爾',0.18],['迷你巴拉卡斯',0.19]].forEach(x => {
    if (PET_BOOK[x[0]]) PET_BOOK[x[0]].gfxScale = x[1];
});
const OMNI_PET_GEAR_KEEP = ['pet_four_dragon_fang', 'pet_four_dragon_armor'];
const OMNI_REMOVED_PET_GEAR_IDS = Object.keys(DB.items).filter(id => {
    let d = DB.items[id]; return d && (d.slot === 'petwpn' || d.slot === 'petarm') && !OMNI_PET_GEAR_KEEP.includes(id);
});
OMNI_REMOVED_PET_GEAR_IDS.forEach(id => { delete DB.items[id]; });
if (typeof CRAFT_RECIPES !== 'undefined') Object.keys(CRAFT_RECIPES).forEach(npc => {
    if (Array.isArray(CRAFT_RECIPES[npc])) CRAFT_RECIPES[npc] = CRAFT_RECIPES[npc].filter(r => r && !OMNI_REMOVED_PET_GEAR_IDS.includes(r.result));
});
if (typeof MOB_DROPS !== 'undefined') Object.keys(MOB_DROPS).forEach(mob => {
    if (Array.isArray(MOB_DROPS[mob])) MOB_DROPS[mob] = MOB_DROPS[mob].filter(drop => !drop || !OMNI_REMOVED_PET_GEAR_IDS.includes(drop[0]));
});

DB.skills[OMNI_AWAKEN_SKILL_ID] = {
    n: '全能覺醒', type: 'buff', tier: 1, mp: 0, dur: OMNI_AWAKEN_TICKS,
    reqM: 1, reqK: 1, reqE: 1, reqD: 1, reqI: 1, reqDk: 1, reqW: 1, reqRoy: 1,
    noRefresh: false,
    msg: '公主喚醒全能力量，四重神光簇擁著死亡騎士之姿。攻擊與施法速度提升至超高速。'
};

function omniAllSkills() {
    return Object.keys(DB.skills).filter(id => id !== 'sk_fireball_burst' && !DB.skills[id].procOnly);
}

function omniAllMasteries() {
    return Object.values(MASTERY_DATA || {}).flatMap(group => Object.keys(group.list || {}));
}

function omniGrantAllMasteries() {
    if (!player || player.cls !== OMNI_CLASS_ID) return;
    player.mastery = 'omni_all';
    player.masteryQuest = 'done';
    player.omniMasteries = omniAllMasteries();
}

// 全能師共鳴：本人出戰寵物與玩家召喚實體，動態繼承主角目前最終能力的 5%，並同步有效 BUFF。
// 不改寫寵物永久基礎值；換裝、能力與 BUFF 改變後，下次攻防計算立即套用新數值。
function omniCompanionOwned(entity) {
    if (!player || player.cls !== OMNI_CLASS_ID || !entity) return false;
    try { if (typeof petsOutList === 'function' && petsOutList().includes(entity)) return true; } catch (e) {}
    try { if (typeof summonV2List === 'function' && summonV2List().includes(entity)) return true; } catch (e) {}
    return false;
}

function omniCompanionEcho(entity) {
    if (!omniCompanionOwned(entity)) return null;
    let d = player.d || {};
    let active = {};
    Object.keys(player.buffs || {}).forEach(k => { if ((player.buffs[k] || 0) > 0) active[k] = player.buffs[k]; });
    entity.omniSharedBuffs = active;
    entity._omniEcho = 0.05;
    const sum = keys => keys.reduce((n, k) => n + Math.max(0, Number(d[k]) || 0), 0);
    return {
        physical: Math.floor(sum(['str','dex','dmgBonus','extraDmg','meleeDmg','rangedDmg']) * 0.05),
        magic: Math.floor(sum(['int','wis','sp','magicDmg','mdmg']) * 0.05),
        hit: Math.floor(sum(['dex','hit','meleeHit','rangedHit','magicHit']) * 0.05),
        defense: Math.floor((Math.abs(Number(d.ac) || 0) + sum(['con','dr'])) * 0.05),
        er: Math.floor(sum(['dex','er']) * 0.05),
        mr: Math.floor(sum(['wis','mr']) * 0.05),
        haste: !!((player.buffs && player.buffs.haste > 0) || player._equipHaste)
    };
}

const _omniBasePetDerive = petDerive;
petDerive = function(p) {
    let out = _omniBasePetDerive.apply(this, arguments);
    let echo = out && omniCompanionEcho(p);
    if (!echo) return out;
    out = Object.assign({}, out);
    out.flat += echo.physical; out.skillFlat += echo.magic; out.hit += echo.hit;
    out.ac -= echo.defense; out.dr += echo.defense; out.er += echo.er; out.mr += echo.mr;
    if (echo.haste) { out.atkItv = Math.max(2, Math.floor(out.atkItv * 0.7)); if (out.castItv > 0) out.castItv = Math.max(3, Math.floor(out.castItv * 0.7)); }
    return out;
};

const _omniBaseSummonDeriveAny = _sumDeriveAny;
_sumDeriveAny = function(s) {
    let out = _omniBaseSummonDeriveAny.apply(this, arguments);
    let echo = out && omniCompanionEcho(s);
    if (!echo) return out;
    out = Object.assign({}, out);
    out.flat = (out.flat || 0) + echo.physical;
    out.dice = Math.max(1, (out.dice || 1) + echo.magic);
    out.hit = (out.hit || 0) + echo.hit; out.ac = (out.ac || 10) - echo.defense;
    out.dr = (out.dr || 0) + echo.defense; out.er = (out.er || 0) + echo.er; out.mr = (out.mr || 0) + echo.mr;
    if (echo.haste) out.aspd = Math.max(2, Math.floor((out.aspd || 10) * 0.7));
    return out;
};

function omniMakeItem(id, slot) {
    let d = DB.items[id];
    return {
        id: id, uid: uid(), cnt: 1,
        en: d && d.noEnhance ? 0 : 15,
        bless: true, anc: 'unity',
        attr: 'all',
        seteff: false, lock: false, junk: false
    };
}

function omniItemScore(d) {
    if (!d) return -Infinity;
    let s = d.legend ? 5000 : (d.relic ? 1800 : 0);
    ['ac','str','dex','con','int','wis','cha','hp','mp','hpR','mpR','mr','er','dr','hit','dmgBonus','mdmg','extraDmg','extraMp','magicDmg','magicHit','magicCrit','meleeDmg','meleeHit','rangedDmg','rangedHit'].forEach(k => {
        let v = Number(d[k]); if (isFinite(v)) s += Math.max(0, v) * (k === 'ac' ? 35 : 18);
    });
    if (d.equipHaste) s += 600;
    if (d.unique) s -= 50;
    return s;
}

function omniCandidates(slot) {
    return Object.keys(DB.items).filter(id => {
        let d = DB.items[id];
        if (!d || d.noUse || d.remains || d.type === 'etc') return false;
        if (slot === 'wpn') return d.type === 'wpn' && !d.isArrow;
        if (slot === 'ring') return d.slot === 'ring';
        if (slot === 'ear') return d.slot === 'ear' || d.slot === 'earring';
        return d.slot === slot;
    }).sort((a, b) => omniItemScore(DB.items[b]) - omniItemScore(DB.items[a]));
}

function omniEquipBestStarter() {
    if (!player || player.cls !== OMNI_CLASS_ID || player.omniStarterGranted) return false;
    player.omniStarterGranted = true;
    player.lv = 1; player.exp = 0; player.name = '全能師'; player.avatar = '公主';
    player.elfEle = 'all';   // 全能師同時符合火、水、風、地四屬性
    omniGrantAllMasteries();
    // 全能師專屬永久通行證；只新增一次，不影響其他職業與一般入場規則。
    if (!(player.inv || []).some(i => i && i.id === 'item_complete_pass')) {
        player.inv.push({ id:'item_complete_pass', uid:uid(), cnt:1, en:0, bless:false, anc:false, attr:false, seteff:false, lock:true, junk:false });
    }

    // 主武器沿用已完成的四龍神之劍；五件真・冥皇套裝保留完整套裝效果。
    let sword = (player.inv || []).find(i => i && i.id === FOUR_DRAGON_SWORD_ID) || omniMakeItem(FOUR_DRAGON_SWORD_ID, 'wpn');
    player.inv = (player.inv || []).filter(i => i !== sword);
    sword.en = 15; sword.bless = true; sword.anc = 'unity'; sword.attr = 'all'; sword.lock = false; sword.junk = false;
    player.eq.wpn = sword;
    const fixed = { helm:'hlm_emperor', armor:'amr_emperor', cloak:'clk_emperor', gloves:'glv_emperor', boots:'bot_emperor' };
    Object.keys(fixed).forEach(slot => { if (DB.items[fixed[slot]]) player.eq[slot] = omniMakeItem(fixed[slot], slot); });

    ['shield','tshirt','shin','amulet','belt'].forEach(slot => {
        let id = omniCandidates(slot)[0]; if (id) player.eq[slot] = omniMakeItem(id, slot);
    });
    let ears = omniCandidates('ear').slice(0, 2);
    if (ears[0]) player.eq.ear1 = omniMakeItem(ears[0], 'ear1');
    if (ears[1] || ears[0]) player.eq.ear2 = omniMakeItem(ears[1] || ears[0], 'ear2');
    let rings = omniCandidates('ring').filter(id => !DB.items[id].unique).slice(0, 4);
    for (let i = 0; i < 4; i++) if (rings[i] || rings[0]) player.eq['ring' + (i + 1)] = omniMakeItem(rings[i] || rings[0], 'ring' + (i + 1));

    // 第一頁最後一格：永久箭筒，讓裝備頁保持全滿。
    if (DB.items.relic_yuka_quiver) player.eq.arrow = omniMakeItem('relic_yuka_quiver', 'arrow');

    // 八件遺骸統一配置「幻覺」：同時啟動 2/3/5 件完整效果。
    ['rem_claw','rem_eye','rem_blood','rem_flesh','rem_heart','rem_bone','rem_fang','rem_scale'].forEach((id, index) => {
        if (!DB.items[id]) return;
        let it = omniMakeItem(id, id); it.en = 0; it.seteff = '席琳';
        player.eq[id] = it;
    });

    player.skills = omniAllSkills();
    player.grantedSkills = player.skills.slice();
    try { Object.values(player.eq).forEach(it => { if (it && typeof registerEquipDex === 'function') registerEquipDex(it.id); }); } catch (e) {}
    calcStats(); player.hp = player.mhp; player.mp = player.mmp;
    if (typeof renderSkillSelects === 'function') renderSkillSelects();
    if (typeof renderTabs === 'function') renderTabs(true);
    if (typeof updateUI === 'function') updateUI();
    if (typeof saveGame === 'function') saveGame();
    if (typeof logSys === 'function') logSys('<span class="font-bold" style="color:#fde68a;text-shadow:0 0 8px #a855f7;">全能師已獲得完整技能與最高階開局裝備。</span>');
    return true;
}

function omniGrantLaiaControlRing() {
    if (!player || player.cls !== OMNI_CLASS_ID || !DB.items.acc_laia_ring) return false;
    let has = Object.values(player.eq || {}).some(i => i && i.id === 'acc_laia_ring') || (player.inv || []).some(i => i && i.id === 'acc_laia_ring');
    if (has) return false;
    let ring = omniMakeItem('acc_laia_ring', 'ring');
    ring.lock = true;
    player.inv.push(ring);
    if (typeof logSys === 'function') logSys('<span class="text-cyan-300 font-bold">已補發「蕾雅戒指」：攜帶即可使用變形、傳送與召喚控制。</span>');
    return true;
}

function omniRemoveLegacyPetGear() {
    if (!player || player.cls !== OMNI_CLASS_ID) return;
    let removed = new Set(OMNI_REMOVED_PET_GEAR_IDS);
    player.inv = (player.inv || []).filter(i => i && !removed.has(i.id));
}

// 新舊全能師存檔都補發迷你四龍，並直接編成目前角色的四龍出戰隊伍。
function omniGrantMiniBossDragons() {
    if (!player || player.cls !== OMNI_CLASS_ID || typeof petRoster !== 'function' || typeof petNewInstance !== 'function') return false;
    if (!player.enSeed) player.enSeed = 'es' + uid() + uid();   // 舊／外部存檔缺角色唯一碼時先補，否則 outOwner 無法成立
    const forms = OMNI_MINI_DRAGON_FORMS;
    let roster = petRoster(), added = [], changed = false;
    // 用戶指定：寵物保管只保留四迷你龍。刪除其他寵物／重複四龍前，先把個別裝備退回背包並寫放生墓碑，避免共用桶合併時復活。
    let seenForms = {};
    for (let i = roster.length - 1; i >= 0; i--) {
        let p = roster[i], keep = p && forms.includes(p.form) && !seenForms[p.form];
        if (keep) { seenForms[p.form] = true; continue; }
        if (p && p.uid && typeof _petReleasedUids !== 'undefined') _petReleasedUids[p.uid] = true;
        roster.splice(i, 1); changed = true;
    }
    forms.forEach(form => {
        if (roster.some(p => p && p.form === form)) return;
        let pet = petNewInstance(form, Math.max(1, Number(player.lv) || 1));
        if (!pet) return;
        pet.name = form; pet.locked = false;
        roster.push(pet); added.push(form); changed = true;
    });
    let owner = typeof _petCurrentOwnerKey === 'function' ? _petCurrentOwnerKey() : '';
    if (owner) {
        // 收回目前角色原有的非四龍寵物，確保四個出戰位置完整留給迷你四龍。
        roster.forEach(p => {
            if (p && String(p.outOwner || '') === owner && !forms.includes(p.form)) {
                p.outOwner = null; p.outSlot = null; p.outV = typeof _petNowStamp === 'function' ? _petNowStamp() : Date.now(); changed = true;
            }
        });
        forms.forEach(form => {
            let p = roster.find(x => x && x.form === form); if (!p) return;
            let rebound = String(p.outOwner || '') !== owner || String(p.outSlot || '') !== String(currentSlot);
            if (rebound) {
                p.outOwner = owner; p.outSlot = String(currentSlot); p.outV = typeof _petNowStamp === 'function' ? _petNowStamp() : Date.now();
                p.hp = Math.max(1, p.hp || p.mhp || 1); p._downed = false; changed = true;
            }
            p.eq = p.eq || {};
            if (!p.eq.wpn || p.eq.wpn.id !== 'pet_four_dragon_fang') {
                p.eq.wpn = { id:'pet_four_dragon_fang', uid:uid(), en:0, bless:true, anc:'unity', attr:'all', lock:true }; changed = true;
            }
            if (!p.eq.arm || p.eq.arm.id !== 'pet_four_dragon_armor') {
                p.eq.arm = { id:'pet_four_dragon_armor', uid:uid(), en:0, bless:true, anc:'unity', attr:'all', lock:true }; changed = true;
            }
            if (changed) p.eqV = typeof _petNowStamp === 'function' ? _petNowStamp() : Date.now();
        });
    }
    if (!changed) return false;
    if (typeof petMarkDirty === 'function') petMarkDirty();
    if (typeof petRosterSave === 'function') petRosterSave();
    if (typeof renderSquadPanel === 'function') { try { renderSquadPanel(); } catch (e) {} }
    if (typeof logSys === 'function') logSys('<span class="text-amber-300 font-bold">🐉 迷你四龍已編入出戰隊伍：</span>' + forms.join('、') + '。');
    return true;
}

// 全能師固定四龍隊伍：完全繞過一般寵物 outOwner／魅力／共用角色歸屬判定。
const _omniOriginalPetsOutList = petsOutList;
petsOutList = function() {
    if (!player || player.cls !== OMNI_CLASS_ID) return _omniOriginalPetsOutList.apply(this, arguments);
    let roster = petRoster();
    return OMNI_MINI_DRAGON_FORMS.map(form => roster.find(p => p && p.form === form)).filter(Boolean);
};

function omniMiniBossDragonsReady() {
    if (!player || player.cls !== OMNI_CLASS_ID || typeof petsOutList !== 'function') return true;
    const forms = OMNI_MINI_DRAGON_FORMS;
    let out = petsOutList();
    return forms.every(form => out.some(p => p && p.form === form && p.eq && p.eq.wpn && p.eq.wpn.id === 'pet_four_dragon_fang' && p.eq.arm && p.eq.arm.id === 'pet_four_dragon_armor'));
}

const _omniOriginalPetsTick = petsTick;
petsTick = function() {
    if (player && player.cls === OMNI_CLASS_ID && typeof state !== 'undefined' && state.ticks % 10 === 0 && !omniMiniBossDragonsReady()) omniGrantMiniBossDragons();
    return _omniOriginalPetsTick.apply(this, arguments);
};

function omniPetGearIsBound(g) {
    return !!(g && (g.lock || (DB.items[g.id] && DB.items[g.id].petBound)));
}
function omniPetGearTip(g) {
    let d = g && DB.items[g.id];
    return d ? (d.n + '\n' + (d.d || '')) : '';
}

if (typeof petGearUnequip === 'function' && typeof petGearEquip === 'function' && typeof petGearOpen === 'function') {
const _omniOriginalPetGearUnequip = petGearUnequip;
petGearUnequip = function(uidv, key) {
    let p = typeof _petFindFresh === 'function' ? _petFindFresh(uidv) : null;
    if (p && p.eq && omniPetGearIsBound(p.eq[key])) {
        if (typeof logSys === 'function') logSys('<span class="text-amber-300 font-bold">四龍神專屬裝備已綁定，無法卸下。</span>');
        return false;
    }
    return _omniOriginalPetGearUnequip.apply(this, arguments);
};

const _omniOriginalPetGearEquip = petGearEquip;
petGearEquip = function(uidv, key) {
    let p = typeof _petFindFresh === 'function' ? _petFindFresh(uidv) : null;
    if (p && p.eq && omniPetGearIsBound(p.eq[key])) {
        if (typeof logSys === 'function') logSys('<span class="text-amber-300 font-bold">四龍神專屬裝備已綁定，無法替換。</span>');
        return false;
    }
    return _omniOriginalPetGearEquip.apply(this, arguments);
};

const _omniOriginalPetGearOpen = petGearOpen;
petGearOpen = function(uidv, key) {
    let result = _omniOriginalPetGearOpen.apply(this, arguments);
    let p = typeof _petFindFresh === 'function' ? _petFindFresh(uidv) : null;
    let g = p && p.eq && p.eq[key];
    let ov = document.getElementById('pet-gear-overlay');
    if (!ov || !omniPetGearIsBound(g)) return result;
    ov.querySelectorAll('button').forEach(b => { if ((b.textContent || '').includes('卸下')) b.remove(); });
    let box = ov.firstElementChild;
    if (box) {
        let info = document.createElement('div');
        info.className = 'omni-pet-bound-tip';
        info.title = omniPetGearTip(g);
        info.innerHTML = '<b>🔒 ' + (DB.items[g.id] ? DB.items[g.id].n : g.id) + '</b><br><span>' + ((DB.items[g.id] && DB.items[g.id].d) || '') + '</span>';
        box.insertBefore(info, box.children[1] || null);
    }
    return result;
};

const _omniOriginalRenderPetStorageNPC = renderPetStorageNPC;
renderPetStorageNPC = function(div) {
    let result = _omniOriginalRenderPetStorageNPC.apply(this, arguments);
    try {
        petRoster().forEach(p => ['wpn','arm'].forEach(key => {
            let g = p.eq && p.eq[key]; if (!g) return;
            let btn = div.querySelector('button[onclick*="petGearOpen(\'' + p.uid + '\',\'' + key + '\')"]');
            if (btn) btn.title = omniPetGearTip(g) + (omniPetGearIsBound(g) ? '\n🔒 專屬綁定：不可卸下或替換' : '');
        }));
    } catch (e) {}
    return result;
};
}

function omniAwaken() {
    if (!player || player.cls !== OMNI_CLASS_ID || player.dead) return false;
    if (player.statuses && (player.statuses.silence > 0 || player.statuses.magicseal > 0)) return false;
    player.poly = {
        n: '終極死亡騎士', lv: 1,
        apm: { '單手劍':300,'單手鈍器':300,'雙手鈍器':300,'弓':300,'十字弓':300,'單手矛':300,'雙手矛':300,'魔杖':300,'匕首':300,'雙手劍':300,'雙刀':300,'鋼爪':300,'奇古獸':300,'鎖鏈劍':300,'雙斧':300 },
        wlk: 4, cast: 1, stun: 0, ed: 25, eh: 25, mgd: 25, sp: 25, c: 'text-yellow-300'
    };
    player.buffs.poly = OMNI_AWAKEN_TICKS;
    player.buffs[OMNI_AWAKEN_SKILL_ID] = OMNI_AWAKEN_TICKS;
    calcStats();
    try { if (typeof _playerMorphTrigger === 'function') _playerMorphTrigger('skill', OMNI_AWAKEN_SKILL_ID); } catch (e) {}
    try { if (typeof _townPlayerTrigger === 'function') { _townPlayerState.key = null; _townPlayerTrigger('skill'); } } catch (e) {}
    try { if (typeof playSelfFx === 'function') { playSelfFx('流星雨'); playSelfFx('雷霆風暴'); } } catch (e) {}
    try { if (typeof vfxCastShake === 'function') vfxCastShake(); } catch (e) {}
    logCombat('<span class="font-bold" style="color:#fde68a;text-shadow:0 0 8px #ef4444,0 0 14px #38bdf8;">【全能覺醒】終極死亡騎士降臨，攻擊與施法速度提升至超高速！</span>', 'magic');
    updateUI(); saveGame(); return true;
}

const _omniOriginalCastSkill = castSkill;
castSkill = function(skId) {
    if (skId === OMNI_AWAKEN_SKILL_ID) return omniAwaken();
    return _omniOriginalCastSkill.apply(this, arguments);
};

const _omniOriginalStartGame = startGame;
startGame = function() {
    let result = _omniOriginalStartGame.apply(this, arguments);
    omniEquipBestStarter();
    omniRemoveLegacyPetGear();
    omniGrantLaiaControlRing();
    omniGrantMiniBossDragons();
    return result;
};

const _omniOriginalLoadGame = loadGame;
loadGame = function() {
    let result = _omniOriginalLoadGame.apply(this, arguments);
    if (player && player.cls === OMNI_CLASS_ID) {
        player.avatar = '公主';
        player.elfEle = 'all';
        if (player.poly && player.poly.n === '全能覺醒・死亡騎士') player.poly.n = '終極死亡騎士';
        player.skills = omniAllSkills();
        omniGrantAllMasteries();
        omniEquipBestStarter();
        omniRemoveLegacyPetGear();
        omniGrantLaiaControlRing();
        omniGrantMiniBossDragons();
        calcStats(); renderSkillSelects(); updateUI();
    }
    return result;
};
