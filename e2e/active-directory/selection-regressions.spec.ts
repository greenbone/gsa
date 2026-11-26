/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  AD_BASE,
  AD_CLIENTS,
  AD_SOURCE,
  directoryObjectsXml,
} from '../../src/gmp/commands/fixtures/active-directory';
import {
  expect,
  loginWithDirectoryFixtures,
  test,
  type Page,
} from './directory-fixtures';

const listingCommand = 'get_active_directory_objects';

const openDiscovery = async (page: Page) => {
  await loginWithDirectoryFixtures(page);
  await page.goto(`/active-directory/discovery/${AD_SOURCE}`);
};

test.use({viewport: {width: 1280, height: 900}});

test('applies the fill layout only on the desktop discovery route', async ({
  page,
}) => {
  let computerCount = 1;
  await page.route('**/gmp?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('cmd') !== listingCommand) {
      await route.fallback();
      return;
    }
    const computers = Array.from({length: computerCount}, (_, index) => ({
      kind: 'computer' as const,
      id: `CN=Computer ${index},${AD_BASE}`,
      parent: AD_BASE,
      name: `Computer ${index}`,
      hostname: `computer-${index}.domain.local`,
    }));
    await route.fulfill({
      contentType: 'application/xml',
      body: directoryObjectsXml(computers, params),
    });
  });

  const results = page.getByRole('region', {name: 'Directory objects'});
  const isResultsScrollable = () =>
    results.evaluate(node => node.scrollHeight > node.clientHeight);
  const footer = page.getByText(/Copyright ©/);

  await openDiscovery(page);
  await expect(results.getByText('Computer 0', {exact: true})).toBeVisible();
  await expect.poll(isResultsScrollable).toBe(false);
  await expect(footer).toBeInViewport();

  computerCount = 40;
  await page.reload();
  await expect(results.getByRole('listitem')).toHaveCount(40);
  await expect.poll(isResultsScrollable).toBe(true);
  await expect(footer).toBeInViewport();

  await page.setViewportSize({width: 1024, height: 768});
  await expect(results).toHaveCSS('overflow-y', 'auto');
  await expect.poll(isResultsScrollable).toBe(true);
  await page.setViewportSize({width: 1024, height: 720});
  await expect(results).toHaveCSS('overflow-y', 'visible');
  await expect.poll(isResultsScrollable).toBe(false);

  await page.setViewportSize({width: 1280, height: 900});
  await page.getByRole('link', {exact: true, name: 'Active Directory'}).click();
  await expect(page).toHaveURL(/\/active-directory\/?$/);
  await expect(results).toHaveCount(0);
  await expect(page.getByRole('main')).toHaveCSS('min-inline-size', 'auto');
});

test('keeps the new listing when a closed branch responds after reopening', async ({
  page,
}) => {
  const firstRequest = Promise.withResolvers<void>();
  let expansions = 0;
  let directoryRequests = 0;
  await page.route('**/gmp?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('cmd') === listingCommand) directoryRequests++;
    if (
      params.get('base_dn') === AD_CLIENTS &&
      params.get('scope') === 'onelevel'
    ) {
      expansions++;
      if (expansions === 1) {
        await firstRequest.promise;
        await route.fulfill({
          contentType: 'application/xml',
          headers: {'x-e2e-listing': 'stale'},
          body: directoryObjectsXml([], params),
        });
        return;
      }
    }
    await route.fallback();
  });

  try {
    await openDiscovery(page);
    await page.getByRole('button', {name: 'Expand Clients'}).click();
    await expect.poll(() => expansions).toBe(1);
    await page.getByRole('button', {name: 'Collapse Clients'}).press('Space');
    await page.getByRole('button', {name: 'Expand Clients'}).press('Enter');
    const accounting = page.getByRole('button', {name: 'Expand Accounting'});
    await expect(accounting).toBeVisible();
    expect(expansions).toBe(2);
    const stale = page.waitForResponse(
      response => response.headers()['x-e2e-listing'] === 'stale',
    );
    firstRequest.resolve();
    const staleResponse = await stale;
    await staleResponse.finished();
    await expect(accounting).toBeVisible();

    await accounting.click();
    await expect(
      page.getByText('pc-042.domain.local', {exact: true}),
    ).toBeVisible();
    expect(directoryRequests).toBe(4);
    await page.getByRole('button', {name: 'Collapse Clients'}).click();
    await expect(
      page.getByText('pc-042.domain.local', {exact: true}),
    ).toHaveCount(0);
  } finally {
    firstRequest.resolve();
  }
});
