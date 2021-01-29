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
  openNote: function (value, dependencies) {
    let isValid;
    let error;
    if (dependencies.status === 'Open') {
      isValid = shouldBeNonEmpty(value);
      error = isValid
        ? ''
        : _('When changing status to "open", a "Note for Open" is required.');
    } else {
      isValid = true;
      error = '';
    }

    return {isValid, error};
  },
  closedNote: function (value, dependencies) {
    let isValid;
    let error;
    if (dependencies.status === 'Closed') {
      isValid = shouldBeNonEmpty(value);
      error = isValid
        ? ''
        : _(
            'When changing status to "closed", a "Note for Closed" is required.',
          );
    } else {
      isValid = true;
      error = '';
    }

    return {isValid, error};
  },
  fixedNote: function (value, dependencies) {
    let isValid;
    let error;
    if (dependencies.status === 'Fixed') {
      isValid = shouldBeNonEmpty(value);
      error = isValid
        ? ''
        : _('When changing status to "fixed", a "Note for Fixed" is required.');
    } else {
      isValid = true;
      error = '';
    }

    return {isValid, error};
  },
};

export const createTicketRules = {
  note: value => {
    const isValid = shouldBeNonEmpty(value);
    const error = isValid ? '' : _('Ticket note is required.');
    return {isValid, error};
  },
};
