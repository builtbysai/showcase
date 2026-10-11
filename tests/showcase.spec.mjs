import {test, expect} from '@playwright/test';

test('gallery navigation, modal and history work in a real browser', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('#work-heading')).toHaveText('Interactive Diploma');
  await page.getByRole('button', {name: 'Next project'}).click();
  await expect(page.locator('#work-heading')).toHaveText('Log Correlator SIEM');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#work-heading')).toHaveText('Helpdesk Ticket Analytics');
  await page.getByRole('button', {name: /Explore Helpdesk Ticket Analytics/}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#dialog-title')).toHaveText('Helpdesk Ticket Analytics');
  await expect(page.locator('#dialog-copy .feature-desc')).toBeVisible();
  await expect(page).toHaveURL(/#proj-helpdesk$/);
  await page.getByRole('button', {name: /NEXT PROJECT/}).click();
  await expect(page.locator('#dialog-title')).toHaveText('AD Security Auditor');
  await page.getByRole('button', {name: /CLOSE/}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page).not.toHaveURL(/#proj-ad-auditor$/);
});

test('deep-linked project and Escape work', async ({page}) => {
  await page.goto('/#proj-ghostball');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#dialog-title')).toHaveText('Ghost Ball');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page).not.toHaveURL(/#proj-ghostball$/);
});

for (const viewport of [
  {name:'desktop', width:1440, height:900},
  {name:'tablet', width:900, height:700},
  {name:'mobile', width:390, height:844}
]) {
  test(`visible and navigable at ${viewport.name} size`, async ({page}) => {
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await page.goto('/');
    await page.locator('img.art-screen').first().waitFor({state:'attached'}).catch(() => {});
    await expect(page.locator('#visual-frame')).toBeVisible();
    await expect(page.getByRole('button',{name:'Next project'})).toBeVisible();
    await page.getByRole('button',{name:'Next project'}).click();
    await expect(page.locator('#work-heading')).toHaveText('Log Correlator SIEM');
    const measurements = await page.evaluate(() => ({
      screen:innerWidth,
      documentWidth:document.documentElement.scrollWidth,
      frame:document.querySelector('#visual-frame').getBoundingClientRect().toJSON(),
      nav:document.querySelector('#nav-next').getBoundingClientRect().toJSON()
    }));
    expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.screen + 1);
    expect(measurements.frame.width).toBeGreaterThan(100);
    expect(measurements.frame.height).toBeGreaterThan(140);
    expect(measurements.nav.bottom).toBeLessThanOrEqual(viewport.height + 1);
    await page.screenshot({path:`artifacts/showcase-${viewport.name}.png`,fullPage:true,animations:'disabled'});
  });
}

test('reduced-motion users can navigate normally', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name:'Previous project'}).click();
  await expect(page.locator('#work-heading')).toHaveText('Ghost Ball');
  await page.locator('#visual-frame').click();
  await expect(page.locator('#dialog-title')).toHaveText('Ghost Ball');
});
