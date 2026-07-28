const assert = require('assert');
const fs = require('fs');
const path = require('path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const content = read('js/genesis/genesis-content.js');
const world = read('js/11-world-map.js');
const combat = read('js/03-combat-core.js');
const kill = read('js/05-kill-progression.js');
const pets = read('js/22-pets.js');
const ui = read('js/10-ui-tabs.js');
const html = read('index.html');

assert.ok(content.includes('window.hasGenesisPerfectPass = hasPerfectPass'));
assert.ok(world.includes("hasGenesisPerfectPass()) return true"), 'sanctuary entry must not consume an item');
assert.ok(combat.includes("hasGenesisPerfectPass()) return true"), 'sanctuary boss respawn must be free');
assert.ok(kill.includes('創世完美通行證使頭目無消耗再度甦醒'), 'room boss respawn must be free');
assert.ok(kill.includes('未消耗完整的召喚球'), 'Giltas HP preservation must be free');

assert.ok(pets.includes("form+'#boss'"), 'mini dragons must use root boss animation folders');
assert.ok(pets.includes("height='58px'"), 'mini dragons must stay pet-sized');
assert.ok(pets.includes('o.genesisMiniDragon = true'), 'mini dragon renderer metadata must persist');
assert.ok(pets.includes('d.genesisMiniDragon?0'), 'mini dragons must cost zero charisma');

assert.ok(html.includes('id="auto-skills-toggle-all"'), 'fixed select-all button missing');
assert.ok(!ui.includes('position:sticky;top:0'), 'select-all button must not float');
assert.ok(ui.includes('player.config.autoBuffSkills[sid] = turnOn'), 'select-all must update the full skill data model');

console.log('Genesis v1.6.1 regression test passed: infinite pass, boss-animation mini dragons, data-wide skill toggle.');
