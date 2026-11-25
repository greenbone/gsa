/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  AD_LARGE_LEVEL,
  AD_LARGE_LEVEL_NAME,
  AD_LARGE_LEVEL_SIZE,
  AD_SOURCE,
  activeDirectoryMockResponse,
  largeLevelComputerName,
} from '../../src/gmp/commands/fixtures/active-directory';
import {expect, loginWithDirectoryFixtures, test} from './directory-fixtures';

test('measures Active Directory with 10,000 computers at one level', async ({
  page,
}) => {
  test.skip(
    process.env.E2E_AD_PERFORMANCE !== '1',
    'Set E2E_AD_PERFORMANCE=1 to run the performance scenario.',
  );
  test.setTimeout(120_000);

  await page.setViewportSize({width: 1280, height: 900});

  let branchRequests = 0;
  let detailRequests = 0;
  let responseBytes = 0;
  await page.route('**/gmp?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    const isPerformanceListing =
      params.get('cmd') === 'get_active_directory_objects' &&
      params.get('base_dn') === AD_LARGE_LEVEL &&
      params.get('scope') === 'onelevel';
    if (isPerformanceListing) {
      // Exercise the renderer beyond the live GMP limit.
      params.set('max_results', String(AD_LARGE_LEVEL_SIZE));
    }
    const xml = activeDirectoryMockResponse(params, 'large-level');
    if (xml === undefined) {
      await route.fallback();
      return;
    }

    if (isPerformanceListing) {
      branchRequests += 1;
      responseBytes = Buffer.byteLength(xml);
    }
    if (params.get('details') === '1') {
      detailRequests += 1;
      if (detailRequests === 1) {
        await new Promise(resolve => setTimeout(resolve, 90));
      }
    }
    await route.fulfill({contentType: 'application/xml', body: xml});
  });

  await loginWithDirectoryFixtures(page);
  await page.goto(`/active-directory/discovery/${AD_SOURCE}`);

  const branch = page.getByRole('button', {
    name: `Expand ${AD_LARGE_LEVEL_NAME}`,
  });
  await expect(branch).toBeVisible();
  expect(branchRequests).toBe(0);

  const directory = page.getByRole('region', {name: 'Directory objects'});
  const computer = (index: number) =>
    page.getByRole('checkbox', {
      name: `${largeLevelComputerName(index)}.domain.local`,
      exact: true,
    });
  const disclosure = (index: number) =>
    page.getByRole('button', {
      name: `Computer details for ${largeLevelComputerName(index)}.domain.local`,
      exact: true,
    });
  const rows = page.locator('li[aria-setsize="10000"]');

  const expandStarted = performance.now();
  await branch.click();
  await expect(computer(1)).toBeInViewport({timeout: 30_000});
  const expandMs = Math.round(performance.now() - expandStarted);
  expect(branchRequests).toBe(1);
  const mounted = await rows.count();
  expect(mounted).toBeLessThan(100);

  const edge = await rows.nth(mounted - 2).getAttribute('aria-posinset');
  const edgeIndex = Number(edge);
  await computer(edgeIndex).focus();
  await page.keyboard.press('Tab');
  await expect(disclosure(edgeIndex + 1)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(computer(edgeIndex)).toBeFocused();

  const toggleFirstComputer = async (animated = true) => {
    await disclosure(1).scrollIntoViewIfNeeded();
    await expect(computer(2)).toBeAttached();
    const {largestGapError, distinctHeights} = await disclosure(1).evaluate(
      async button => {
        const row = button.closest('li');
        const nextRow = row?.nextElementSibling;
        if (
          !(button instanceof HTMLButtonElement) ||
          !row?.parentElement ||
          nextRow?.getAttribute('aria-posinset') !== '2'
        ) {
          throw new Error('The first two computer rows must be mounted.');
        }
        const gap = parseFloat(getComputedStyle(row.parentElement).rowGap);
        button.click();

        let largestGapError = 0;
        const heights = new Set<number>();
        const started = performance.now();
        while (performance.now() - started < 380) {
          await new Promise(resolve => requestAnimationFrame(resolve));
          const bounds = row.getBoundingClientRect();
          heights.add(Math.round(bounds.height));
          const actualGap = nextRow.getBoundingClientRect().top - bounds.bottom;
          largestGapError = Math.max(
            largestGapError,
            Math.abs(actualGap - gap),
          );
        }
        return {largestGapError, distinctHeights: heights.size};
      },
    );
    expect(largestGapError).toBeLessThanOrEqual(1);
    if (animated) {
      expect(distinctHeights).toBeGreaterThan(2);
    } else {
      expect(distinctHeights).toBe(1);
    }
  };

  await toggleFirstComputer();
  await expect(page.getByText('10.0 (22631)')).toBeVisible();
  await toggleFirstComputer();
  await expect(disclosure(1)).toHaveAttribute('aria-expanded', 'false');
  await toggleFirstComputer();
  await expect(page.getByText('10.0 (22631)')).toBeVisible();
  expect(detailRequests).toBe(2);
  await disclosure(1).evaluate(async button => {
    if (!(button instanceof HTMLButtonElement))
      throw new Error('Expected a button');
    button.click();
    for (let frame = 0; frame < 4; frame += 1) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    button.click();
  });
  const detailsPanel = page.getByRole('region', {
    name: `Computer details for ${largeLevelComputerName(1)}.domain.local`,
    exact: true,
  });
  await expect(page.getByText('10.0 (22631)')).toBeVisible();
  await expect
    .poll(() =>
      detailsPanel.evaluate(panel => panel.scrollHeight - panel.clientHeight),
    )
    .toBeLessThanOrEqual(1);
  expect(detailRequests).toBe(3);
  const selectedComputer = computer(3);
  await selectedComputer.check();
  await selectedComputer.blur();

  await directory.hover();
  const scrollStart = await directory.evaluate(element => element.scrollTop);
  for (let step = 1; step <= 6; step += 1) {
    await page.mouse.wheel(0, 900);
    await expect
      .poll(
        async () => {
          const {scrollTop, covered} = await directory.evaluate(element => {
            const top = element.getBoundingClientRect().top + element.clientTop;
            const bottom = top + element.clientHeight;
            const mounted = Array.from(
              element.querySelectorAll('li[data-index]'),
            );
            const visible = mounted
              .map(row => row.getBoundingClientRect())
              .filter(row => row.bottom > top && row.top < bottom);
            const list = mounted[0]?.parentElement;
            if (!list) return {scrollTop: element.scrollTop, covered: false};
            const gap = parseFloat(getComputedStyle(list).rowGap) + 1;
            const covered =
              visible.length > 0 &&
              visible[0].top <= top + gap &&
              visible[visible.length - 1].bottom >= bottom - gap &&
              visible.every(
                (row, index) =>
                  index === 0 || row.top - visible[index - 1].bottom <= gap,
              );
            return {scrollTop: element.scrollTop, covered};
          });
          return scrollTop > scrollStart + step * 600 && covered;
        },
        {message: 'The computer rows cover the scrolled viewport'},
      )
      .toBe(true);
    expect(await rows.count()).toBeLessThan(100);
  }
  const stickyHeader = directory.locator('[data-directory-header-sticky]');
  await expect(stickyHeader).toHaveCount(1);
  await expect(stickyHeader.getByRole('button')).toHaveAccessibleName(
    `Collapse ${AD_LARGE_LEVEL_NAME}`,
  );
  await expect
    .poll(() =>
      directory.evaluate(element => {
        const header = element.querySelector('[data-directory-header-sticky]');
        const top = element.getBoundingClientRect().top + element.clientTop;
        return header
          ? Math.abs(header.getBoundingClientRect().top - top)
          : Infinity;
      }),
    )
    .toBeLessThanOrEqual(1);

  const lastComputer = computer(AD_LARGE_LEVEL_SIZE);
  await directory.evaluate(element => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(lastComputer).toBeInViewport();
  await expect(selectedComputer).toHaveCount(0);
  await expect(computer(100)).toHaveCount(0);
  await expect(disclosure(1)).toHaveAttribute('aria-expanded', 'true');
  expect(await rows.count()).toBeLessThan(100);

  const selectStarted = performance.now();
  await lastComputer.check();
  await expect(page.getByText('2 hosts selected', {exact: true})).toBeVisible();
  await expect(
    page.getByRole('button', {name: 'Add hosts to new target'}),
  ).toBeEnabled();
  const selectMs = Math.round(performance.now() - selectStarted);

  await page.setViewportSize({width: 640, height: 900});
  const main = page.getByRole('main');
  await main.evaluate(element => {
    element.scrollTop = 0;
  });
  await expect(disclosure(1)).toBeInViewport();
  await expect(page.getByText('10.0 (22631)')).toBeVisible();
  await toggleFirstComputer();
  await expect(disclosure(1)).toHaveAttribute('aria-expanded', 'false');
  await toggleFirstComputer();
  await expect(page.getByText('10.0 (22631)')).toBeVisible();
  await disclosure(1).evaluate(async button => {
    if (!(button instanceof HTMLButtonElement))
      throw new Error('Expected a button');
    button.click();
    await new Promise(resolve => requestAnimationFrame(resolve));
    button.closest('main')?.scrollBy(0, 900);
  });
  await expect(page.getByText('10.0 (22631)')).toHaveCount(0);
  await main.evaluate(element => {
    element.scrollTop = 0;
  });
  await page.emulateMedia({reducedMotion: 'reduce'});
  await disclosure(1).click();
  await expect(detailsPanel).toHaveCSS('transition-duration', '0s');
  await expect(page.getByText('10.0 (22631)')).toBeVisible();
  await toggleFirstComputer(false);
  await expect(page.getByText('10.0 (22631)')).toHaveCount(0);
  await selectedComputer.scrollIntoViewIfNeeded();
  await expect(selectedComputer).toBeChecked();
  await main.evaluate(element => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(lastComputer).toBeInViewport();
  await expect(lastComputer).toBeChecked();
  expect(await rows.count()).toBeLessThan(100);
  expect(branchRequests).toBe(1);
  expect(detailRequests).toBe(5);

  process.stdout.write(
    `AD performance: ${responseBytes} XML bytes, ${expandMs} ms to expand, ${selectMs} ms to select, ${mounted} rows mounted on open.\n`,
  );
});
