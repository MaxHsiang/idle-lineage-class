const fs = require('fs');
const { chromium } = require('playwright');

async function collect(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', msg => console.log(`[browser ${url}]`, msg.type(), msg.text()));
  page.on('pageerror', err => console.log(`[pageerror ${url}]`, err.message));
  await page.addInitScript(() => {
    window.alert = () => {};
    window.confirm = () => false;
    window.prompt = () => null;
  });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => (
    typeof DB !== 'undefined' && DB && DB.items && DB.mobs && DB.maps &&
    typeof CARD_MOB_INFO !== 'undefined' &&
    typeof EQUIP_ITEM_CAT !== 'undefined' &&
    typeof MISC_ITEM_CAT !== 'undefined' &&
    typeof RELIC_ITEM_CAT !== 'undefined'
  ), null, { timeout: 120000 });
  const manifest = await page.evaluate(() => {
    const sortedKeys = obj => Object.keys(obj || {}).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
    const categoryCounts = groups => Object.fromEntries(
      Object.entries(groups || {}).map(([key, ids]) => [key, Array.isArray(ids) ? ids.length : 0])
    );
    return {
      gameVersion: typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : null,
      cardDex: sortedKeys(CARD_MOB_INFO),
      equipDex: sortedKeys(EQUIP_ITEM_CAT),
      miscDex: sortedKeys(MISC_ITEM_CAT),
      relicDex: sortedKeys(RELIC_ITEM_CAT),
      counts: {
        cardDex: Object.keys(CARD_MOB_INFO || {}).length,
        equipDex: Object.keys(EQUIP_ITEM_CAT || {}).length,
        miscDex: Object.keys(MISC_ITEM_CAT || {}).length,
        relicDex: Object.keys(RELIC_ITEM_CAT || {}).length
      },
      categoryCounts: {
        cards: categoryCounts(CARD_REGION_MOBS),
        equipment: categoryCounts(EQUIP_CAT_ITEMS),
        misc: categoryCounts(MISC_CAT_ITEMS),
        relics: categoryCounts(RELIC_CAT_ITEMS)
      }
    };
  });
  await page.close();
  return manifest;
}

function diff(oldList, newList) {
  const oldSet = new Set(oldList || []);
  const newSet = new Set(newList || []);
  return {
    added: (newList || []).filter(x => !oldSet.has(x)),
    removed: (oldList || []).filter(x => !newSet.has(x))
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const oldManifest = await collect(browser, 'http://127.0.0.1:8766/');
  const currentManifest = await collect(browser, 'http://127.0.0.1:8765/');
  await browser.close();

  currentManifest.generatedAt = new Date().toISOString();
  currentManifest.source = 'https://github.com/shines871/idle-lineage-class';
  oldManifest.generatedAt = currentManifest.generatedAt;
  oldManifest.source = 'https://github.com/shines871/idle-lineage-class/tree/f9ba39f6fe693bbb5bc8f2eaa2c6d01d7c68bf32';

  const delta = {
    generatedAt: currentManifest.generatedAt,
    fromVersion: oldManifest.gameVersion,
    toVersion: currentManifest.gameVersion,
    cardDex: diff(oldManifest.cardDex, currentManifest.cardDex),
    equipDex: diff(oldManifest.equipDex, currentManifest.equipDex),
    miscDex: diff(oldManifest.miscDex, currentManifest.miscDex),
    relicDex: diff(oldManifest.relicDex, currentManifest.relicDex)
  };
  delta.counts = Object.fromEntries(['cardDex', 'equipDex', 'miscDex', 'relicDex'].map(k => [k, {
    old: oldManifest.counts[k],
    current: currentManifest.counts[k],
    added: delta[k].added.length,
    removed: delta[k].removed.length
  }]));

  fs.writeFileSync('collection-manifest.json', JSON.stringify(currentManifest, null, 2) + '\n', 'utf8');
  fs.writeFileSync('collection-manifest-v3.7.37.json', JSON.stringify(oldManifest, null, 2) + '\n', 'utf8');
  fs.writeFileSync('collection-delta-v3.7.37-to-current.json', JSON.stringify(delta, null, 2) + '\n', 'utf8');
  fs.writeFileSync('collection-card.json', JSON.stringify(currentManifest.cardDex, null, 2) + '\n', 'utf8');
  fs.writeFileSync('collection-equipment.json', JSON.stringify(currentManifest.equipDex, null, 2) + '\n', 'utf8');
  fs.writeFileSync('collection-misc.json', JSON.stringify(currentManifest.miscDex, null, 2) + '\n', 'utf8');
  fs.writeFileSync('collection-relic.json', JSON.stringify(currentManifest.relicDex, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify(delta.counts));
})().catch(err => {
  console.error(err);
  process.exit(1);
});
