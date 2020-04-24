/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {_} from 'gmp/locale/lang';

import {shouldBeNonEmpty} from 'web/components/form/useFormValidation';

export const editTicketRules = {
  openNote: function (value, dependencies) {
    let validity;
    let error;
    if (dependencies.status === 'Open') {
      validity = shouldBeNonEmpty(value);
      error = validity
        ? ''
        : _('If changing status to Open, Open Note is required');
    } else {
      validity = true;
      error = '';
    }

    return {validity, error};
  },
  closedNote: function (value, dependencies) {
    let validity;
    let error;
    if (dependencies.status === 'Closed') {
      validity = shouldBeNonEmpty(value);
      error = validity
        ? ''
        : _('If changing status to Closed, Close Note is required');
    } else {
      validity = true;
      error = '';
    }

    return {validity, error};
  },
  fixedNote: function (value, dependencies) {
    let validity;
    let error;
    if (dependencies.status === 'Fixed') {
      validity = shouldBeNonEmpty(value);
      error = validity
        ? ''
        : _('If changing status to Fixed, Fixed Note is required');
    } else {
      validity = true;
      error = '';
    }

    return {validity, error};
  },
};

export const createTicketRules = {
  note: value => {
    const validity = shouldBeNonEmpty(value);
    const error = validity ? '' : _('Ticket note is required.');
    return {validity, error};
  },
};
