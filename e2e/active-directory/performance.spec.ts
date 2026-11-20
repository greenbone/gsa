/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';
import {
  AD_LARGE_LEVEL,
  AD_LARGE_LEVEL_NAME,
  AD_LARGE_LEVEL_SIZE,
  AD_SOURCE,
  activeDirectoryMockResponse,
  largeLevelComputerName,
} from '../../src/gmp/commands/fixtures/active-directory';

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
    const xml = activeDirectoryMockResponse(params, 'large-level');
    if (xml === undefined) {
      await route.continue();
      return;
    }

    if (
      params.get('cmd') === 'get_active_directory_objects' &&
      params.get('base_dn') === AD_LARGE_LEVEL &&
      params.get('scope') === 'onelevel'
    ) {
      branchRequests += 1;
      responseBytes = Buffer.byteLength(xml);
    }
    if (params.get('details') === '1') detailRequests += 1;
    await route.fulfill({contentType: 'application/xml', body: xml});
  });

  await login(page);
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

  const toggleFirstComputer = async () => {
    await disclosure(1).scrollIntoViewIfNeeded();
    await expect(computer(2)).toBeAttached();
    const largestGapError = await disclosure(1).evaluate(async button => {
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

      let largestError = 0;
      for (let frame = 0; frame < 6; frame += 1) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const actualGap =
          nextRow.getBoundingClientRect().top -
          row.getBoundingClientRect().bottom;
        largestError = Math.max(largestError, Math.abs(actualGap - gap));
      }
      return largestError;
    });
    expect(largestGapError).toBeLessThanOrEqual(1);
  };

  await toggleFirstComputer();
  await expect(page.getByText('10.0 (22631)')).toBeVisible();
  await toggleFirstComputer();
  await expect(disclosure(1)).toHaveAttribute('aria-expanded', 'false');
  await toggleFirstComputer();
  await expect(page.getByText('10.0 (22631)')).toBeVisible();
  expect(detailRequests).toBe(2);
  const selectedComputer = computer(3);
  await selectedComputer.check();
  await selectedComputer.blur();

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
  await expect(
    page.getByRole('button', {name: 'Add 2 hosts to new target'}),
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
  await selectedComputer.scrollIntoViewIfNeeded();
  await expect(selectedComputer).toBeChecked();
  await main.evaluate(element => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(lastComputer).toBeInViewport();
  await expect(lastComputer).toBeChecked();
  expect(await rows.count()).toBeLessThan(100);
  expect(branchRequests).toBe(1);
  expect(detailRequests).toBe(3);

  process.stdout.write(
    `AD performance: ${responseBytes} XML bytes, ${expandMs} ms to expand, ${selectMs} ms to select, ${mounted} rows mounted on open.\n`,
  );
});
