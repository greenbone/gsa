/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Page} from '@playwright/test';
import {login} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';

const discoveryUrl = process.env.E2E_AD_DISCOVERY_URL;

const branchHeaders = '[data-directory-branch-header]';
const directoryCommand = 'get_active_directory_objects';

const branchHeader = (page: Page, id: string) =>
  page.locator(branchHeaders).filter({
    has: page.getByTestId(`entity-selection-${id}`),
  });

const readBranch = async (page: Page, id: string) => {
  const toggle = branchHeader(page, id).locator('[data-accordion-control]');
  const pending = page.waitForResponse(response => {
    const params = new URL(response.url()).searchParams;
    return (
      params.get('cmd') === directoryCommand &&
      (params.get('base_dn') === id || params.get('group_dn') === id)
    );
  });
  await toggle.click();
  const response = await pending;
  expect(response.ok()).toBe(true);
  const result = await page.evaluate(
    xml => {
      const objects = new DOMParser()
        .parseFromString(xml, 'application/xml')
        .querySelector('objects');
      if (!objects) return null;
      const nodes = Array.from(objects.querySelectorAll(':scope > object'));
      const computers = nodes.filter(
        node => node.getAttribute('type') === 'computer',
      );
      return {
        branches: nodes.flatMap(node =>
          node.getAttribute('type') === 'computer'
            ? []
            : [node.querySelector('distinguished_name')?.textContent ?? ''],
        ),
        count: computers.length,
        selectable: computers.flatMap(node => {
          const id = node.querySelector('distinguished_name')?.textContent;
          const hostname = node.querySelector('dns_hostname')?.textContent;
          const disabled = node.querySelector('disabled')?.textContent === '1';
          return id && hostname && !disabled ? [{id, hostname}] : [];
        }),
      };
    },
    await response.text(),
  );
  expect(result, 'GMP must return a directory listing').not.toBeNull();
  const panelId = await toggle.getAttribute('aria-controls');
  await expect(
    page.locator(`[id="${panelId}"] [aria-busy]`).first(),
  ).toHaveAttribute('aria-busy', 'false');
  if (!result) throw new Error('Missing directory listing');
  return result;
};

const browseCandidates = async (page: Page) => {
  const ids = await page
    .locator(`${branchHeaders} input[data-testid]`)
    .evaluateAll(inputs =>
      inputs.map(input =>
        (input.getAttribute('data-testid') ?? '').replace(
          /^entity-selection-/,
          '',
        ),
      ),
    );
  const candidates: ({id: string} & Awaited<ReturnType<typeof readBranch>>)[] =
    [];
  for (const id of ids.slice(0, 8)) {
    const listing = await readBranch(page, id);
    if (listing.selectable.length) candidates.push({id, ...listing});
    await branchHeader(page, id).locator('[data-accordion-control]').click();
    if (
      candidates.some(
        branch => branch.count > 100 && branch.branches.length > 0,
      ) &&
      candidates.length > 1
    )
      break;
  }
  return candidates;
};

test.use({viewport: {width: 1280, height: 900}, trace: 'off', video: 'off'});

test('keeps live directory selections consistent across expansion, scrolling, and target handoff', async ({
  page,
  baseURL,
}) => {
  test.skip(
    !discoveryUrl,
    'Set E2E_AD_DISCOVERY_URL to a live AD discovery page.',
  );
  test.setTimeout(120_000);
  const url = new URL(discoveryUrl as string, baseURL);
  expect(url.origin, 'The discovery page must share the login origin').toBe(
    new URL(baseURL as string).origin,
  );
  expect(url.pathname).toMatch(
    /^\/active-directory\/discovery\/[0-9a-f-]{36}$/i,
  );
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await login(page);
  await page.goto(url.pathname);

  await expect(page.locator(branchHeaders).first()).toBeVisible();
  const candidates = await browseCandidates(page);
  const large = candidates.find(
    branch => branch.count > 100 && branch.branches.length > 0,
  );
  const separate = candidates.find(branch => branch.id !== large?.id);
  expect(
    large,
    'The live route needs a large branch with nested branches',
  ).toBeDefined();
  expect(
    separate,
    'The live route needs a second branch with a selectable computer',
  ).toBeDefined();
  if (!large || !separate)
    throw new Error('Live AD regression prerequisites are missing');

  const computerCheckbox = (id: string) =>
    page.getByTestId(`entity-selection-${id}`);
  const directory = page.getByRole('region', {name: 'Directory objects'});
  const footer = page.getByRole('group', {name: 'Selected hosts'});
  const selectedCount = (count: number) =>
    footer.getByText(`${count} hosts selected`, {exact: true});
  const closeBranch = (id: string) =>
    branchHeader(page, id).locator('[data-accordion-control]').click();

  const retainedHost = separate.selectable[0];
  await readBranch(page, separate.id);
  await computerCheckbox(retainedHost.id).check();
  await expect(selectedCount(1)).toBeVisible();

  const reopened = await readBranch(page, large.id);
  const mainHost = reopened.selectable.find(
    host => host.hostname.toLowerCase() !== retainedHost.hostname.toLowerCase(),
  );
  expect(mainHost).toBeDefined();
  if (!mainHost) throw new Error('The large branch needs a distinct hostname');
  const checkbox = computerCheckbox(mainHost.id);
  const details = checkbox
    .locator('xpath=ancestor::li[1]')
    .locator('[data-accordion-control]');
  await checkbox.focus();
  await checkbox.press('Space');
  await expect(checkbox).toBeChecked();
  await expect(details).toHaveAttribute('aria-expanded', 'false');
  await expect(selectedCount(2)).toBeVisible();

  await closeBranch(large.id);
  await expect(checkbox).toHaveCount(0);
  await expect(selectedCount(2)).toBeVisible();
  await readBranch(page, large.id);
  await expect(checkbox).toBeChecked();
  await expect(details).toHaveAttribute('aria-expanded', 'false');

  const virtualRows = directory.locator('li[data-index]');
  await expect(virtualRows.first()).toBeAttached();
  const mountedBefore = await virtualRows.first().getAttribute('data-index');
  const list = virtualRows.first().locator('..');
  await list.evaluate(element => {
    const viewport = element.closest<HTMLElement>(
      '[data-directory-scroll-area]',
    );
    if (!viewport) throw new Error('Missing directory scroll area');
    viewport.scrollTop += 2500;
  });
  await expect
    .poll(async () => {
      return await virtualRows.evaluateAll(rows =>
        rows.some(row => Number(row.getAttribute('data-index')) >= 20),
      );
    })
    .toBe(true);
  expect(Number(mountedBefore)).toBeLessThan(20);
  await expect(selectedCount(2)).toBeVisible();
  await directory.evaluate(element => {
    element.scrollTop = 0;
  });
  await expect(checkbox).toBeChecked();
  await checkbox.press('Space');
  await expect(checkbox).not.toBeChecked();
  await expect(selectedCount(1)).toBeVisible();

  await checkbox.check();
  const parent = branchHeader(page, large.id).getByTestId(
    `entity-selection-${large.id}`,
  );
  await expect(parent).toHaveJSProperty('indeterminate', true);
  await parent.click();
  await expect(checkbox).not.toBeChecked();
  await expect(computerCheckbox(retainedHost.id)).toBeChecked();
  await expect(selectedCount(1)).toBeVisible();
  await footer.getByRole('button', {name: 'Add hosts to new target'}).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('[name="hosts"]')).toHaveValue(
    retainedHost.hostname.toLowerCase(),
  );
  await dialog.getByTestId('dialog-close-button').click();
  await expect(dialog).toHaveCount(0);
  await expect(selectedCount(1)).toBeVisible();
  expect(pageErrors).toEqual([]);
});
