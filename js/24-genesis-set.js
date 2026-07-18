// ===== 🐉 Codex MOD：終焉・四龍創世 24 件套 =====
// 第一頁：8 防具 + 8 飾品；第二頁：8 創世遺骸。缺少的部件會補發到背包。
(function () {
    const ALL_REQ = 'royal,knight,elf,mage,dark,illusion,dragon,warrior';
    const ARMOR_SET = 'genesis_armor';
    const ACC_SET = 'genesis_acc';
    const ARMOR_SET_TEXT = '【創世防具套裝】2件：AC-20、MR+30；4件：HP+2000、MP+1000、減傷+30；6件：四屬性抗性+50、HP/MP恢復+30；8件：AC-50、MR+100、減傷+50，免疫中毒與石化。';
    const ACC_SET_TEXT = '【創世飾品套裝】2件：額外傷害/命中/魔法點數+30；4件：近遠魔傷害與命中+40；6件：攻速+50%、HP/MP+2000、HP/MP恢復+50；8件：近遠魔爆擊率+50%、爆擊傷害+100%。';

    const defs = {
        genesis_helm:   { n:'創世四龍神盔', type:'arm', slot:'helm',   ac:20, mr:30, str:10, int:10, wis:10, img:'assets/icons/armors/死亡騎士頭盔.png', set:ARMOR_SET, d:'四龍神首共同守護的創世戰盔。' },
        genesis_tshirt: { n:'創世四龍神衣', type:'arm', slot:'tshirt', ac:15, mhp:1000, mmp:500, con:10, wis:10, img:'assets/icons/armors/百變的透明內衣.png', set:ARMOR_SET, d:'貼身流動的創世神衣，能穩定生命與魔力。' },
        genesis_armor:  { n:'創世四龍神甲', type:'arm', slot:'armor',  ac:30, mhp:3000, dr:30, resFire:30, resWater:30, resWind:30, resEarth:30, img:'assets/icons/armors/古老的金屬盔甲.png', set:ARMOR_SET, d:'以四龍逆鱗與黑色神鐵共同鑄造的主甲。' },
        genesis_cloak:  { n:'創世四龍神翼', type:'arm', slot:'cloak',  ac:18, mr:50, er:20, dex:10, img:'assets/icons/armors/巨蟻女皇的金翅膀.png', set:ARMOR_SET, d:'地水風火四種龍翼交疊形成的神聖斗篷。' },
        genesis_gloves: { n:'創世四龍神手', type:'arm', slot:'gloves', ac:15, extraHit:30, extraDmg:30, magicHit:30, str:10, int:10, img:'assets/icons/armors/死亡騎士手套.png', set:ARMOR_SET, d:'讓物理與魔法攻擊同樣精準的四龍護手。' },
        genesis_shield: { n:'創世四龍神盾', type:'arm', slot:'shield', ac:25, dr:40, mhp:1500, immStone:true, immPoison:true, resNone:30, img:'assets/icons/armors/反叛者的盾牌.png', set:ARMOR_SET, d:'環繞創世晶核的四龍守護壁；可與單手神劍並用。' },
        genesis_shin:   { n:'創世四龍神脛', type:'arm', slot:'shin',   ac:15, str:10, dex:10, con:10, int:10, wis:10, img:'assets/icons/armors/古代聖甲蟲脛甲.png', set:ARMOR_SET, d:'承載地脈力量、穩固全身能力的創世脛甲。' },
        genesis_boots:  { n:'創世四龍神靴', type:'arm', slot:'boots', ac:15, atkSpdPct:30, moveSpeedPct:30, hpR:30, mpR:20, img:'assets/icons/armors/幼龍的爪印.png', set:ARMOR_SET, d:'踏出風雷與龍焰軌跡的創世神靴。' },

        genesis_ear_fire:  { n:'創世火龍神耳環', type:'acc', slot:'ear', ac:8, extraDmg:50, meleeDmg:20, mdmg:20, resFire:30, img:'assets/icons/accessories/勇猛耳環.png', set:ACC_SET, unique:true, d:'瓦拉卡斯龍焰凝成的毀滅耳環。' },
        genesis_ear_water: { n:'創世水龍神耳環', type:'acc', slot:'ear', ac:8, mhp:1000, mmp:1000, hpR:40, mpR:40, resWater:30, img:'assets/icons/accessories/幻魔耳環.png', set:ACC_SET, unique:true, d:'法利昂生命潮汐凝成的治癒耳環。' },
        genesis_amulet:    { n:'創世風龍神項鍊', type:'acc', slot:'amulet', ac:10, extraHit:50, magicHit:50, er:30, atkSpdPct:30, resWind:30, img:'assets/icons/accessories/支配耳環.png', set:ACC_SET, unique:true, d:'林德拜爾疾風環繞的創世項鍊。' },
        genesis_ring_earth:{ n:'創世地龍守護戒', type:'acc', slot:'ring', ac:10, dr:30, con:15, mhp:1000, resEarth:30, img:'assets/icons/accessories/地靈戒指.png', set:ACC_SET, unique:true, d:'安塔瑞斯大地之力凝成的守護戒指。' },
        genesis_ring_water:{ n:'創世水龍治癒戒', type:'acc', slot:'ring', ac:10, mmp:1000, mpR:50, extraMp:40, resWater:30, img:'assets/icons/accessories/水靈戒指.png', set:ACC_SET, unique:true, d:'永不枯竭的水龍魔力泉源。' },
        genesis_ring_wind: { n:'創世風龍迅捷戒', type:'acc', slot:'ring', ac:10, rangedDmg:50, rangedHit:50, er:20, resWind:30, img:'assets/icons/accessories/風靈戒指.png', set:ACC_SET, unique:true, d:'駕馭風暴與遠距攻擊的迅捷戒指。' },
        genesis_ring_fire: { n:'創世火龍毀滅戒', type:'acc', slot:'ring', ac:10, meleeDmg:50, mdmg:50, extraDmg:30, resFire:30, img:'assets/icons/accessories/火靈戒指.png', set:ACC_SET, unique:true, d:'將近戰與魔法一同化為龍焰的毀滅戒指。' },
        genesis_belt:      { n:'四龍創世神腰帶', type:'acc', slot:'belt', ac:12, mhp:1500, mmp:1000, weightCap:1000, resFire:25, resWater:25, resWind:25, resEarth:25, img:'assets/icons/accessories/泰坦皮帶.png', set:ACC_SET, unique:true, d:'支撐四龍創世神力與無盡負重的神聖腰帶。' }
    };

    Object.keys(defs).forEach(function (id) {
        const d = defs[id];
        d.req = ALL_REQ; d.safe = 0; d.p = 0; d.gachaWeight = 0;
        d.legend = true; d.noJunk = true; d.noEnhance = true;
        d.d += '<br>' + (d.set === ARMOR_SET ? ARMOR_SET_TEXT : ACC_SET_TEXT);
        DB.items[id] = d;
    });

    if (typeof SHERINE_SET_TEXT !== 'undefined') {
        SHERINE_SET_TEXT['創世'] = [
            '2件：AC-20、傷害減免+20',
            '4件：額外傷害、命中、魔法點數+40',
            '6件：HP/MP+2000、四屬性抗性+50',
            '8件：攻速+50%、近遠魔傷害+50、HP/MP恢復+50'
        ];
    }

    function setCount(p, code) {
        const seen = Object.create(null);
        let n = 0;
        Object.keys(p.eq || {}).forEach(function (slot) {
            const it = p.eq[slot], d = it && DB.items[it.id];
            if (d && d.set === code && !seen[it.id]) { seen[it.id] = true; n++; }
        });
        return n;
    }

    function creationRemains(p) {
        const slots = ['rem_claw','rem_eye','rem_blood','rem_flesh','rem_heart','rem_bone','rem_fang','rem_scale'];
        return slots.filter(function (slot) { const it = p.eq && p.eq[slot]; return it && String(it.seteff || '').slice(0, 2) === '創世'; });
    }

    function applyGenesisSet(p) {
        if (!p || !p.d || !p.eq) return;
        const d = p.d, armor = setCount(p, ARMOR_SET), acc = setCount(p, ACC_SET), rem = creationRemains(p);
        p._genesisArmorCount = armor; p._genesisAccCount = acc; p._genesisRemainsCount = rem.length;

        if (armor >= 2) { d.ac -= 20; d.mr += 30; }
        if (armor >= 4) { p.mhp += 2000; p.mmp += 1000; d.dr += 30; }
        if (armor >= 6) { d.resFire += 50; d.resWater += 50; d.resWind += 50; d.resEarth += 50; d.hpR += 30; d.mpR += 30; }
        if (armor >= 8) { d.ac -= 50; d.mr += 100; d.dr += 50; d.immStone = true; d.immPoison = true; }

        if (acc >= 2) { d.extraDmg += 30; d.extraHit += 30; d.extraMp += 30; }
        if (acc >= 4) { d.meleeDmg += 40; d.rangedDmg += 40; d.magicDmg += 40; d.meleeHit += 40; d.rangedHit += 40; d.magicHit += 40; }
        if (acc >= 6) { d.atkSpdPct += 50; p.mhp += 2000; p.mmp += 2000; d.hpR += 50; d.mpR += 50; }
        if (acc >= 8) { d.meleeCrit += 50; d.rangedCrit += 50; d.magicCrit += 50; d.meleeCritDmg += 100; d.rangedCritDmg += 100; d.magicCritDmg += 100; }

        rem.forEach(function (slot) {
            if (slot === 'rem_claw') { d.extraDmg += 25; d.extraMp += 25; }
            else if (slot === 'rem_eye') { d.extraHit += 25; d.magicHit += 25; }
            else if (slot === 'rem_blood') { d.hpR += 30; d.mpR += 20; }
            else if (slot === 'rem_flesh') d.atkSpdPct += 25;
            else if (slot === 'rem_heart') { p.mhp += 1000; p.mmp += 1000; }
            else if (slot === 'rem_bone') d.dr += 20;
            else if (slot === 'rem_fang') { d.ac -= 20; d.mr += 30; }
            else if (slot === 'rem_scale') { d.resFire += 30; d.resWater += 30; d.resWind += 30; d.resEarth += 30; }
        });
        if (rem.length >= 2) { d.ac -= 20; d.dr += 20; }
        if (rem.length >= 4) { d.extraDmg += 40; d.extraHit += 40; d.extraMp += 40; }
        if (rem.length >= 6) { p.mhp += 2000; p.mmp += 2000; d.resFire += 50; d.resWater += 50; d.resWind += 50; d.resEarth += 50; }
        if (rem.length >= 8) { d.atkSpdPct += 50; d.meleeDmg += 50; d.rangedDmg += 50; d.magicDmg += 50; d.hpR += 50; d.mpR += 50; }

        p._genesisFullSet = armor >= 8 && acc >= 8 && rem.length >= 8;
        if (p._genesisFullSet) {
            p.mhp *= 2; p.mmp *= 2;
            d.extraDmg += 100; d.extraHit += 100; d.extraMp += 100; d.dr += 100; d.atkSpdPct += 100;
            d.resFire += 100; d.resWater += 100; d.resWind += 100; d.resEarth += 100;
            p._equipHaste = true;
        }
    }

    const originalRecomputeStats = recomputeStats;
    recomputeStats = function () {
        const result = originalRecomputeStats.apply(this, arguments);
        applyGenesisSet(player);
        return result;
    };

    const customIds = Object.keys(defs);
    const remainIds = ['rem_claw','rem_eye','rem_blood','rem_flesh','rem_heart','rem_bone','rem_fang','rem_scale'];
    function owns(p, id, seteff) {
        const match = function (it) { return it && it.id === id && (!seteff || String(it.seteff || '').slice(0, 2) === seteff); };
        if ((p.inv || []).some(match) || Object.values(p.eq || {}).some(match)) return true;
        try { const wh = typeof loadWarehouse === 'function' ? loadWarehouse() : null; if (wh && (wh.items || []).some(match)) return true; } catch (e) {}
        return false;
    }
    function makeItem(id, seteff) {
        const isRemains = !!seteff;
        return { id:id, uid:uid(), cnt:1, en:0, bless:isRemains ? false : true, anc:isRemains ? false : 'primordial', attr:false, seteff:seteff || false, lock:false, junk:false };
    }
    function ensureGenesisSet() {
        if (!player || !player.cls || !Array.isArray(player.inv)) return false;
        let added = 0;
        customIds.forEach(function (id) { if (!owns(player, id)) { player.inv.push(makeItem(id, false)); added++; } });
        remainIds.forEach(function (id) { if (!owns(player, id, '創世')) { player.inv.push(makeItem(id, '創世')); added++; } });
        if (!added) return false;
        if (typeof registerEquipDex === 'function') customIds.forEach(function (id) { try { registerEquipDex(id); } catch (e) {} });
        if (typeof calcStats === 'function') calcStats();
        if (typeof renderTabs === 'function') renderTabs(true);
        if (typeof saveGame === 'function') saveGame();
        if (typeof logSys === 'function') logSys('<span class="font-bold" style="color:#fde68a;text-shadow:0 0 7px #ef4444,0 0 11px #3b82f6;">終焉・四龍創世24件套已放入背包；第二頁包含8件創世遺骸。</span>');
        return true;
    }

    const originalStartGame = startGame;
    startGame = function () { const result = originalStartGame.apply(this, arguments); ensureGenesisSet(); return result; };
    const originalLoadGame = loadGame;
    loadGame = function () { const result = originalLoadGame.apply(this, arguments); ensureGenesisSet(); return result; };
})();
