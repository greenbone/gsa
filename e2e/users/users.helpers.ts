/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, type Locator, type Page} from '@playwright/test';

const username = process.env.E2E_USERNAME;
const password = process.env.E2E_PASSWORD;
const passwordDefault = 'e2e-password-123';

const sortableHeaders = [
  'Name',
  'Roles',
  'Groups',
  'Host Access',
  'Authentication Type',
];

const sortFieldByHeader: Record<string, string> = {
  Name: 'name',
  Roles: 'roles',
  Groups: 'groups',
  'Host Access': 'host_access',
  'Authentication Type': 'ldap',
};

const createUniqueUserName = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const login = async (page: Page) => {
  await page.goto('/login');

  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginButton = page.getByTestId('login-button');

  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();

  let loggedIn = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await usernameInput.fill(username as string);
    await passwordInput.fill(password as string);
    await loginButton.click();

    try {
      await expect(page).not.toHaveURL(/\/login(?:$|\?)/, {timeout: 7000});
      loggedIn = true;
      break;
    } catch {
      if (attempt === 1) {
        throw new Error('Login failed after retry');
      }
    }
  }

  expect(loggedIn).toBe(true);
  await expect(page.getByTestId('error')).toHaveCount(0);
};

const gotoUsersPage = async (page: Page) => {
  await page.goto('/users');
  await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
  await expect(getPowerFilterInput(page)).toBeVisible();
};

const ensureUsersListAccess = async (page: Page) => {
  await expect(page.getByTestId('table-header-sort-by-name')).toBeVisible();
};

const getPowerFilterInput = (page: Page) =>
  page.locator('input[name="userFilterString"]');

const applyFilter = async (page: Page, filterQuery: string) => {
  const powerFilterInput = getPowerFilterInput(page);
  await expect(powerFilterInput).toBeVisible();

  const appliedFilter = page.getByText(/\(Applied filter:/).first();
  let applied = false;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let inputFilled = false;

    for (let inputAttempt = 0; inputAttempt < 3; inputAttempt += 1) {
      await powerFilterInput.click();
      await powerFilterInput.fill('');
      await powerFilterInput.fill(filterQuery);

      const currentValue = await powerFilterInput.inputValue().catch(() => '');
      if (currentValue === filterQuery) {
        inputFilled = true;
        break;
      }
    }

    if (!inputFilled) {
      continue;
    }

    await page.getByTitle('Update Filter').click();

    const appliedThisAttempt = await expect
      .poll(
        async () => {
          const currentValue = await powerFilterInput
            .inputValue()
            .catch(() => '');
          const hasAppliedFilter =
            (await appliedFilter.count()) > 0 &&
            (await appliedFilter.isVisible().catch(() => false));
          const appliedText = hasAppliedFilter
            ? await appliedFilter.innerText()
            : '';

          return (
            currentValue === filterQuery || appliedText.includes(filterQuery)
          );
        },
        {timeout: 7000},
      )
      .toBeTruthy()
      .then(() => true)
      .catch(() => false);

    if (appliedThisAttempt) {
      applied = true;
      break;
    }
  }

  expect(applied).toBe(true);
};

const resetFilter = async (page: Page) => {
  await page.getByTitle('Reset to Default Filter').click();
  await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
};

const rowByUserName = (page: Page, userName: string) =>
  page.getByRole('row', {name: new RegExp(userName)}).first();

const rowsByUserName = (page: Page, userName: string) =>
  page.getByRole('row', {name: new RegExp(userName)});

const userLinkByName = (page: Page, userName: string) =>
  page.locator('a[href^="/user/"]', {hasText: userName}).first();

const openUserDetailsFromListRow = async (page: Page, userName?: string) => {
  const userDetailsLink = userName
    ? userLinkByName(page, userName)
    : page.locator('a[href^="/user/"]').first();

  if (await userDetailsLink.isVisible()) {
    await userDetailsLink.click();
    return;
  }

  const rowToggle = userName
    ? page.getByTestId('row-details-toggle').filter({hasText: userName}).first()
    : page.getByTestId('row-details-toggle').first();

  await expect(rowToggle).toBeVisible();
  await rowToggle.click();

  const openAllDetails = page.getByTitle('Open all details').first();
  await expect(openAllDetails).toBeVisible();
  await openAllDetails.click();
};

const selectRole = async (page: Page, roleName: string) => {
  const rolesGroup = page
    .locator('[data-testid="form-group"]')
    .filter({hasText: 'Roles'})
    .first();

  if ((await rolesGroup.count()) === 0) {
    // Roles field is hidden for users without 'role' access, nothing to do.
    return;
  }

  // Mantine's MultiSelect spreads unrecognized props (including data-testid)
  // directly onto the underlying <input> element, not onto a wrapper, so the
  // testid locator IS the input - no further descendant lookup is needed.
  const rolesInput = rolesGroup.locator('[data-testid="multi-select"]').first();
  await expect(rolesInput).toBeVisible();
  await rolesInput.click();

  const option = page.getByRole('option', {name: roleName, exact: true});
  await expect(option).toBeVisible();
  await option.click();
  await page.keyboard.press('Escape');

  await expect(rolesGroup.getByText(roleName, {exact: true})).toBeVisible();
};

// Saves the currently open user create/edit dialog.
//
// Creating a user without a role triggers a 'User without a role' confirmation
// dialog whose confirm action only re-arms the form; the actual save only
// happens on a *second* click of the dialog's save button. Whether that second
// save succeeds depends on the account's permissions, so relying on this path
// for test setup is flaky (a rejected save leaves both the confirmation dialog
// and the parent dialog open, blocking every later click on the page).
// Callers should prefer selecting a real role (see `selectRole`) so this
// confirmation never appears; the handling below only remains as a safety net.
const saveUserDialog = async (page: Page) => {
  const userDialog = page
    .getByRole('dialog')
    .filter({has: page.locator('input[name="name"]')})
    .first();
  const saveButton = userDialog.getByTestId('dialog-save-button');

  await saveButton.click();

  const confirmationDialog = page.getByTestId('confirmation-dialog').first();
  const confirmationShown = await confirmationDialog
    .isVisible()
    .catch(() => false);

  if (confirmationShown) {
    await confirmationDialog.getByTestId('dialog-save-button').click();
    await expect(confirmationDialog).toHaveCount(0);
    await saveButton.click();
  }

  // Fail fast and with a clear location here if the dialog (or a stray
  // confirmation dialog) is still open, rather than leaving a Mantine modal
  // overlay in the DOM that causes unrelated clicks later on to time out.
  await expect(page.getByRole('dialog')).toHaveCount(0);
};

const openListCreateDialog = async (page: Page) => {
  const createButton = page.getByTitle('New User').first();
  await expect(createButton).toBeVisible();

  await createButton.click();
  await expect(page.getByRole('dialog').first()).toBeVisible();
};

const openDetailsCreateDialog = async (page: Page) => {
  const preferred = page.getByTitle('Create new User').first();
  const fallback = page.getByTitle('New User').first();
  let clicked = false;

  if ((await preferred.count()) > 0 && (await preferred.isVisible())) {
    await preferred.click();
    clicked = true;
  } else if ((await fallback.count()) > 0 && (await fallback.isVisible())) {
    await fallback.click();
    clicked = true;
  }
  expect(clicked).toBe(true);

  await expect(page.getByRole('dialog').first()).toBeVisible();
};

const createUserFromCurrentPage = async (
  page: Page,
  userName: string,
  newPassword: string = passwordDefault,
  roleName: string = 'Admin',
) => {
  await expect(page.locator('input[name="name"]')).toBeVisible();
  await page.locator('input[name="name"]').fill(userName);
  await page.locator('input[name="password"]').fill(newPassword);
  // Assign a real role so the flaky 'user without a role' confirmation dialog
  // is never exercised as part of test setup.
  await selectRole(page, roleName);
  await saveUserDialog(page);

  const powerFilterInput = getPowerFilterInput(page);
  const hasPowerFilter =
    (await powerFilterInput.count()) > 0 &&
    (await powerFilterInput
      .first()
      .isVisible()
      .catch(() => false));

  if (hasPowerFilter) {
    await applyFilter(page, `name=${userName}`);
    await expect(rowByUserName(page, userName)).toBeVisible();
  } else {
    await expect(page).toHaveURL(/\/user\//);
  }
};

const deleteSingleUserFromList = async (page: Page, userName: string) => {
  await applyFilter(page, `name=${userName}`);
  const row = rowByUserName(page, userName);
  await expect(row).toBeVisible();

  const deleteButton = row.getByTitle('Delete User').first();
  await expect(deleteButton).toBeVisible();

  await deleteButton.click();

  const deleteDialog = page.getByRole('dialog').first();
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByTestId('dialog-save-button').click();

  await expect(rowsByUserName(page, userName)).toHaveCount(0);
};

const openUserDetails = async (page: Page, userName: string) => {
  const powerFilterInput = getPowerFilterInput(page);
  const hasPowerFilter =
    (await powerFilterInput.count()) > 0 &&
    (await powerFilterInput
      .first()
      .isVisible()
      .catch(() => false));

  if (!hasPowerFilter) {
    await gotoUsersPage(page);
    await ensureUsersListAccess(page);
  }

  await applyFilter(page, `name=${userName}`);
  await openUserDetailsFromListRow(page, userName);
  await expect(page).toHaveURL(/\/user\//);
  await expect(page).toHaveURL(/\/user\//);
};

const closeTopDialog = async (page: Page) => {
  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();

  const testIdClose = dialog.getByTestId('dialog-close-button').first();
  if (
    (await testIdClose.count()) > 0 &&
    (await testIdClose.isVisible().catch(() => false))
  ) {
    await testIdClose.click();
    return;
  }

  const fallbackClose = dialog.getByRole('button', {name: /close|cancel/i});
  await expect(fallbackClose.first()).toBeVisible();
  await fallbackClose.first().click();
};

const getSortStateMarker = async (sortButton: Locator) => {
  const marker = sortButton.locator('span[title]').first();
  await expect(marker).toBeVisible();
  return (await marker.getAttribute('title')) ?? '';
};

const getAppliedFilterText = async (page: Page) => {
  const appliedFilter = page.getByText(/\(Applied filter:/).first();
  await expect(appliedFilter).toBeVisible();
  return appliedFilter.innerText();
};

const getAppliedSortExpression = async (page: Page) => {
  const text = await getAppliedFilterText(page);
  const sortRegex = /\bsort(?:-reverse)?=[^\s)]+/;
  const match = sortRegex.exec(text);
  return match?.[0] ?? '';
};

const getVisibleUserNames = async (page: Page) => {
  const rows = page.getByRole('row');
  const rowCount = await rows.count();
  const names: string[] = [];

  for (let index = 0; index < rowCount; index += 1) {
    const row = rows.nth(index);
    const cells = row.getByRole('cell');
    if ((await cells.count()) < 6) {
      continue;
    }

    const rawName = await cells.nth(0).innerText();
    const normalized = rawName
      .replaceAll('View Other Icon', '')
      .replace(/\s+/g, ' ')
      .trim();
    names.push(normalized);
  }

  return names;
};

const isAscending = (values: string[]) =>
  values.every(
    (value, index) =>
      index === 0 ||
      values[index - 1].localeCompare(value, undefined, {
        sensitivity: 'base',
      }) <= 0,
  );

const isDescending = (values: string[]) =>
  values.every(
    (value, index) =>
      index === 0 ||
      values[index - 1].localeCompare(value, undefined, {
        sensitivity: 'base',
      }) >= 0,
  );

export {
  username,
  password,
  passwordDefault,
  sortableHeaders,
  sortFieldByHeader,
  createUniqueUserName,
  login,
  gotoUsersPage,
  ensureUsersListAccess,
  getPowerFilterInput,
  applyFilter,
  resetFilter,
  rowByUserName,
  rowsByUserName,
  userLinkByName,
  openUserDetailsFromListRow,
  selectRole,
  saveUserDialog,
  openListCreateDialog,
  openDetailsCreateDialog,
  createUserFromCurrentPage,
  deleteSingleUserFromList,
  openUserDetails,
  closeTopDialog,
  getSortStateMarker,
  getAppliedFilterText,
  getAppliedSortExpression,
  getVisibleUserNames,
  isAscending,
  isDescending,
};
