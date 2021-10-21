/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
