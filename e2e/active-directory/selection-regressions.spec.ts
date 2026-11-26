/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  AD_BASE,
  activeDirectoryMockResponse,
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

const computer = (page: Page, name: string) =>
  page.getByRole('checkbox', {name: `${name}.domain.local`, exact: true});

const expand = (page: Page, name: string) =>
  page.getByRole('button', {name: `Expand ${name}`, exact: true}).click();

const expectTargetHosts = async (page: Page, hosts: string[]) => {
  await page.getByRole('button', {name: 'Add hosts to new target'}).click();
  const dialog = page.getByRole('dialog');
  const value = await dialog.locator('[name="hosts"]').inputValue();
  expect(value.split(',').sort()).toEqual([...hosts].sort());
  await dialog.getByTestId('dialog-close-button').click();
};

const accountComputers = AD_OBJECTS.filter(
  node => node.parent === AD_ACCOUNTING,
);

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
    const checkbox = page.getByRole('checkbox', {name: 'pc-042.domain.local'});
    await expect(checkbox).toBeVisible();
    expect(directoryRequests).toBe(4);
    await checkbox.press('Space');
    await expect(checkbox).toBeChecked();
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
    await action.press('Enter');

    await expect(parent).toBeFocused();
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

for (const ancestorSelection of [false, true]) {
  test(`clears omitted hosts after a truncated reload (ancestor selected: ${ancestorSelection})`, async ({
    page,
  }) => {
    await page.route('**/gmp?**', async route => {
      const params = new URL(route.request().url()).searchParams;
      if (
        params.get('cmd') !== listingCommand ||
        params.get('scope') !== 'onelevel' ||
        params.get('base_dn') !== AD_ACCOUNTING
      )
        return route.fallback();
      await route.fulfill({
        contentType: 'application/xml',
        body: directoryObjectsXml(accountComputers.slice(0, 1), params, true),
      });
    });

    await openDiscovery(page);
    if (!ancestorSelection) await computer(page, 'fs-01').check();
    await expand(page, 'Clients');
    await page
      .getByRole('checkbox', {
        name: ancestorSelection ? 'Clients' : 'Accounting',
        exact: true,
      })
      .click();
    await expect(count(page, ancestorSelection ? 5 : 4)).toBeVisible();
    await expand(page, 'Accounting');
    const parent = page.getByRole('checkbox', {
      name: 'Accounting',
      exact: true,
    });
    await expect(computer(page, 'pc-042')).toBeChecked();
    await expect(computer(page, 'pc-043')).toHaveCount(0);
    await expect(parent).toHaveJSProperty('indeterminate', true);
    await parent.click();
    const remaining = ancestorSelection
      ? ['fs-01.domain.local', 'fs-02.domain.local']
      : ['fs-01.domain.local'];
    await expect(count(page, remaining.length)).toBeVisible();
    await expectTargetHosts(page, remaining);
  });
}

test('clears hosts picked through the fallback when a nested listing becomes partial', async ({
  page,
}) => {
  let accountingOpenings = 0;
  await page.route('**/gmp?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('cmd') !== listingCommand) return route.fallback();
    const scope = params.get('scope');
    const base = params.get('base_dn');
    const incompleteParent = base === AD_CLIENTS && scope === 'subtree';
    const truncatedReopen =
      base === AD_ACCOUNTING &&
      scope === 'onelevel' &&
      ++accountingOpenings > 1;
    if (!incompleteParent && !truncatedReopen) return route.fallback();
    await route.fulfill({
      contentType: 'application/xml',
      body: directoryObjectsXml(
        incompleteParent ? [] : accountComputers.slice(0, 1),
        params,
        true,
      ),
    });
  });

  await openDiscovery(page);
  await computer(page, 'fs-01').check();
  await expand(page, 'Clients');
  await expand(page, 'Accounting');
  await expect(computer(page, 'pc-043')).toBeVisible();
  await page.getByRole('checkbox', {name: 'Clients', exact: true}).click();
  await page.getByRole('button', {name: 'Select 3 loaded computers'}).click();
  await expect(count(page, 4)).toBeVisible();

  await page.getByRole('button', {name: 'Collapse Accounting'}).click();
  await expand(page, 'Accounting');
  await expect(computer(page, 'pc-042')).toBeChecked();
  await expect(computer(page, 'pc-043')).toHaveCount(0);
  const child = page.getByRole('checkbox', {name: 'Accounting', exact: true});
  await expect(child).toHaveJSProperty('indeterminate', true);
  await child.click();
  await expect(count(page, 1)).toBeVisible();
  await expectTargetHosts(page, ['fs-01.domain.local']);
});

test('moves a selected shared host to the remaining open group', async ({
  page,
}) => {
  await openDiscovery(page);
  await expand(page, 'Clients');
  await expand(page, 'File servers');
  const nested = page
    .getByRole('button', {name: 'Collapse File servers', exact: true})
    .locator('xpath=ancestor::li[1]');
  await nested
    .getByRole('button', {name: 'Expand Critical servers', exact: true})
    .click();
  await nested
    .getByRole('checkbox', {name: 'fs-01.domain.local', exact: true})
    .check();
  await page
    .getByRole('button', {name: 'Collapse File servers', exact: true})
    .click();
  await expand(page, 'Critical servers');
  const direct = page
    .getByRole('button', {name: 'Collapse Critical servers', exact: true})
    .locator('xpath=ancestor::li[1]');
  const selected = direct.getByRole('checkbox', {
    name: 'fs-01.domain.local',
    exact: true,
  });
  await expect(selected).toBeChecked();
  await expect(computer(page, 'fs-01')).toHaveCount(1);
  await selected.uncheck();
  await expect(count(page, 0)).toBeVisible();
});

test('keeps the target selection when a complete response omits a parent', async ({
  page,
}) => {
  let intercepted = false;
  await page.route('**/gmp?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (
      params.get('cmd') !== listingCommand ||
      params.get('scope') !== 'subtree' ||
      params.get('base_dn') !== AD_ACCOUNTING
    )
      return route.fallback();
    const parent = `CN=Workstations,${AD_ACCOUNTING}`;
    intercepted = true;
    await route.fulfill({
      contentType: 'application/xml',
      body: directoryObjectsXml(
        [
          accountComputers[0],
          {
            ...accountComputers[1],
            id: `CN=pc-orphan,${parent}`,
            parent,
            hostname: 'pc-orphan.domain.local',
          },
        ],
        params,
        false,
      ),
    });
  });
  await openDiscovery(page);
  await computer(page, 'fs-01').check();
  await expand(page, 'Clients');
  await page.getByRole('checkbox', {name: 'Accounting', exact: true}).click();
  await expect(
    page.getByText(/^Could not select the whole branch\./),
  ).toBeVisible();
  expect(intercepted).toBe(true);
  await expect(count(page, 1)).toBeVisible();
  await expectTargetHosts(page, ['fs-01.domain.local']);
});

for (const affected of [false, true]) {
  test(`handles a listing change during bulk selection (affected branch: ${affected})`, async ({
    page,
  }) => {
    const release = Promise.withResolvers<void>();
    let waiting = false;
    let affectedListings = 0;
    await page.route('**/gmp?**', async route => {
      const params = new URL(route.request().url()).searchParams;
      if (
        params.get('cmd') !== listingCommand ||
        params.get('base_dn') !== AD_ACCOUNTING
      )
        return route.fallback();
      if (
        affected &&
        params.get('scope') === 'onelevel' &&
        ++affectedListings === 2
      ) {
        return route.fulfill({
          contentType: 'application/xml',
          body: directoryObjectsXml(accountComputers.slice(1), params),
        });
      }
      if (params.get('scope') !== 'subtree') return route.fallback();
      waiting = true;
      await release.promise;
      const xml = activeDirectoryMockResponse(params);
      if (!xml) throw new Error('Missing Accounting response fixture');
      await route.fulfill({contentType: 'application/xml', body: xml});
    });

    try {
      await openDiscovery(page);
      await computer(page, 'fs-01').check();
      await expand(page, 'Clients');
      if (affected) {
        await expand(page, 'Accounting');
        await expect(computer(page, 'pc-042')).toBeVisible();
        await page
          .getByRole('button', {name: 'Collapse Accounting', exact: true})
          .click();
      }
      await page
        .getByRole('checkbox', {name: 'Accounting', exact: true})
        .click();
      await expect.poll(() => waiting).toBe(true);
      await expand(page, affected ? 'Accounting' : 'File servers');
      if (affected) {
        await expect(computer(page, 'pc-043')).toBeVisible();
        await expect(computer(page, 'pc-042')).toHaveCount(0);
      } else {
        await expect(
          page.getByRole('button', {
            name: 'Expand Critical servers',
            exact: true,
          }),
        ).toHaveCount(2);
      }
      release.resolve();

      if (affected) {
        await expect(
          page.getByRole('button', {name: 'Retry selection'}),
        ).toBeVisible();
        await expect(computer(page, 'pc-042')).toHaveCount(0);
        await expectTargetHosts(page, ['fs-01.domain.local']);
      } else {
        await expect(count(page, 4)).toBeVisible();
        await expectTargetHosts(page, [
          'fs-01.domain.local',
          'pc-042.domain.local',
          'pc-043.domain.local',
          'pc-legacy.domain.local',
        ]);
      }
    } finally {
      release.resolve();
    }
  });
}

test('removes a selected host that becomes disabled on reload', async ({
  page,
}) => {
  let listing = 0;
  await page.route('**/gmp?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (
      params.get('cmd') !== listingCommand ||
      params.get('scope') !== 'onelevel' ||
      params.get('base_dn') !== AD_ACCOUNTING ||
      ++listing === 1
    )
      return route.fallback();
    await route.fulfill({
      contentType: 'application/xml',
      body: directoryObjectsXml(
        accountComputers.map(node =>
          node === accountComputers[0] ? {...node, disabled: true} : node,
        ),
        params,
      ),
    });
  });
  await openDiscovery(page);
  await computer(page, 'fs-01').check();
  await expand(page, 'Clients');
  await expand(page, 'Accounting');
  await computer(page, 'pc-042').check();
  await expect(count(page, 2)).toBeVisible();
  await page
    .getByRole('button', {name: 'Collapse Accounting', exact: true})
    .click();
  await expand(page, 'Accounting');
  await expect(computer(page, 'pc-043')).toBeVisible();
  await expect(computer(page, 'pc-042')).toHaveCount(0);
  await expect(count(page, 1)).toBeVisible();
  await expectTargetHosts(page, ['fs-01.domain.local']);
  await page
    .getByRole('checkbox', {name: 'Show disabled Active Directory objects'})
    .check();
  await expect(computer(page, 'pc-042')).toBeVisible();
  await expect(computer(page, 'pc-042')).not.toBeChecked();
  await expect(count(page, 1)).toBeVisible();
});

test.describe('delegated directory browsing', () => {
  test.use({mayCreateTarget: false});

  test('can select hosts without access to target creation', async ({page}) => {
    const writes: string[] = [];
    page.on('request', request => {
      if (
        request.method() === 'POST' &&
        request.postData()?.includes('create_target')
      ) {
        writes.push(request.url());
      }
    });
    await openDiscovery(page);
    await computer(page, 'fs-01').check();
    await expect(count(page, 1)).toBeVisible();
    await expect(
      page.getByRole('button', {name: 'Add hosts to new target'}),
    ).toBeDisabled();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(writes).toEqual([]);
  });
});

test('cancels without saving and clears the error after a successful retry', async ({
  page,
}) => {
  const release = Promise.withResolvers<void>();
  const requests: FormData[] = [];
  const failure = 'Target exists already';
  await page.route('**/e2e-api/gmp', async route => {
    const request = route.request();
    const body = request.postData();
    if (request.method() !== 'POST' || !body?.includes('\r\ncreate_target\r\n'))
      return route.fallback();
    const fields = await new Response(body, {
      headers: request.headers(),
    }).formData();
    const attempt = requests.push(fields);
    if (attempt === 1) {
      await release.promise;
      return route.fulfill({
        status: 400,
        contentType: 'application/xml',
        body: `<envelope><gsad_response><message>${failure}</message></gsad_response></envelope>`,
      });
    }
    await route.fulfill({
      contentType: 'application/xml',
      body: '<envelope><action_result><id>42</id><action>create_target</action><message>OK</message></action_result></envelope>',
    });
  });

  try {
    await openDiscovery(page);
    await computer(page, 'fs-02').check();
    await computer(page, 'fs-01').check();
    const openTarget = page.getByRole('button', {
      name: 'Add hosts to new target',
    });
    const dialog = page.getByRole('dialog');
    await openTarget.click();
    await dialog.getByTestId('dialog-close-button').click();
    await expect(dialog).toHaveCount(0);
    await expect(count(page, 2)).toBeVisible();
    expect(requests).toHaveLength(0);

    await openTarget.click();
    await dialog.locator('[name="name"]').fill('Fixture AD target');
    const save = dialog.getByRole('button', {name: 'Save', exact: true});
    await save.click();
    await expect.poll(() => requests.length).toBe(1);
    await expect(save).toBeDisabled();
    await save.evaluate(button => (button as HTMLButtonElement).click());
    expect(requests).toHaveLength(1);
    release.resolve();
    await expect(dialog.getByText(failure)).toBeVisible();
    await expect(page.getByText(failure)).toHaveCount(1);
    await expect(count(page, 2)).toBeVisible();
    await expect(dialog.locator('[name="name"]')).toHaveValue(
      'Fixture AD target',
    );
    await save.click();
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByText('Target Fixture AD target successfully created', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText('Target created successfully.')).toHaveCount(0);
    await expect(page.getByText(failure)).toHaveCount(0);
    expect(requests).toHaveLength(2);
    for (const fields of requests) {
      const hosts = fields.get('hosts');
      expect(
        typeof hosts === 'string' ? hosts.split(',').sort() : hosts,
      ).toEqual(['fs-01.domain.local', 'fs-02.domain.local']);
      expect(fields.get('source')).toBe('active_directory');
      expect(fields.get('target_source')).toBe('manual');
      expect(fields.get('name')).toBe('Fixture AD target');
    }
  } finally {
    release.resolve();
  }
});
