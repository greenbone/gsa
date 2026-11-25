/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  AD_ACCOUNTING,
  AD_CLIENTS,
  AD_OBJECTS,
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

const count = (page: Page, selected: number) =>
  page
    .getByRole('group', {name: 'Selected hosts'})
    .getByText(`${selected} hosts selected`, {exact: true});

test.use({viewport: {width: 1280, height: 900}});

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
    const checkbox = page.getByRole('checkbox', {name: 'pc-042.domain.local'});
    await expect(checkbox).toBeVisible();
    expect(directoryRequests).toBe(4);
    const details = page.getByRole('button', {
      name: 'Computer details for pc-042.domain.local',
    });
    await checkbox.press('Space');
    await expect(checkbox).toBeChecked();
    await expect(details).toHaveAttribute('aria-expanded', 'false');
    await expect(count(page, 1)).toBeVisible();
    expect(directoryRequests).toBe(4);

    await page.getByRole('button', {name: 'Collapse Clients'}).click();
    await expect(checkbox).toHaveCount(0);
    await expect(count(page, 1)).toBeVisible();
    await page.getByRole('button', {name: 'Expand Clients'}).click();
    await accounting.click();
    await expect(checkbox).toBeChecked();
    expect(directoryRequests).toBe(6);
    await checkbox.press('Space');
    await expect(checkbox).not.toBeChecked();
    await expect(count(page, 0)).toBeVisible();
    expect(directoryRequests).toBe(6);
  } finally {
    firstRequest.resolve();
  }
});

for (const width of [1280, 640]) {
  test(`selects only eligible loaded computers after truncation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({width, height: 900});
    let directoryRequests = 0;
    let bulkRequests = 0;
    await page.route('**/gmp?**', async route => {
      const params = new URL(route.request().url()).searchParams;
      if (params.get('cmd') === listingCommand) directoryRequests++;
      let xml: string | undefined;
      if (params.get('base_dn') === AD_ACCOUNTING) {
        const rows = AD_OBJECTS.filter(node => node.parent === AD_ACCOUNTING);
        if (params.get('scope') === 'subtree') {
          bulkRequests++;
          xml = directoryObjectsXml(rows.slice(0, 1), params, true);
        } else if (params.get('scope') === 'onelevel') {
          xml = directoryObjectsXml(rows, params, true);
        }
      }
      if (xml === undefined) await route.fallback();
      else await route.fulfill({contentType: 'application/xml', body: xml});
    });

    await openDiscovery(page);
    const external = page.getByRole('checkbox', {name: 'fs-01.domain.local'});
    await external.check();
    await page.getByRole('button', {name: 'Expand Clients'}).click();
    const expand = page.getByRole('button', {name: 'Expand Accounting'});
    const parent = page.getByRole('checkbox', {
      name: 'Accounting',
      exact: true,
    });
    const header = parent.locator(
      'xpath=ancestor::*[@data-directory-branch-header][1]',
    );
    if (width === 1280) await expand.click();
    await parent.click();

    const action = header.getByRole('button', {
      name: 'Select 3 loaded computers',
    });
    if (width === 640) {
      const load = header.getByRole('button', {name: 'Expand branch'});
      await expect(load).toBeVisible();
      await expect(action).toHaveCount(0);
      await load.click();
    }
    await expect(action).toBeVisible();
    await expect(parent).toHaveAccessibleDescription(
      'Could not select the whole branch.',
    );
    await expect(header.getByRole('status', {name: 'Partial'})).toBeVisible();
    await expect(count(page, 1)).toBeVisible();
    const before = directoryRequests;
    await action.click();

    await expect(count(page, 4)).toBeVisible();
    await expect(external).toBeChecked();
    for (const name of ['pc-042', 'pc-043', 'pc-legacy']) {
      await expect(
        page.getByRole('checkbox', {name: `${name}.domain.local`}),
      ).toBeChecked();
    }
    await expect(
      page.getByRole('checkbox', {name: 'no-hostname.domain.local'}),
    ).toBeDisabled();
    await expect(
      page.getByRole('checkbox', {name: 'pc-retired.domain.local'}),
    ).toHaveCount(0);
    await expect(action).toHaveCount(0);
    await expect(header.getByRole('status', {name: 'Partial'})).toBeVisible();
    expect(bulkRequests).toBe(1);
    expect(directoryRequests).toBe(before);
  });
}

test('shows overlapping group members once and transfers a unique host selection', async ({
  page,
}) => {
  await openDiscovery(page);
  await page.getByRole('button', {name: 'Expand Clients'}).click();
  await page.getByRole('button', {name: 'Expand File servers'}).click();
  const critical = page
    .getByRole('button', {name: 'Expand Critical servers'})
    .first();
  await critical.click();
  const first = page.getByRole('checkbox', {
    name: 'fs-01.domain.local',
    exact: true,
  });
  const second = page.getByRole('checkbox', {
    name: 'fs-02.domain.local',
    exact: true,
  });
  await expect(first).toHaveCount(1);
  await expect(second).toHaveCount(1);
  await first.check();
  await second.check();
  await expect(count(page, 2)).toBeVisible();
  await page.getByRole('button', {name: 'Add hosts to new target'}).click();
  const dialog = page.getByRole('dialog');
  expect(
    (await dialog.locator('[name="hosts"]').inputValue()).split(',').sort(),
  ).toEqual(['fs-01.domain.local', 'fs-02.domain.local']);
  await dialog.getByTestId('dialog-close-button').click();
  await expect(dialog).toHaveCount(0);
});
