/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';

const applyCredentialFilter = async (page, expression: string) => {
  const filter = page.locator('input[name="userFilterString"]');
  await filter.fill(expression);
  await page.getByTitle('Update Filter').click();
};

test('creates and saves an Active Directory credential', async ({page}) => {
  await login(page);
  await page.goto('/credentials');
  const name = `e2e-ad-${Date.now()}`;
  const edit = (row: ReturnType<typeof page.getByRole>) =>
    row.getByTitle('Edit Credential').first();
  let created = false;

  try {
    await page.getByTitle('New Credential').click();
    const dialog = page.getByRole('dialog');
    const typeSelect = dialog.getByRole('combobox', {name: 'Type'});
    await typeSelect.click();
    const adOption = page.getByText('Active Directory', {exact: true}).last();
    if (!(await adOption.isVisible().catch(() => false))) {
      test.skip(true, 'Active Directory integration is unavailable');
    }
    await adOption.click();

    await dialog.locator('input[name="name"]').fill(name);
    await dialog.locator('input[name="adHost"]').fill('ad.example.com');
    await dialog.locator('input[name="adPort"]').fill('636');
    await dialog
      .locator('input[name="adBindDn"]')
      .fill('CN=Scanner,DC=example,DC=com');
    await dialog
      .locator('input[name="adBindPassword"]')
      .fill('e2e-bind-secret');
    await dialog.locator('input[name="adBaseDn"]').fill('DC=example,DC=com');
    const tlsMode = dialog.getByRole('combobox', {name: 'TLS Mode'});
    await tlsMode.click();
    await page.getByText('StartTLS', {exact: true}).last().click();
    await dialog
      .locator('input[name="adCaCertificate"]')
      .setInputFiles('e2e/credentials/ad-ca-certificate.pem');
    await dialog.getByTestId('dialog-save-button').click();
    created = true;
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await applyCredentialFilter(page, `name=${name}`);
    let row = page.getByRole('row', {name: new RegExp(name)}).first();
    await expect(row).toBeVisible();
    await row.getByTestId('row-details-toggle').click();
    await expect(page.getByText('CA Certificate (PEM)')).toHaveCount(0);
    await page.getByTitle('Open all details').click();
    await expect(page.getByText('Configured', {exact: true})).toBeVisible({
      timeout: 15000,
    });
    await page.goto('/credentials');
    await applyCredentialFilter(page, `name=${name}`);
    row = page.getByRole('row', {name: new RegExp(name)}).first();
    await edit(row).click();
    const editDialog = page.getByRole('dialog');
    await expect(editDialog.locator('input[name="adHost"]')).toHaveValue(
      'ad.example.com',
    );
    await expect(editDialog.locator('input[name="adPort"]')).toHaveValue('636');
    await expect(editDialog.locator('input[name="adBindDn"]')).toHaveValue(
      'CN=Scanner,DC=example,DC=com',
    );
    await expect(editDialog.locator('input[name="adBaseDn"]')).toHaveValue(
      'DC=example,DC=com',
    );
    await expect(
      editDialog.getByRole('combobox', {name: 'TLS Mode'}),
    ).toHaveValue('StartTLS');
    await expect(
      editDialog.locator('input[name="adBindPassword"]'),
    ).toHaveValue('');
    await editDialog.getByLabel('Replace existing password with').check();
    await editDialog
      .locator('input[name="adBindPassword"]')
      .fill('e2e-replaced-secret');
    await editDialog.locator('input[name="adHost"]').fill('ad2.example.com');
    await editDialog.locator('input[name="adPort"]').fill('389');
    await editDialog
      .locator('input[name="adBindDn"]')
      .fill('CN=Updated Scanner,DC=example,DC=com');
    await editDialog
      .locator('input[name="adBaseDn"]')
      .fill('OU=Scanners,DC=example,DC=com');
    await editDialog
      .locator('input[name="adCaCertificate"]')
      .setInputFiles('e2e/credentials/ad-ca-certificate.pem');
    const editTlsMode = editDialog.getByRole('combobox', {name: 'TLS Mode'});
    await editTlsMode.click();
    await page.getByText('LDAPS', {exact: true}).last().click();
    await editDialog.getByTestId('dialog-save-button').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    row = page.getByRole('row', {name: new RegExp(name)}).first();
    await edit(row).click();
    const verifyDialog = page.getByRole('dialog');
    await expect(verifyDialog.locator('input[name="adHost"]')).toHaveValue(
      'ad2.example.com',
    );
    await expect(verifyDialog.locator('input[name="adPort"]')).toHaveValue(
      '389',
    );
    await expect(verifyDialog.locator('input[name="adBindDn"]')).toHaveValue(
      'CN=Updated Scanner,DC=example,DC=com',
    );
    await expect(verifyDialog.locator('input[name="adBaseDn"]')).toHaveValue(
      'OU=Scanners,DC=example,DC=com',
    );
    await expect(
      verifyDialog.getByRole('combobox', {name: 'TLS Mode'}),
    ).toHaveValue('LDAPS');
    await expect(
      verifyDialog.locator('input[name="adBindPassword"]'),
    ).toBeDisabled();
    await verifyDialog.getByTitle('Clear input').click();
    await verifyDialog.locator('input[name="adPort"]').fill('');
    await verifyDialog.getByTestId('dialog-save-button').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    row = page.getByRole('row', {name: new RegExp(name)}).first();
    await edit(row).click();
    await expect(
      page.getByRole('dialog').locator('input[name="adPort"]'),
    ).toHaveValue('');
    await page.keyboard.press('Escape');
    await row.getByTestId('row-details-toggle').click();
    await expect(page.getByText('CA Certificate (PEM)')).toHaveCount(0);
    await page.getByTitle('Open all details').click();
    await expect(page.getByText('Not configured')).toBeVisible({
      timeout: 15000,
    });
  } finally {
    if (created) {
      await page.keyboard.press('Escape').catch(() => undefined);
      await page.goto('/credentials').catch(() => undefined);
      await applyCredentialFilter(page, `name=${name}`).catch(() => undefined);
      const row = page.getByRole('row', {name: new RegExp(name)}).first();
      if (await row.isVisible().catch(() => false)) {
        await row.getByTitle('Move Credential to trashcan').click();
      }
    }
  }
});
