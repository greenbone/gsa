/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import {shouldBeNonEmpty} from 'web/components/form/useFormValidation';

export const editTicketRules = {
  openNote: (value, dependencies) =>
    dependencies.status === 'Open' && !shouldBeNonEmpty(value)
      ? _('When changing status to "open", a "Note for Open" is required.')
      : undefined,
  closedNote: (value, dependencies) =>
    dependencies.status === 'Closed' && !shouldBeNonEmpty(value)
      ? _('When changing status to "closed", a "Note for Closed" is required.')
      : undefined,
  fixedNote: (value, dependencies) =>
    dependencies.status === 'Fixed' && !shouldBeNonEmpty(value)
      ? _('When changing status to "fixed", a "Note for Fixed" is required.')
      : undefined,
};

export const createTicketRules = {
  note: value =>
    shouldBeNonEmpty(value) ? undefined : _('Ticket note is required.'),
};
