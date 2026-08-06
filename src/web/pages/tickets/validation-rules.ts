/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import {TICKET_STATUS} from 'gmp/models/ticket';
import {shouldBeNonEmpty} from 'web/components/form/useFormValidation';

type TicketStatusValue = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

interface EditTicketValues {
  status: TicketStatusValue;
  openNote: string;
  closedNote: string;
  fixedNote: string;
}

export const editTicketRules = {
  openNote: (value: string, dependencies?: EditTicketValues) =>
    dependencies?.status === 'Open' && !shouldBeNonEmpty(value)
      ? _('When changing status to "open", a "Note for Open" is required.')
      : undefined,
  closedNote: (value: string, dependencies?: EditTicketValues) =>
    dependencies?.status === 'Closed' && !shouldBeNonEmpty(value)
      ? _('When changing status to "closed", a "Note for Closed" is required.')
      : undefined,
  fixedNote: (value: string, dependencies?: EditTicketValues) =>
    dependencies?.status === 'Fixed' && !shouldBeNonEmpty(value)
      ? _('When changing status to "fixed", a "Note for Fixed" is required.')
      : undefined,
};

export const createTicketRules = {
  note: (value: string) =>
    shouldBeNonEmpty(value) ? undefined : _('Ticket note is required.'),
};
