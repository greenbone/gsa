/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, test} from '@playwright/test';
import {login} from 'e2e/credentials';
import {assertCorrespondingTicketsLink} from 'e2e/results/result-details-helpers';
import {
  createUniqueTicketNote,
  openAvailableResult,
} from 'e2e/ticket-flow-helpers';

test.describe('result ticket flows', () => {
  test('validates and creates a ticket from a result', async ({page}) => {
    await login(page);
    const resultId = await openAvailableResult(page);

    const newTicketButton = page.getByTestId('new-ticket-icon');
    await expect(newTicketButton).toBeVisible();
    await expect(newTicketButton).toBeEnabled();
    await newTicketButton.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible();
    const note = dialog.locator('textarea[name="note"]');
    await expect(note).toBeVisible();

    await dialog.getByTestId('dialog-save-button').click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Ticket note is required.')).toBeVisible();

    const ticketNote = createUniqueTicketNote();
    await note.fill(ticketNote);
    await dialog.getByTestId('dialog-save-button').click();

    await expect(page).toHaveURL(/\/ticket\/[^/?#]+$/);
    const ticketId = new URL(page.url()).pathname.split('/').pop();
    expect(ticketId).toBeTruthy();
    await expect(page.getByRole('heading', {name: /Ticket:/})).toBeVisible();
    await expect(page.getByText(ticketNote, {exact: true})).toBeVisible();

    await page.goto(`/result/${resultId}`);
    await expect(page).toHaveURL(new RegExp(`/result/${resultId}$`));
    await assertCorrespondingTicketsLink(page, resultId);
  });
});
