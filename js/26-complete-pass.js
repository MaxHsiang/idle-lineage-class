// 完全通行證：由背包使用後，可直接前往遊戲資料庫中的任何地圖。
// 只有透過本通行證傳送時會略過入場條件與消耗；一般地圖選單仍遵守原規則。
(function () {
    'use strict';

    const PASS_ID = 'item_complete_pass';
    DB.items[PASS_ID] = {
        n: '完全通行證',
        type: 'misc',
        req: 'all',
        p: 0,
        c: 'text-fuchsia-300',
        eff: 'complete_pass',
        noSell: true,
        unique: true,
        img: 'assets/icons/items/傲慢之塔傳送符(91F).png',
        gachaWeight: 0,
        d: '不會消耗。使用後可從完整地圖清單直接前往任何地點，並略過等級、任務、鑰匙、封印、友好度及傳送符等入場限制。'
    };

    // 七階「四龍娃娃」：完整整合安塔瑞斯、法利昂、林德拜爾、巴拉卡斯四隻六階娃娃能力。
    DB.items.doll_four_dragons = {
        n: '魔法娃娃：四龍娃娃', type: 'acc', slot: 'doll', req: 'all', safe: 0, p: 0,
        doll: true, dollTier: 7, noEnhance: true, noSell: true, unique: true, gachaWeight: 0,
        c: 'text-fuchsia-300', img: 'assets/icons/accessories/魔法娃娃：巴拉卡斯.png',
        dollImg: '魔法娃娃：巴拉卡斯',
        hpR: 80, mpR: 40, mhp: 100, ac: 5, mr: 10, dr: 15,
        int: 2, wis: 2, mdmg: 5, meleeDmg: 4, meleeHit: 8,
        rangedDmg: 4, rangedHit: 8, er: 5,
        resFire: 20, resWater: 20, resWind: 20, resEarth: 20,
        immPoison: true, immParalyze: true, immSlow: true, freezeResist: 100, stunResist: 100,
        d: '七階限定魔法娃娃。完整融合安塔瑞斯、法利昂、林德拜爾與巴拉卡斯四龍之力，擁有四隻六階龍娃娃的全部能力。'
    };

    window.hasCompletePass = function () {
        return !!(player && player.inv && player.inv.some(i => i && i.id === PASS_ID && (i.cnt || 1) >= 1));
    };

    // 全：四種最高階武器屬性合一。傷害／魔法點數為四個第 5 階詞綴的總和，
    // 對火、水、風、地目標一律視為剋制，不再有被反剋的元素。
    if (typeof ATTR_AFFIX !== 'undefined') {
        ATTR_AFFIX.all = { n: '全', ele: 'all', tier: 6, dmg: 36, mp: 36, allElements: true };
    }
    if (typeof elementCounterMult === 'function') {
        const originalElementCounterMult = elementCounterMult;
        elementCounterMult = function (atkEle, defEle) {
            if (atkEle === 'all' && ['fire','water','wind','earth'].includes(defEle)) return ELEM_COUNTER_UP;
            return originalElementCounterMult.apply(this, arguments);
        };
    }

    // 歸一：依裝備種類，把遠古、永恆、不朽、太初的能力全部疊加一次。
    if (typeof ancName === 'function') {
        const originalAncName = ancName;
        ancName = function (anc) { return anc === 'unity' ? '歸一' : originalAncName.apply(this, arguments); };
    }
    if (typeof ancColorClass === 'function') {
        const originalAncColorClass = ancColorClass;
        ancColorClass = function (anc) { return anc === 'unity' ? 'c-unity' : originalAncColorClass.apply(this, arguments); };
    }
    if (typeof applyAncStats === 'function') {
        const originalApplyAncStats = applyAncStats;
        applyAncStats = function (derived, anc, slot) {
            if (anc !== 'unity') return originalApplyAncStats.apply(this, arguments);
            originalApplyAncStats(derived, true, slot);
            originalApplyAncStats(derived, 'eternal', slot);
            originalApplyAncStats(derived, 'immortal', slot);
            originalApplyAncStats(derived, 'primordial', slot);
        };
    }

    const SPECIAL_NAMES = {
        dark_elf_sanctuary: '黑暗妖精聖地',
        cursed_dark_elf_sanctuary: '受詛咒的黑暗妖精聖地',
        collapsed_elder_council_hall: '崩壞的長老會議廳',
        rift_battle: '時空裂痕戰場',
        hidden_antqueen: '巨蟻女皇棲息地',
        hidden_no_life_lab: '無生物研究室',
        hidden_blackmagic_lab: '黑魔法研究室',
        hidden_seal_spirit: '惡靈封印室',
        hidden_seal_monster: '魔物封印室',
        hidden_seal_demon: '惡魔封印室'
    };

    function esc(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function displayName(id) {
        if (SPECIAL_NAMES[id]) return SPECIAL_NAMES[id];
        if (DB.towns && DB.towns[id] && DB.towns[id].n) return DB.towns[id].n;
        if (typeof MAP_CATEGORIES !== 'undefined') {
            for (let cat in MAP_CATEGORIES) {
                let hit = (MAP_CATEGORIES[cat] || []).find(m => m.v === id);
                if (hit) return hit.t || id;
            }
        }
        let pride = id.match(/^pride_(\d+)_(\d+)$/);
        if (pride) return `傲慢之塔 ${pride[1]}～${pride[2]}樓`;
        return id.replace(/^town_/, '').replace(/_/g, ' ');
    }

    function groupName(id) {
        if (id.indexOf('town_') === 0) return '城鎮與安全區';
        if (/^pride_/.test(id)) return '傲慢之塔';
        if (/^(hidden_|dark_elf_|cursed_|collapsed_)/.test(id)) return '隱藏與封印區域';
        if (/^(siege_|rift_)/.test(id)) return '活動與特殊區域';
        try {
            let key = typeof mapRegionOf === 'function' ? mapRegionOf(id) : '';
            if (key && typeof MAP_REGIONS !== 'undefined') {
                let r = MAP_REGIONS.find(x => x.key === key);
                if (r && r.label) return r.label;
            }
        } catch (e) {}
        return '其他狩獵區域';
    }

    function allDestinations() {
        let ids = new Set();
        if (DB.towns) Object.keys(DB.towns).forEach(id => ids.add(id));
        if (DB.maps) Object.keys(DB.maps).forEach(id => ids.add(id));
        return Array.from(ids).map(id => ({ id, name: displayName(id), group: groupName(id) }))
            .sort((a, b) => a.group.localeCompare(b.group, 'zh-Hant') || a.name.localeCompare(b.name, 'zh-Hant'));
    }

    window.closeCompletePass = function () {
        let el = document.getElementById('complete-pass-panel');
        if (el) el.remove();
    };

    window.filterCompletePass = function () {
        let q = (document.getElementById('complete-pass-search')?.value || '').trim().toLowerCase();
        document.querySelectorAll('#complete-pass-list [data-search]').forEach(el => {
            el.style.display = !q || el.dataset.search.indexOf(q) >= 0 ? '' : 'none';
        });
        document.querySelectorAll('#complete-pass-list [data-pass-group]').forEach(group => {
            group.style.display = Array.from(group.querySelectorAll('[data-search]')).some(x => x.style.display !== 'none') ? '' : 'none';
        });
    };

    window.completePassTravel = function (mapId) {
        if (!(DB.maps && DB.maps[mapId]) && !(DB.towns && DB.towns[mapId])) {
            logSys('<span class="text-red-400">通行證找不到指定地圖。</span>');
            return;
        }
        closeCompletePass();
        try {
            let itemModal = document.getElementById('item-modal');
            if (itemModal && !itemModal.classList.contains('hidden') && typeof closeModal === 'function') closeModal();
        } catch (e) {}
        let sel = document.getElementById('map-select');
        if (!sel) return;
        let opt = Array.from(sel.options).find(o => o.value === mapId);
        if (!opt) {
            opt = document.createElement('option');
            opt.value = mapId;
            opt.textContent = displayName(mapId);
            sel.appendChild(opt);
        }
        opt.disabled = false;
        sel.value = mapId;
        changeMap(true);
        logSys(`<span class="text-fuchsia-300 font-bold">完全通行證啟動：</span>已直接前往 <span class="text-white font-bold">${esc(displayName(mapId))}</span>。`);
        saveGame();
    };

    window.openCompletePass = function () {
        closeCompletePass();
        let groups = new Map();
        allDestinations().forEach(x => {
            if (!groups.has(x.group)) groups.set(x.group, []);
            groups.get(x.group).push(x);
        });
        let body = Array.from(groups.entries()).map(([group, maps]) => `
            <section data-pass-group class="mb-4">
                <h3 class="text-amber-300 font-bold text-lg mb-2">${esc(group)} <span class="text-slate-500 text-xs">${maps.length}</span></h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    ${maps.map(m => `<button data-search="${esc((m.name + ' ' + m.id).toLowerCase())}" onclick="completePassTravel('${esc(m.id)}')" class="btn text-left px-3 py-2 bg-slate-800 hover:bg-fuchsia-900 border border-fuchsia-700/50"><span class="text-white font-bold">${esc(m.name)}</span><span class="block text-[10px] text-slate-500">${esc(m.id)}</span></button>`).join('')}
                </div>
            </section>`).join('');
        let panel = document.createElement('div');
        panel.id = 'complete-pass-panel';
        panel.className = 'fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3';
        panel.onclick = e => { if (e.target === panel) closeCompletePass(); };
        panel.innerHTML = `<div class="w-full max-w-6xl max-h-[94vh] flex flex-col bg-slate-950 rounded-2xl border-2 border-fuchsia-500 shadow-[0_0_60px_rgba(217,70,239,0.35)] overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-4 border-b border-fuchsia-800 bg-gradient-to-r from-fuchsia-950 to-slate-950">
                <div class="text-3xl">🌐</div><div class="flex-1"><h2 class="text-2xl font-bold text-fuchsia-300">完全通行證</h2><p class="text-xs text-slate-400">選擇任何地圖直接傳送；通行證不會消耗。</p></div>
                <button onclick="closeCompletePass()" class="btn px-4 py-2 bg-slate-800 text-white">關閉</button>
            </div>
            <div class="p-3 border-b border-slate-800"><input id="complete-pass-search" oninput="filterCompletePass()" autofocus placeholder="搜尋地圖名稱或代碼…" class="w-full px-4 py-3 rounded-lg bg-slate-900 border border-fuchsia-700 text-white outline-none"></div>
            <div id="complete-pass-list" class="flex-1 overflow-y-auto p-4">${body}</div>
        </div>`;
        document.body.appendChild(panel);
    };

    const originalUseItem = useItem;
    useItem = function (uid, silent) {
        let item = player.inv.find(i => i.uid === uid);
        if (item && item.id === PASS_ID) {
            if (silent) return;
            if (player.dead) { logSys('<span class="text-red-400">死亡時無法使用完全通行證。</span>'); return; }
            openCompletePass();
            return;
        }
        return originalUseItem.apply(this, arguments);
    };

    // 全域入場授權：正常地圖選單與 NPC 入口都承認完全通行證。
    // 使用通行證時不扣除原地圖要求的鑰匙、封印、書本或樓層符。
    if (typeof mapOptDisabled === 'function') {
        const originalMapOptDisabled = mapOptDisabled;
        mapOptDisabled = function (m) { return hasCompletePass() ? false : originalMapOptDisabled.apply(this, arguments); };
    }
    if (typeof prideHasTalisman === 'function') {
        const originalPrideHasTalisman = prideHasTalisman;
        prideHasTalisman = function () { return hasCompletePass() ? true : originalPrideHasTalisman.apply(this, arguments); };
    }
    if (typeof changeMap === 'function') {
        const originalChangeMap = changeMap;
        changeMap = function (force) {
            let sel = document.getElementById('map-select');
            let passTravel = !force && hasCompletePass() && sel && sel.value && sel.value !== mapState.current;
            return originalChangeMap.call(this, passTravel ? true : force);
        };
    }
    if (typeof _sanctConsume === 'function') {
        const originalSanctConsume = _sanctConsume;
        _sanctConsume = function (id) {
            if (hasCompletePass()) {
                let n = DB.items[id] ? DB.items[id].n : id;
                logSys(`<span class="text-fuchsia-300 font-bold">完全通行證已代替 ${esc(n)}，且不會消耗。</span>`);
                return true;
            }
            return originalSanctConsume.apply(this, arguments);
        };
    }
    if (typeof sanctBossRespawnCharge === 'function') {
        const originalSanctBossRespawnCharge = sanctBossRespawnCharge;
        sanctBossRespawnCharge = function () {
            if (hasCompletePass()) {
                logSys('<span class="text-fuchsia-300">完全通行證維持封印通道，頭目可直接再臨。</span>');
                return true;
            }
            return originalSanctBossRespawnCharge.apply(this, arguments);
        };
    }
})();
