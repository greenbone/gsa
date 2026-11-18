/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';
import {
  AD_SOURCE,
  AD_OTHER_SOURCE,
  activeDirectoryMockResponse,
} from '../../src/gmp/commands/fixtures/active-directory';

test('selects AD computers and transfers them to a new target without saving', async ({
  page,
}, testInfo) => {
  await page.route('**/gmp?**', async route => {
    const xml = activeDirectoryMockResponse(
      new URL(route.request().url()).searchParams,
    );
    if (xml === undefined) await route.continue();
    else await route.fulfill({contentType: 'application/xml', body: xml});
  });
  let discoveryCalls = 0;
  page.on('request', request => {
    if (request.url().includes('cmd=get_active_directory_objects'))
      discoveryCalls += 1;
  });
  await login(page);
  await page.goto('/active-directory');
  const unavailable = page.getByText('Active Directory is not available.');
  await expect(
    page.getByRole('heading', {name: 'Active Directory'}).or(unavailable),
  ).toBeVisible();
  test.skip(
    await unavailable.isVisible(),
    'Active Directory integration is unavailable',
  );

  await expect(
    page.getByRole('table', {name: 'Active Directory connections'}),
  ).toBeVisible();
  const manualLink = page.locator(
    'a[data-testid="manual-link"][href$="/scanning.html#managing-credentials"]',
  );
  await expect(manualLink).toHaveAttribute(
    'href',
    /\/scanning\.html#managing-credentials$/,
  );
  await expect(manualLink).toHaveAttribute('target', '_blank');
  await expect(manualLink).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(manualLink.getByTestId('help-icon')).toHaveAttribute(
    'title',
    'Help: Active Directory',
  );

  await page.getByTestId('powerfilter-text').fill('site 01');
  await page.getByTitle('Update Filter').click();
  await expect(
    page.getByRole('link', {
      name: 'Open directory: AD Site 01',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'Open directory: AD Administration (dc01.domain.local)',
    }),
  ).toHaveCount(0);
  await page.getByTitle('Reset to Default Filter').click();
  await expect(
    page.getByRole('link', {
      name: 'Open directory: AD Administration (dc01.domain.local)',
    }),
  ).toBeVisible();

  await page
    .getByTestId('row-details-toggle')
    .filter({hasText: 'AD Administration (dc01.domain.local)'})
    .click();
  await expect(page.getByText('Bind DN', {exact: true})).toBeVisible();
  await expect(page).toHaveURL(/\/active-directory$/);
  await page
    .getByTestId('row-details-toggle')
    .filter({hasText: 'AD Administration (dc01.domain.local)'})
    .click();
  await expect(page.getByText('Bind DN', {exact: true})).toHaveCount(0);
  expect(discoveryCalls).toBe(0);
  await page.screenshot({path: testInfo.outputPath('connections.png')});
  await page
    .getByRole('link', {
      name: 'Open directory: AD Administration (dc01.domain.local)',
    })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/active-directory/discovery/${AD_SOURCE}$`),
  );
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByText('dc01.domain.local:636', {exact: false}),
  ).toBeVisible();
  // Subtree selection is committed only after the separate resolve call.
  await page.getByRole('checkbox', {name: 'Clients', exact: true}).click();
  const apply = page.getByRole('button', {name: 'Add 5 hosts to new target'});
  await expect(apply).toBeEnabled();
  await page.getByRole('button', {name: 'Expand Clients'}).click();
  await page.getByRole('button', {name: 'Expand Accounting'}).click();
  await expect(
    page.getByRole('checkbox', {name: 'pc-043.domain.local'}),
  ).toBeChecked();
  await expect(
    page.getByRole('checkbox', {name: 'pc-legacy.domain.local'}),
  ).toBeChecked();

  const computerToggle = page.getByRole('button', {
    name: 'Computer details for pc-043.domain.local',
  });
  const computerSelection = page.getByRole('checkbox', {
    name: 'pc-043.domain.local',
  });
  await computerSelection.focus();
  await computerSelection.press('Space');
  await expect(computerSelection).not.toBeChecked();
  await expect(computerToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(
    page.getByRole('button', {name: 'Collapse Accounting'}),
  ).toHaveAttribute('aria-expanded', 'true');
  await computerSelection.press('Space');
  await expect(computerSelection).toBeChecked();
  await computerToggle.focus();
  await computerToggle.press('Enter');
  await expect(computerToggle).toHaveAttribute('aria-expanded', 'true');
  const assignments = page.getByRole('table', {
    name: 'Existing scan-target assignments',
  });
  await expect(assignments).toBeVisible();
  await expect(assignments.getByRole('columnheader').first()).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  const boxes = await Promise.all(
    ['Clients', 'Accounting', 'pc-043.domain.local'].map(name =>
      page.getByRole('checkbox', {name, exact: true}).boundingBox(),
    ),
  );
  expect(boxes.every(box => box !== null)).toBe(true);
  expect(
    Math.max(...boxes.flatMap(box => (box ? [box.x] : []))) -
      Math.min(...boxes.flatMap(box => (box ? [box.x] : []))),
  ).toBeLessThanOrEqual(1);
  await assignments.scrollIntoViewIfNeeded();
  await page.screenshot({path: testInfo.outputPath('accordion-details.png')});
  const viewport = page.viewportSize();
  await page.setViewportSize({width: 1000, height: 900});
  await assignments.scrollIntoViewIfNeeded();
  await expect(
    assignments.getByRole('columnheader', {name: 'Scan config'}),
  ).toBeVisible();
  expect(
    await assignments.evaluate(table => {
      const container = table.parentElement;
      if (!container)
        throw new Error('Assignment table must have a scroll container');
      const bounds = container.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= window.innerWidth;
    }),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('standard-details-narrow.png'),
  });
  if (viewport) await page.setViewportSize(viewport);
  await computerToggle.press('Space');
  await expect(assignments).toHaveCount(0);

  await page.screenshot({path: testInfo.outputPath('directory-browser.png')});
  await apply.click();
  const target = page.getByRole('dialog');
  await expect(target).toContainText('New Target');
  expect(
    (await target.locator('[name="hosts"]').inputValue()).split(',').sort(),
  ).toEqual([
    'fs-01.domain.local',
    'fs-02.domain.local',
    'pc-042.domain.local',
    'pc-043.domain.local',
    'pc-legacy.domain.local',
  ]);
  await target.getByTestId('dialog-close-button').click();
  await expect(apply).toBeEnabled();

  await page.goBack();
  await page
    .getByRole('link', {
      name: 'Open directory: AD Engineering (dc02.domain.local)',
    })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/active-directory/discovery/${AD_OTHER_SOURCE}$`),
  );
  await expect(
    page.getByRole('button', {name: 'Add 0 hosts to new target'}),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', {name: 'Expand Clients'}),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', {name: 'Expand Clients'}),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {name: 'Add 0 hosts to new target'}),
  ).toBeDisabled();
  await page.goBack();
  await expect(
    page.getByRole('table', {name: 'Active Directory connections'}),
  ).toBeVisible();
  await page
    .getByRole('link', {
      name: 'Open directory: AD Administration (dc01.domain.local)',
    })
    .click();
  await expect(
    page.getByRole('button', {name: 'Add 0 hosts to new target'}),
  ).toBeDisabled();
});
