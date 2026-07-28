# Genesis Build Status

Repository write access verified.

Upstream baseline: `shines871/idle-lineage-class@137faacc5` (`v3.8.34`)

Build target: Genesis Omni edition `v1.6.14-dev`.

- 創世完美通行證：入場、頭目重生與吉爾塔斯傷勢保存皆不消耗道具，可無限使用。
- 迷你四龍：改用四龍頭目的根目錄動畫素材，固定 58px，保留攻擊、施法與死亡動畫。
- 自動技能：固定式全選／取消全選按鈕，直接切換完整技能資料，不受捲動位置影響。

- 27-piece Genesis equipment loadout: 19 main-page pieces plus 8 newly illustrated second-page relics.
- `unity` (歸一) ancient affix and `all` (全) weapon element.
- Actual-damage HP/MP drain, kill recovery, incoming cap/reflection and timed effects.
- Genesis Control Ring compatibility for summon, teleport and transformation control.
- Lv1 Arkata toggle keeps the native Princess animation set (idle, movement, attack, spell, hurt and death) with cyan/violet breathing light.
- The built-in skill book exposes Mage, Royal, Knight, Elf, Dark Elf, Dragon Knight, Illusionist and Warrior pages; Lv1 Omni can use every learned skill.
- Pre-render migration archives retired custom item records and replaces them safely.
- Repeatable smoke test: `node tests/genesis-smoke.js`.
- Genesis-entry runtime repair restores empty equipment and skill fields after any character save is selected.
