// ===== 🐉 Codex MOD：四龍神之劍 =====
// 全體攻擊與 75% HP/MP 汲取只在此武器裝備於主手時啟用。
const FOUR_DRAGON_SWORD_ID = 'wpn_four_dragon_god_sword';

DB.items[FOUR_DRAGON_SWORD_ID] = {
    n: '四龍神之劍',
    type: 'wpn',
    oneHand: true,
    dmgS: 120,
    dmgL: 120,
    hit: 100,
    dmgBonus: 100,
    mdmg: 100,
    extraDmg: 100,
    extraMp: 100,
    str: 100,
    int: 100,
    mcrit: 100,
    rcrit: 100,
    mcritDmg: 300,
    atkSpdPct: 100,
    equipHaste: true,
    req: 'royal,knight,elf,mage,dark,illusion,dragon,warrior',
    safe: 15,
    p: 0,
    gachaWeight: 0,
    legend: true,
    noJunk: true,
    img: 'assets/icons/weapons/吉爾塔斯之劍.png',
    fourDragonSword: true,
    d: '火、水、風、地四龍神共同鍛造的單手神劍。力量+100、智力+100、物理與魔法能力大幅提升；裝備時，一般攻擊與直接傷害魔法化為全體攻擊，並依實際總傷害回復75% HP與MP。'
};

// 讓所有職業的裝備規則都把它辨識為單手劍；戰士另由 req 明確放行。
if (typeof WEAPON_TAGS !== 'undefined') WEAPON_TAGS[FOUR_DRAGON_SWORD_ID] = ['單手劍'];

function fourDragonSwordEquipped() {
    return !!(player && player.eq && player.eq.wpn && player.eq.wpn.id === FOUR_DRAGON_SWORD_ID);
}

function fourDragonRecover(dealt, sourceLabel) {
    if (!fourDragonSwordEquipped()) return 0;
    dealt = Math.max(0, Math.floor(Number(dealt) || 0));
    let amount = Math.floor(dealt * (player._genesisFullSet ? 1 : 0.75));
    if (!amount) return 0;
    let oldHp = Number(player.hp) || 0;
    let oldMp = Number(player.mp) || 0;
    player.hp = Math.min(player.mhp, oldHp + amount);
    player.mp = Math.min(player.mmp, oldMp + amount);
    let hpGain = Math.max(0, Math.floor(player.hp - oldHp));
    let mpGain = Math.max(0, Math.floor(player.mp - oldMp));
    if (hpGain || mpGain) {
        logCombat(`<span class="font-bold" style="color:#fde68a;text-shadow:0 0 7px #ef4444,0 0 11px #3b82f6;">【${player._genesisFullSet ? '創世神汲取' : '四龍神汲取'}・${sourceLabel || '攻擊'}】</span>依 ${dealt} 點實際傷害，恢復 ${hpGain} HP／${mpGain} MP。`, 'heal');
        updateUI();
    }
    return amount;
}

function fourDragonHpSnapshot() {
    let snap = Object.create(null);
    if (mapState && Array.isArray(mapState.mobs)) mapState.mobs.forEach(m => {
        if (m && m.uid != null && m.curHp > 0 && !m._dead) snap[String(m.uid)] = Number(m.curHp) || 0;
    });
    return snap;
}

function fourDragonDamageSince(snap) {
    let dealt = 0;
    if (!snap || !mapState || !Array.isArray(mapState.mobs)) return dealt;
    mapState.mobs.forEach(m => {
        if (!m || m.uid == null || snap[String(m.uid)] == null) return;
        dealt += Math.max(0, snap[String(m.uid)] - Math.max(0, Number(m.curHp) || 0));
    });
    return dealt;
}

function fourDragonStrikeFx(target) {
    if (!target || target.curHp <= 0 || typeof playSpellFx !== 'function') return;
    try { playSpellFx('流星雨', target); } catch (e) {}
    try { playSpellFx('寒冰氣息', target); } catch (e) {}
    try { playSpellFx('雷霆風暴', target); } catch (e) {}
    try { playSpellFx('地裂術', target); } catch (e) {}
}

// 一般攻擊：只有裝備四龍神之劍時，對當下所有存活敵人各執行一次完整攻擊。
const _fourDragonOriginalPlayerAttack = playerAttack;
playerAttack = function() {
    if (!fourDragonSwordEquipped() || player._fourDragonAoeRunning) return _fourDragonOriginalPlayerAttack();
    let targetUids = mapState.mobs.filter(m => m && m.curHp > 0 && !m._dead).map(m => m.uid);
    if (!targetUids.length) return;
    let original = getTarget();
    let originalUid = original && original.uid;
    let snap = fourDragonHpSnapshot();
    player._fourDragonAoeRunning = true;
    try {
        targetUids.forEach(targetUid => {
            let idx = mapState.mobs.findIndex(m => m && m.uid === targetUid && m.curHp > 0 && !m._dead);
            if (idx < 0) return;
            mapState.targetIdx = idx;
            _fourDragonOriginalPlayerAttack();
        });
    } finally {
        player._fourDragonAoeRunning = false;
        let restoreIdx = mapState.mobs.findIndex(m => m && m.uid === originalUid && m.curHp > 0 && !m._dead);
        if (restoreIdx >= 0) mapState.targetIdx = restoreIdx;
    }
    fourDragonRecover(fourDragonDamageSince(snap), '武器');
};

// 一般攻擊命中時疊播火、水、風、地四種既有動態特效；不額外改變傷害結算。
const _fourDragonOriginalWeaponSpellProc = weaponSpellProc;
weaponSpellProc = function(target, attackHit) {
    let result = _fourDragonOriginalWeaponSpellProc(target, attackHit);
    if (attackHit && fourDragonSwordEquipped()) fourDragonStrikeFx(target);
    return result;
};

function fourDragonOwnsSword() {
    if (!player) return false;
    if ((player.inv || []).some(i => i && i.id === FOUR_DRAGON_SWORD_ID)) return true;
    if (player.eq && Object.values(player.eq).some(i => i && i.id === FOUR_DRAGON_SWORD_ID)) return true;
    try {
        let wh = typeof loadWarehouse === 'function' ? loadWarehouse() : null;
        if (wh && (wh.items || []).some(i => i && i.id === FOUR_DRAGON_SWORD_ID)) return true;
    } catch (e) {}
    return false;
}

function fourDragonEnsureSword() {
    if (!player || !player.cls || fourDragonOwnsSword()) return false;
    player.inv.push({
        id: FOUR_DRAGON_SWORD_ID,
        uid: uid(),
        cnt: 1,
        en: 15,
        bless: true,
        anc: 'primordial',
        attr: false,
        seteff: false,
        lock: false,
        junk: false
    });
    if (typeof registerEquipDex === 'function') try { registerEquipDex(FOUR_DRAGON_SWORD_ID); } catch (e) {}
    if (typeof calcStats === 'function') calcStats();
    if (typeof renderTabs === 'function') renderTabs(true);
    if (typeof saveGame === 'function') saveGame();
    if (typeof logSys === 'function') logSys('<span class="font-bold" style="color:#fde68a;text-shadow:0 0 6px #ef4444,0 0 10px #3b82f6;">四龍神之劍已放入背包。</span>');
    return true;
}

// 新角色與既有／匯入存檔各補發一次；移至倉庫時不重複發放。
const _fourDragonOriginalStartGame = startGame;
startGame = function() {
    let result = _fourDragonOriginalStartGame.apply(this, arguments);
    fourDragonEnsureSword();
    return result;
};

const _fourDragonOriginalLoadGame = loadGame;
loadGame = function() {
    let result = _fourDragonOriginalLoadGame.apply(this, arguments);
    fourDragonEnsureSword();
    return result;
};

