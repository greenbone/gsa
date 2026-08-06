/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, test} from '@playwright/test';
import {
  applyFilter,
  createUserFromCurrentPage,
  createUniqueUserName,
  deleteSingleUserFromList,
  ensureUsersListAccess,
  getAppliedSortExpression,
  getPowerFilterInput,
  getSortStateMarker,
  getVisibleUserNames,
  gotoUsersPage,
  isAscending,
  isDescending,
  login,
  openListCreateDialog,
  openUserDetails,
  openUserDetailsFromListRow,
  resetFilter,
  rowByUserName,
  saveUserDialog,
  sortFieldByHeader,
  sortableHeaders,
  username,
  password,
  closeTopDialog,
} from './users.helpers';

test.describe('users page flows', () => {
  test.skip(
    !username || !password,
    'Set E2E_USERNAME and E2E_PASSWORD in .env.e2e.local or shell environment.',
  );

  test.beforeEach(async ({page}) => {
    await login(page);
    await gotoUsersPage(page);
    await ensureUsersListAccess(page);
  });

  test('opens user details from users list', async ({page}) => {
    await openUserDetailsFromListRow(page);

    await expect(page).toHaveURL(/\/user\//);
    await expect(
      page.getByTestId('user-details-tab-information'),
    ).toBeVisible();
    const userTagsTab = page.getByTestId('user-details-tab-tags');
    await userTagsTab.click();
    await expect(userTagsTab).toBeVisible();

    const permissionsTab = page.getByTestId('user-details-tab-permissions');
    await permissionsTab.click();
    await expect(permissionsTab).toBeVisible();
  });

  test('shows confirmation feedback for a user without a role', async ({
    page,
  }) => {
    await openListCreateDialog(page);

    await page.locator('input[name="name"]').fill('');
    await page.locator('input[name="password"]').fill('');
    const userDialog = page
      .getByRole('dialog')
      .filter({has: page.locator('input[name="name"]')})
      .first();
    await userDialog.getByTestId('dialog-save-button').click();

    const confirmationTitle = page
      .getByRole('heading', {name: 'User without a role'})
      .last();
    await expect(confirmationTitle).toBeVisible();
    await page.getByRole('button', {name: 'Cancel'}).last().click();
  });

  test('clicking a row opens inline details below', async ({page}) => {
    const rowToggle = page.getByTestId('row-details-toggle').first();
    await expect(rowToggle).toBeVisible();
    await rowToggle.click();

    await expect(page.getByTitle('Open all details').first()).toBeVisible();
  });

  test('main page CRUD happy path', async ({page}) => {
    const createdUser = createUniqueUserName('e2e-list-crud');
    const editedUser = `${createdUser}-edited`;

    await openListCreateDialog(page);
    await createUserFromCurrentPage(page, createdUser);

    const targetRow = rowByUserName(page, createdUser);
    const editButton = targetRow.getByTitle('Edit User').first();
    await expect(editButton).toBeVisible();

    await editButton.click();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await page.locator('input[name="name"]').fill(editedUser);
    await saveUserDialog(page);

    await applyFilter(page, `name=${editedUser}`);
    await expect(rowByUserName(page, editedUser)).toBeVisible();

    await deleteSingleUserFromList(page, editedUser);
    await resetFilter(page);
  });

  test('bulk plus tags export flows from list and details', async ({page}) => {
    const flowUser = createUniqueUserName('e2e-bulk-seed');

    await openListCreateDialog(page);
    await createUserFromCurrentPage(page, flowUser);

    const tagsBulkButton = page.getByTitle('Add tag to page contents').first();
    await expect(tagsBulkButton).toBeVisible();

    await tagsBulkButton.click();
    const bulkTagsDialog = page
      .getByRole('dialog', {name: 'Add Tag to Page Contents'})
      .first();
    await expect(bulkTagsDialog).toBeVisible();
    await closeTopDialog(page);

    const exportBulkButton = page.getByTitle('Export page contents').first();
    await expect(exportBulkButton).toBeVisible();

    await exportBulkButton.click();
    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);

    const deleteBulkButton = page.getByTitle('Delete page contents').first();
    await expect(deleteBulkButton).toBeVisible();

    await deleteBulkButton.click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.getByTestId('dialog-close-button').click();

    await openUserDetails(page, flowUser);

    const detailsExportButton = page.getByTitle('Export User as XML').first();
    await expect(detailsExportButton).toBeVisible();

    await detailsExportButton.click();
    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);

    await gotoUsersPage(page);
    await deleteSingleUserFromList(page, flowUser);
    await resetFilter(page);
  });

  for (const headerName of sortableHeaders) {
    test(`changes sort by clicking ${headerName} header`, async ({page}) => {
      const sortField = sortFieldByHeader[headerName];
      const sortButton = page.getByTestId(`table-header-sort-by-${sortField}`);

      await expect(sortButton).toBeVisible();

      const beforeMarker = await getSortStateMarker(sortButton);
      const beforeSortExpression = await getAppliedSortExpression(page);

      await sortButton.click();

      let afterMarker = await getSortStateMarker(sortButton);
      let afterSortExpression = await getAppliedSortExpression(page);

      if (
        afterMarker === beforeMarker ||
        afterSortExpression === beforeSortExpression
      ) {
        await sortButton.click();
        afterMarker = await getSortStateMarker(sortButton);
        await expect
          .poll(() => getAppliedSortExpression(page))
          .not.toBe(beforeSortExpression);
        afterSortExpression = await getAppliedSortExpression(page);
      }

      expect(afterMarker).not.toBe(beforeMarker);
      expect(afterSortExpression).toContain(`${sortField}`);

      if (headerName === 'Name') {
        const names = await getVisibleUserNames(page);
        expect(new Set(names).size).toBe(names.length);

        if (afterSortExpression.startsWith('sort-reverse=')) {
          expect(isDescending(names)).toBe(true);
        } else {
          expect(isAscending(names)).toBe(true);
        }
      }
      await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
    });
  }

  test('opens filter dialog and applies/reset filter from powerfilter', async ({
    page,
  }) => {
    const powerFilterInput = getPowerFilterInput(page);
    await expect(powerFilterInput).toBeVisible();

    // Filter dialog open path
    await page.getByTitle('Edit Filter').click();
    const filterDialog = page.getByRole('dialog').first();
    await expect(filterDialog).toBeVisible();
    await page.keyboard.press('Escape');

    // Apply filter from powerfilter input
    const customFilter = 'rows=10 name~e2e';
    await powerFilterInput.fill(customFilter);
    await page.getByTitle('Update Filter').click();

    // UI normalizes/removes rows in the visible powerfilter input.
    await expect(powerFilterInput).toHaveValue(/name~e2e/);
    await expect(page.getByText(/Applied filter:/)).toContainText('name~e2e');
    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);

    // Reset to default filter
    await page.getByTitle('Reset to Default Filter').click();
    await expect(powerFilterInput).not.toHaveValue(customFilter);
  });
});
