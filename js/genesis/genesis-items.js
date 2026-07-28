(function (G) {
  'use strict';

  const A = 'assets/icons/genesis/';
  const common = { req:'all', p:0, gachaWeight:0, genesisItem:true };
  const make = function (data) { return Object.assign({}, common, data); };

  const items = {
    wpn_genesis_omni_sword: make({
      n:'創世萬象神劍', type:'wpn', oneHand:true, safe:15, dmgS:80, dmgL:80,
      dmgBonus:80, hit:100, mcrit:20, mcritDmg:100, extraDmg:40,
      genesisOmniElement:true, genesisAoePhysical:true, genesisAoeMagic:true,
      genesisDrain:{ physical:{hp:0.30,mp:0.30}, magic:{hp:0.30,mp:0.30} },
      img:A+'omni-sword.png',
      d:'單手劍。近戰傷害+80、近戰命中+100、爆擊率+20%、爆擊傷害+100%、額外傷害+40。武器傷害視為全屬性；物理與魔法命中造成實際傷害時，各吸取30% HP與30% MP。'
    }),
    hlm_genesis_omni: make({
      n:'創世全知神冠', type:'arm', slot:'helm', safe:15,
      int:8,wis:8,cha:6,magicHit:40,mdmg:30,mmp:500,mpR:15,mr:50,
      immSilence:true,genesisMagicSealImmune:true,
      img:A+'omniscient-crown.png',
      d:'INT+8、WIS+8、CHA+6、魔法命中+40、魔法傷害+30、最大MP+500、MP恢復+15、MR+50；免疫沉默與魔封。'
    }),
    ear_genesis_star_l: make({
      n:'創世星核耳環・左', type:'acc', slot:'ear', safe:5,
      str:4,dex:4,int:4,meleeHit:20,rangedHit:20,magicHit:20,hpR:10,mpR:10,
      img:A+'star-ear-left.png',
      d:'STR+4、DEX+4、INT+4；近戰、遠程、魔法命中各+20；HP與MP恢復各+10。'
    }),
    ear_genesis_star_r: make({
      n:'創世星核耳環・右', type:'acc', slot:'ear', safe:5,
      con:4,wis:4,cha:4,meleeDmg:10,rangedDmg:10,mdmg:10,mr:20,
      resFire:10,resWater:10,resEarth:10,resWind:10,
      img:A+'star-ear-right.png',
      d:'CON+4、WIS+4、CHA+4；近戰、遠程、魔法傷害各+10；MR+20、全屬性抗性+10。'
    }),
    glv_genesis_omni: make({
      n:'創世支配神手', type:'arm', slot:'gloves', safe:15,
      str:6,dex:6,int:6,meleeDmg:30,rangedDmg:30,mdmg:30,
      meleeHit:40,rangedHit:40,magicHit:40,genesisAllCrit:10,
      img:A+'dominion-gloves.png',
      d:'STR、DEX、INT各+6；近戰、遠程、魔法傷害各+30；三系命中各+40；全系爆擊率+10%。'
    }),
    amu_genesis_omni_core: make({
      n:'創世核心聖印', type:'acc', slot:'amulet', safe:5,
      str:8,dex:8,con:8,int:8,wis:8,cha:8,mhp:500,mmp:500,dr:20,mr:50,
      genesisMpReduce:15,genesisAllDmg:20,genesisAllHit:30,genesisAllCrit:5,
      genesisKillRestore:{ normal:3, boss:15 },
      img:A+'core-amulet.png',
      d:'六項能力值各+8、最大HP/MP各+500、傷害減免+20、MR+50、MP消耗-15%、全系傷害+20、命中+30、爆擊率+5%。擊殺敵人恢復3% HP/MP；頭目恢復15%。'
    }),
    shd_genesis_omni: make({
      n:'創世萬象神盾', type:'arm', slot:'shield', safe:15,
      ac:30,dr:35,mr:60,resFire:20,resWater:20,resEarth:20,resWind:20,
      genesisMeleeDr:20,genesisRangedDr:20,genesisMagicDr:20,
      genesisReflect:{rate:20,pct:25},
      img:A+'omni-shield.png',
      d:'AC-30、傷害減免+35、MR+60、全屬性抗性+20；三系傷害減免各+20。受到近戰或遠程攻擊時20%機率反彈本次實際傷害25%。'
    }),
    amr_genesis_omni: make({
      n:'創世全能神甲', type:'arm', slot:'armor', safe:15,
      str:8,con:10,mhp:1500,mmp:500,ac:40,dr:40,mr:50,
      resFire:25,resWater:25,resEarth:25,resWind:25,immPoison:true,immStone:true,
      genesisDamageCapPct:35,
      img:A+'omni-armor.png',
      d:'STR+8、CON+10、最大HP+1500、最大MP+500、AC-40、傷害減免+40、MR+50、全屬性抗性+25；免疫中毒與石化。單次傷害上限為最大HP的35%。'
    }),
    rng_genesis_life: make({
      n:'創世生命神戒', type:'acc', slot:'ring', safe:5,
      mhp:600,hpR:25,con:5,genesisMeleeDrain:10,genesisPhysicalDr:10,
      img:A+'life-ring.png',
      d:'最大HP+600、HP恢復+25、CON+5、近戰吸血+10%、物理傷害減免+10。'
    }),
    tsh_genesis_omni: make({
      n:'創世生命神衣', type:'arm', slot:'tshirt', safe:15,
      con:8,wis:8,mhp:1000,mmp:800,hpR:40,mpR:30,hpRegenFaster:2,
      genesisLowMpRegenDouble:true,
      img:A+'life-shirt.png',
      d:'CON+8、WIS+8、最大HP+1000、最大MP+800、HP恢復+40、MP恢復+30；HP恢復速度提升，MP低於30%時MP恢復量加倍。'
    }),
    clk_genesis_astral: make({
      n:'創世星界披風', type:'arm', slot:'cloak', safe:15,
      dex:6,wis:6,ac:20,mr:80,er:50,resFire:40,resWater:40,resEarth:40,resWind:40,
      moveSpeedPct:15,genesisRangedDr:20,genesisMagicDr:20,
      img:A+'astral-cloak.png',
      d:'DEX+6、WIS+6、AC-20、MR+80、ER+50、全屬性抗性+40、移動速度+15%；遠程與魔法傷害減免各+20。'
    }),
    rng_genesis_control: make({
      n:'創世統御神戒', type:'acc', slot:'ring', safe:5,
      cha:8,wis:6,int:4,mmp:400,mpR:20,extraHit:20,magicHit:20,
      genesisControl:true,summonCtrl:true,summonDmgPct:20,summonHpPct:20,
      img:A+'control-ring.png',
      d:'CHA+8、WIS+6、INT+4、最大MP+400、MP恢復+20、命中與魔法命中+20。整合召喚、傳送、變身控制；召喚物傷害與HP+20%，並解鎖創世特殊變身阿卡塔。'
    }),
    rng_genesis_void: make({
      n:'創世虛空神戒', type:'acc', slot:'ring', safe:5,
      int:6,mdmg:25,magicHit:25,genesisMpReduce:10,genesisMagicCrit:8,genesisMagicCritDmg:20,
      img:A+'void-ring.png',
      d:'INT+6、魔法傷害+25、魔法命中+25、MP消耗-10%、法術爆擊率+8%、法術爆擊傷害+20%。'
    }),
    blt_genesis_order: make({
      n:'創世秩序腰帶', type:'acc', slot:'belt', safe:5,
      str:5,con:5,dex:5,weightCap:50,dr:15,hpR:15,mpR:15,genesisNoWeightPenalty:true,
      img:A+'order-belt.png',
      d:'STR、CON、DEX各+5、負重上限+50%、傷害減免+15、HP/MP恢復各+15；無負重懲罰。'
    }),
    bot_genesis_temporal: make({
      n:'創世時空神靴', type:'arm', slot:'boots', safe:15,
      dex:8,con:6,ac:20,er:40,atkSpdPct:20,moveSpeedPct:25,slowImmune:true,
      genesisStunDurationMult:0.5,genesisFreezeDurationMult:0.5,
      genesisMapHaste:{seconds:10,atk:20,cast:20},
      img:A+'temporal-boots.png',
      d:'DEX+8、CON+6、AC-20、ER+40、攻擊速度+20%、移動速度+25%；暈眩與冰凍時間減半、免疫緩速。進入新地圖10秒內攻速與施法速度再+20%。'
    }),
    rng_genesis_chaos: make({
      n:'創世混沌神戒', type:'acc', slot:'ring', safe:5,
      str:5,dex:5,int:5,genesisAllDmg:15,genesisAllHit:20,
      genesisAllCrit:5,genesisAllCritDmg:15,genesisChaosProc:{rate:5},
      img:A+'chaos-ring.png',
      d:'STR、DEX、INT各+5；全系傷害+15、命中+20、爆擊率+5%、爆擊傷害+15%。近戰與魔法命中時各有5%機率追加共鳴傷害。'
    }),
    doll_genesis_core: make({
      n:'創世靈核娃娃', type:'acc', slot:'doll', doll:true,dollTier:6,noEnhance:true,safe:0,
      str:4,dex:4,int:4,wis:4,meleeDmg:15,mdmg:15,hpR:15,mpR:15,goldBonus:20,dropBonus:20,
      genesisPulse:{seconds:20,hp:5,mp:5},genesisPartnerAllStats:2,
      img:A+'core-doll.png',
      d:'STR、DEX、INT、WIS各+4；近戰與魔法傷害+15、HP/MP恢復+15、金幣與掉落率+20%。每20秒恢復5% HP/MP，並強化傭兵、寵物與召喚物。'
    }),
    shin_genesis_immortal: make({
      n:'創世不滅脛甲', type:'arm', slot:'shin', safe:15,
      ac:15,dr:20,hpR:20,mpR:20,stunResist:30,stoneResist:30,freezeResist:30,
      genesisEmergency:{threshold:20,hp:20,mp:20,cooldown:60},
      img:A+'immortal-shin.png',
      d:'AC-15、傷害減免+20、HP/MP恢復各+20、暈眩/石化/冰凍抗性各+30。生命低於20%時立即恢復最大HP/MP各20%，冷卻60秒。'
    }),
    spc_genesis_origin: make({
      n:'創世源紋徽章', type:'acc', slot:'special', safe:5,
      str:5,dex:5,con:5,int:5,wis:5,cha:5,mhp:300,mmp:300,hpR:10,mpR:10,
      genesisAllHit:15,genesisAllDmg:15,genesisSetCore:true,
      img:A+'origin-badge.png',
      d:'六項能力值各+5、最大HP/MP各+300、全系命中與傷害各+15、HP/MP恢復各+10；完整創世套裝件數額外+1。'
    }),
    rem_genesis_eye: make({
      n:'創世全視神眼', type:'acc', slot:'rem_eye', remains:true, safe:5,
      int:10,wis:10,magicHit:40,mdmg:30,mmp:500,mpR:20,genesisMagicCrit:10,
      img:A+'relic-eye.png',
      d:'創世第二頁遺骸。INT/WIS各+10、魔法命中+40、魔法傷害+30、最大MP+500、MP恢復+20、法術爆擊率+10%。'
    }),
    rem_genesis_blood: make({
      n:'創世不滅神血', type:'acc', slot:'rem_blood', remains:true, safe:5,
      str:10,con:10,mhp:1000,hpR:50,genesisAllDmg:15,
      img:A+'relic-blood.png',
      d:'創世第二頁遺骸。STR/CON各+10、最大HP+1000、HP恢復+50、全系傷害+15。'
    }),
    rem_genesis_scale: make({
      n:'創世星龍神鱗', type:'acc', slot:'rem_scale', remains:true, safe:5,
      ac:25,dr:30,mr:60,resFire:30,resWater:30,resEarth:30,resWind:30,
      img:A+'relic-scale.png',
      d:'創世第二頁遺骸。AC-25、傷害減免+30、MR+60、全屬性抗性+30。'
    }),
    rem_genesis_bone: make({
      n:'創世天柱神骨', type:'acc', slot:'rem_bone', remains:true, safe:5,
      str:8,dex:8,con:8,meleeDmg:20,rangedDmg:20,meleeHit:20,rangedHit:20,
      img:A+'relic-bone.png',
      d:'創世第二頁遺骸。STR/DEX/CON各+8；近戰與遠程傷害、命中各+20。'
    }),
    rem_genesis_fang: make({
      n:'創世破界神牙', type:'acc', slot:'rem_fang', remains:true, safe:5,
      genesisAllDmg:25,genesisAllHit:25,genesisAllCrit:5,genesisAllCritDmg:20,
      img:A+'relic-fang.png',
      d:'創世第二頁遺骸。全系傷害+25、命中+25、爆擊率+5%、爆擊傷害+20%。'
    }),
    rem_genesis_heart: make({
      n:'創世星核神心', type:'acc', slot:'rem_heart', remains:true, safe:5,
      str:8,dex:8,con:8,int:8,wis:8,cha:8,mhp:800,mmp:800,hpR:30,mpR:30,
      img:A+'relic-heart.png',
      d:'創世第二頁遺骸。六項能力值各+8、最大HP/MP各+800、HP/MP恢復各+30。'
    }),
    rem_genesis_flesh: make({
      n:'創世永恆神軀', type:'acc', slot:'rem_flesh', remains:true, safe:5,
      con:12,wis:8,mhp:1500,ac:30,dr:40,mr:50,immPoison:true,immStone:true,
      img:A+'relic-flesh.png',
      d:'創世第二頁遺骸。CON+12、WIS+8、最大HP+1500、AC-30、傷害減免+40、MR+50；免疫中毒與石化。'
    }),
    rem_genesis_claw: make({
      n:'創世萬象神爪', type:'acc', slot:'rem_claw', remains:true, safe:5,
      str:6,dex:6,con:6,int:6,wis:6,cha:6,genesisAllDmg:20,genesisAllHit:20,
      genesisAllCrit:5,genesisAllCritDmg:20,atkSpdPct:10,
      img:A+'relic-claw.png',
      d:'創世第二頁遺骸。六項能力值各+6、全系傷害與命中各+20、爆擊率+5%、爆擊傷害+20%、攻擊速度+10%。'
    })
  };

  items.wpn_genesis_omni_sword.d = '單手劍。近戰傷害+80、命中+100、爆擊率+20%、爆擊傷害+100%、額外傷害+40；全屬性。所有物理攻擊與攻擊魔法自動全體化，並依實際總傷害各回復30% HP與30% MP。未命中或0傷害不觸發。';

  const loadout = [
    ['wpn','wpn_genesis_omni_sword',15,'all'],['helm','hlm_genesis_omni',15],
    ['ear1','ear_genesis_star_l',5],['ear2','ear_genesis_star_r',5],['gloves','glv_genesis_omni',15],
    ['amulet','amu_genesis_omni_core',5],['shield','shd_genesis_omni',15],['armor','amr_genesis_omni',15],
    ['ring1','rng_genesis_life',5],['tshirt','tsh_genesis_omni',15],['cloak','clk_genesis_astral',15],
    ['ring2','rng_genesis_control',5],['ring3','rng_genesis_void',5],['belt','blt_genesis_order',5],
    ['boots','bot_genesis_temporal',15],['ring4','rng_genesis_chaos',5],['doll','doll_genesis_core',0],
    ['shin','shin_genesis_immortal',15],['special','spc_genesis_origin',5],
    ['rem_eye','rem_genesis_eye',5,'all'],['rem_blood','rem_genesis_blood',5,'all'],
    ['rem_scale','rem_genesis_scale',5,'all'],['rem_bone','rem_genesis_bone',5,'all'],
    ['rem_fang','rem_genesis_fang',5,'all'],['rem_heart','rem_genesis_heart',5,'all'],
    ['rem_flesh','rem_genesis_flesh',5,'all'],['rem_claw','rem_genesis_claw',5,'all']
  ];

  function instance(id, en, attr) {
    return {id:id,uid:(typeof uid==='function'?uid():Math.random().toString(36).slice(2)),cnt:1,en:en||0,bless:true,anc:'unity',attr:attr||false,lock:true,junk:false};
  }
  function install() {
    if (!window.DB || !DB.items) return false;
    Object.keys(items).forEach(function (id) { DB.items[id] = items[id]; });
    return true;
  }
  function equipLoadout() {
    if (!G.classSystem || !G.classSystem.isGenesisPlayer() || !window.player) return false;
    player.inv = Array.isArray(player.inv) ? player.inv : [];
    player.eq = player.eq || {};
    if (player.genesisLoadoutVersion === G.config.version && loadout.every(function(row){return player.eq[row[0]]&&player.eq[row[0]].id===row[1];})) return true;
    loadout.forEach(function (row) {
      const slot=row[0], id=row[1];
      if (player.eq[slot] && player.eq[slot].id !== id) player.inv.push(player.eq[slot]);
      player.eq[slot]=instance(id,row[2],row[3]);
    });
    player.genesisLoadoutVersion=G.config.version;
    return true;
  }
  function migrateLegacy() {
    if (!window.player || !window.DB || !DB.items || !G.classSystem || !G.classSystem.isGenesisPlayer()) return false;
    install();
    player.inv = Array.isArray(player.inv) ? player.inv : [];
    player.eq = player.eq || {};
    equipLoadout();
    const archived = [];
    Object.keys(player.eq).forEach(function (slot) {
      const inst = player.eq[slot];
      if (inst && !DB.items[inst.id]) { archived.push({source:'eq:'+slot,item:inst}); player.eq[slot] = null; }
    });
    player.inv = player.inv.filter(function (inst) {
      if (!inst || !DB.items[inst.id]) { if (inst) archived.push({source:'inv',item:inst}); return false; }
      return true;
    });
    if (archived.length) {
      const old = Array.isArray(player.genesisLegacyArchive) ? player.genesisLegacyArchive : [];
      const seen = new Set(old.map(function (x) { return JSON.stringify(x); }));
      archived.forEach(function (x) { const key=JSON.stringify(x); if(!seen.has(key)){old.push(x);seen.add(key);} });
      player.genesisLegacyArchive = old.slice(-100);
    }
    return true;
  }
  G.items={definitions:items,loadout:loadout,install:install,equipLoadout:equipLoadout,migrateLegacy:migrateLegacy};
})(window.Genesis=window.Genesis||{});
