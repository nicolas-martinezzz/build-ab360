const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const pages = [
    { url: 'http://localhost:3001/es/', label: 'HOME' },
    { url: 'http://localhost:3001/es/solucion', label: 'SOLUTION' },
    { url: 'http://localhost:3001/es/programa', label: 'PROGRAMA' },
  ];

  for (const { url, label } of pages) {
    await page.goto(url, { waitUntil: 'networkidle' });
    const pills = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('span, li > span').forEach(el => {
        const styles = window.getComputedStyle(el);
        const bg = styles.backgroundColor;
        const text = el.textContent?.trim().slice(0, 40);
        const classes = el.className?.slice(0, 100);
        const rect = el.getBoundingClientRect();
        // Only small pill-like elements with a colored background
        if (
          bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' &&
          text && rect.width > 0 && rect.height < 50 && rect.width < 400 &&
          (classes.includes('rounded') || classes.includes('px-') || classes.includes('badge'))
        ) {
          results.push({ text, bg, classes });
        }
      });
      return results;
    });

    console.log(`\n=== ${label} ===`);
    const seen = new Set();
    pills.forEach(p => {
      const key = `${p.bg}|${p.classes.slice(0,50)}`;
      if (!seen.has(key)) {
        seen.add(key);
        console.log(`  bg: ${p.bg} | "${p.text}" | ${p.classes.slice(0,80)}`);
      }
    });
  }

  await browser.close();
})();
