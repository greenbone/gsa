/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Page} from '@playwright/test';
import {login} from 'e2e/credentials';
import {
  createUniqueTicketNote,
  openAvailableResult,
} from 'e2e/ticket-flow-helpers';
import {expect, test} from 'e2e/tickets/ticket-fixtures';

const createTicketFromResult = async (
  page: Page,
  registerCreatedTicket: (id: string) => void,
) => {
  const resultId = await openAvailableResult(page);
  const resultHeading = page.getByText(/^Result:/).first();
  await expect(resultHeading).toBeVisible();
  const resultName = (await resultHeading.textContent())?.replace(
    /^Result:\s*/,
    '',
  );
  expect(resultName).toBeTruthy();
  await page.getByTestId('new-ticket-icon').click();

  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();

  const ticketNote = createUniqueTicketNote();
  await dialog.locator('textarea[name="note"]').fill(ticketNote);
  await dialog.getByTestId('dialog-save-button').click();

  await expect(dialog).toHaveCount(0, {timeout: 45000});
  await expect(page).toHaveURL(/\/ticket\/[^/?#]+$/);
  await expect(page.getByText(ticketNote, {exact: true})).toBeVisible();

  const id = new URL(page.url()).pathname.split('/').pop() as string;
  registerCreatedTicket(id);

  return {
    id,
    ticketNote,
    resultId,
    resultName: resultName as string,
  };
};

const openTicketListWithSelectedTicket = async (
  page: Page,
  registerCreatedTicket: (id: string) => void,
) => {
  const ticket = await createTicketFromResult(page, registerCreatedTicket);
  const ticketFilter = encodeURIComponent(
    `result_id=${ticket.resultId} sort-reverse=modified rows=10`,
  );
  await page.goto(`/tickets?filter=${ticketFilter}`);

  const selectionType = page.getByTestId('entities-footer-select');
  await selectionType.click();
  await page
    .getByRole('option', {name: 'Apply to selection', exact: true})
    .click();

  const selection = page.getByTestId(`entity-selection-${ticket.id}`);
  await expect(selection).toBeVisible();
  await selection.check();

  return ticket;
};

const openEditDialog = async (page: Page) => {
  const editButton = page.getByTitle(/Edit Ticket/).first();
  await expect(editButton).toBeVisible();
  await editButton.click();

  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();
  return dialog;
};

const editTicketStatus = async (
  page: Page,
  status: string,
  noteTitle: string,
) => {
  const dialog = await openEditDialog(page);
  await dialog.getByLabel('Status', {exact: true}).click();
  await page.getByRole('option', {name: status, exact: true}).click();

  const note = dialog.getByRole('textbox', {name: noteTitle, exact: true});
  const noteValue = createUniqueTicketNote();
  await note.fill(noteValue);
  await dialog.getByTestId('dialog-save-button').click();

  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('row', {name: `Status ${status}`, exact: true}),
  ).toBeVisible();
  await expect(page.getByText(noteValue, {exact: true})).toBeVisible();
};

test.describe('ticket edit flows', () => {
  test.describe.configure({timeout: 60000});

  test.beforeEach(async ({page, registerCreatedTicket}) => {
    await login(page);
    await createTicketFromResult(page, registerCreatedTicket);
  });

  test('edits an open ticket', async ({page}) => {
    await editTicketStatus(page, 'Open', 'Note for Open');
  });

  test('edits a fixed ticket', async ({page}) => {
    await editTicketStatus(page, 'Fixed', 'Note for Fixed');
  });

  test('edits a closed ticket', async ({page}) => {
    await editTicketStatus(page, 'Closed', 'Note for Closed');
  });

  test('requires a note for the selected status', async ({page}) => {
    const dialog = await openEditDialog(page);
    await dialog.getByLabel('Status', {exact: true}).click();
    await page.getByRole('option', {name: 'Fixed', exact: true}).click();
    await dialog
      .getByRole('textbox', {name: 'Note for Fixed', exact: true})
      .fill('');
    await dialog.getByTestId('dialog-save-button').click();

    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(
        'When changing status to "fixed", a "Note for Fixed" is required.',
      ),
    ).toBeVisible();
  });

  test('clones a ticket from the details page', async ({
    page,
    registerCreatedTicket,
  }) => {
    await page.getByTitle('Clone Ticket').click();

    await expect(page).toHaveURL(/\/ticket\/[^/?#]+$/);
    registerCreatedTicket(
      new URL(page.url()).pathname.split('/').pop() as string,
    );
    await expect(page.getByRole('heading', {name: /Ticket:/})).toBeVisible();
  });

  test('deletes a ticket from the details page', async ({page}) => {
    await page.getByTitle('Delete Ticket').click();

    await expect(page).toHaveURL(/\/tickets(?:\?.*)?$/);
  });

  test('exports a ticket from the details page', async ({page}) => {
    const exportButton = page.getByTitle('Export Ticket as XML');
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
  });
});

test.describe('ticket bulk flows', () => {
  test('exports and moves selected tickets to the trashcan', async ({
    page,
    registerCreatedTicket,
  }) => {
    await login(page);
    const firstTicket = await createTicketFromResult(
      page,
      registerCreatedTicket,
    );
    await page.getByTitle('Clone Ticket').click();
    await expect(page).toHaveURL(/\/ticket\/[^/?#]+$/);
    const secondTicket = {
      id: new URL(page.url()).pathname.split('/').pop() as string,
    };
    registerCreatedTicket(secondTicket.id);

    await page.goto('/tickets?filter=sort-reverse%3Dmodified%20rows%3D10');
    await expect(page).toHaveURL(
      /\/tickets\?filter=sort-reverse%3Dmodified%20rows%3D10$/,
    );

    const selection = page.getByTestId('entities-footer-select');
    await expect(selection).toBeVisible();
    await selection.click();
    await page.getByRole('option', {name: 'Apply to selection'}).click();

    for (const ticket of [firstTicket, secondTicket]) {
      await expect(
        page.getByTestId(`entity-selection-${ticket.id}`),
      ).toBeVisible();
      await page.getByTestId(`entity-selection-${ticket.id}`).check();
    }

    await page.getByTitle('Export selection').click();
    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);

    for (const ticket of [firstTicket, secondTicket]) {
      const ticketSelection = page.getByTestId(`entity-selection-${ticket.id}`);
      await ticketSelection.check();
      await expect(ticketSelection).toBeChecked();
    }

    await page.getByTitle('Move selection to trashcan').click();
    const confirmationDialog = page.getByRole('dialog', {
      name: 'Confirm move to trashcan',
    });
    await expect(confirmationDialog).toBeVisible();
    await confirmationDialog.getByTestId('dialog-save-button').click();

    for (const ticket of [firstTicket, secondTicket]) {
      await expect(page.locator(`a[href="/ticket/${ticket.id}"]`)).toHaveCount(
        0,
      );
    }
  });
});

test.describe('ticket list bulk actions', () => {
  test.describe.configure({timeout: 60000});

  test.beforeEach(async ({page}) => {
    await login(page);
  });

  test('downloads selected tickets', async ({page, registerCreatedTicket}) => {
    await openTicketListWithSelectedTicket(page, registerCreatedTicket);

    await page.getByTitle('Export selection').click();

    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
  });

  test('moves selected tickets to the trashcan', async ({
    page,
    registerCreatedTicket,
  }) => {
    const {id, resultName} = await openTicketListWithSelectedTicket(
      page,
      registerCreatedTicket,
    );
    const selection = page.getByTestId(`entity-selection-${id}`);
    await expect(selection).toBeChecked();

    await page.getByTitle('Move selection to trashcan').click();
    const dialog = page.getByRole('dialog', {
      name: 'Confirm move to trashcan',
    });
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('dialog-save-button').click();

    await expect(page.getByTestId(`entity-selection-${id}`)).toHaveCount(0);
    await page.goto('/trashcan#ticket');
    await expect(
      page.getByRole('heading', {name: 'Tickets', exact: true}),
    ).toBeVisible();

    await expect(
      page.getByRole('row').filter({hasText: resultName}).first(),
    ).toBeVisible();
  });
});
