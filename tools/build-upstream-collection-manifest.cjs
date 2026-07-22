const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  page.on('console', msg => console.log('[browser]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  await page.addInitScript(() => {
    window.alert = () => {};
    window.confirm = () => false;
    window.prompt = () => null;
  });

  await page.goto('http://127.0.0.1:8765/', {
    waitUntil: 'domcontentloaded',
    timeout: 120000
  });

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
      generatedAt: new Date().toISOString(),
      gameVersion: typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : null,
      source: 'https://github.com/shines871/idle-lineage-class',
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

  fs.writeFileSync('collection-manifest.json', JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify(manifest.counts));
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
