/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {test as base, type Page} from '@playwright/test';

interface TicketFixtures {
  createdTicketIds: string[];
  registerCreatedTicket: (id: string) => void;
  cleanupCreatedTickets: void;
}

const deleteFromTrashcan = async (page: Page, id: string) => {
  await page.goto('/trashcan#ticket');

  const ticketLink = page.locator(`a[href="/ticket/${id}"]`);
  if ((await ticketLink.count()) === 0) {
    return;
  }

  const ticketRow = page.getByRole('row').filter({has: ticketLink}).first();
  await ticketRow.getByTitle('Delete').click();
  await ticketRow.waitFor({state: 'detached'});
};

const cleanupTicket = async (page: Page, id: string) => {
  await page.goto(`/ticket/${id}`);

  const deleteButton = page.getByTitle('Delete Ticket');
  if ((await deleteButton.count()) > 0) {
    await deleteButton.click();
    await page.waitForURL(/\/tickets(?:\?.*)?$/);
  }

  await deleteFromTrashcan(page, id);
};

export const test = base.extend<TicketFixtures>({
  createdTicketIds: async ({}, fixtureUse) => {
    const ids: string[] = [];
    await fixtureUse(ids);
  },

  registerCreatedTicket: async ({createdTicketIds}, fixtureUse) => {
    await fixtureUse(id => {
      if (!createdTicketIds.includes(id)) {
        createdTicketIds.push(id);
      }
    });
  },

  cleanupCreatedTickets: [
    async ({page, createdTicketIds}, use, testInfo) => {
      await use();

      for (const id of createdTicketIds) {
        try {
          await cleanupTicket(page, id);
        } catch (error) {
          console.warn(
            `Failed to clean up E2E ticket ${id} after ${testInfo.title}:`,
            error,
          );
        }
      }
    },
    {auto: true},
  ],
});

export {expect} from '@playwright/test';
