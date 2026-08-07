/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';
import {
  applyFilter,
  closeTopDialog,
  createUserFromCurrentPage,
  createUniqueUserName,
  deleteSingleUserFromList,
  ensureUsersListAccess,
  gotoUsersPage,
  openDetailsCreateDialog,
  openListCreateDialog,
  openUserDetails,
  openUserDetailsFromListRow,
  resetFilter,
  saveUserDialog,
  userLinkByName,
} from 'e2e/users/users-helpers';

test.describe('users page flows', () => {
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

  test('details tabs and actions are working', async ({page}) => {
    const detailsUser = createUniqueUserName('e2e-details-actions');

    await openListCreateDialog(page);
    await createUserFromCurrentPage(page, detailsUser);
    await openUserDetails(page, detailsUser);

    await page.getByTestId('user-details-tab-information').click();
    await expect(
      page.getByTestId('user-details-tab-information'),
    ).toBeVisible();

    await page.getByTestId('user-details-tab-tags').click();
    await expect(page.getByTestId('user-details-tab-tags')).toBeVisible();

    await page.getByTestId('user-details-tab-permissions').click();
    await expect(
      page.getByTestId('user-details-tab-permissions'),
    ).toBeVisible();

    const editButton = page.getByTitle('Edit User').first();
    await expect(editButton).toBeVisible();
    await editButton.click();
    await closeTopDialog(page);

    // Ensure create action is taken from user details toolbar, not permissions panel.
    await page.getByTestId('user-details-tab-information').click();
    await expect(
      page.getByTestId('user-details-tab-information'),
    ).toBeVisible();

    await openDetailsCreateDialog(page);
    await closeTopDialog(page);

    const cloneButton = page.getByTitle('Clone User').first();
    await expect(cloneButton).toBeVisible();

    const exportButton = page.getByTitle('Export User as XML').first();
    await expect(exportButton).toBeVisible();
    await exportButton.click();
    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);

    const deleteButton = page.getByTitle('Delete User').first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await closeTopDialog(page);

    await gotoUsersPage(page);
    await deleteSingleUserFromList(page, detailsUser);
    await resetFilter(page);
  });

  test('details page CRUD happy path', async ({page}) => {
    const seedUser = createUniqueUserName('e2e-details-seed');
    const detailsCreatedUser = createUniqueUserName('e2e-details-created');
    const detailsEditedUser = `${seedUser}-edited`;

    await openListCreateDialog(page);
    await createUserFromCurrentPage(page, seedUser);

    await openUserDetails(page, seedUser);

    const editButton = page.getByTitle('Edit User').first();
    await expect(editButton).toBeVisible();

    await editButton.click();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await page.locator('input[name="name"]').fill(detailsEditedUser);
    await saveUserDialog(page);

    await expect(page.getByRole('heading', {name: /User:/})).toContainText(
      detailsEditedUser,
    );

    await openDetailsCreateDialog(page);
    await createUserFromCurrentPage(page, detailsCreatedUser);
    await openUserDetails(page, detailsEditedUser);

    const deleteButton = page.getByTitle('Delete User').first();
    await expect(deleteButton).toBeVisible();

    await deleteButton.click();
    const deleteDialog = page.getByRole('dialog').first();
    await expect(deleteDialog).toBeVisible();

    const dialogSaveButton = deleteDialog
      .getByTestId('dialog-save-button')
      .first();
    const hasSaveButton =
      (await dialogSaveButton.count()) > 0 &&
      (await dialogSaveButton.isVisible().catch(() => false));

    if (hasSaveButton) {
      await dialogSaveButton.click();

      await expect(page).toHaveURL(/\/users/);
      await applyFilter(page, `name=${detailsEditedUser}`);
      await expect(userLinkByName(page, detailsEditedUser)).toHaveCount(0);
    } else {
      await closeTopDialog(page);
      await gotoUsersPage(page);
      await deleteSingleUserFromList(page, detailsEditedUser);
    }

    await deleteSingleUserFromList(page, detailsCreatedUser);
    await resetFilter(page);
  });
});
