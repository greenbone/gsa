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

import {isDefined} from 'gmp/utils/identity';

import {shouldBeNonEmpty} from 'web/components/form/useFormValidation';

const validationRules = {
  name: value => {
    const validity = shouldBeNonEmpty(value);
    const error = validity ? '' : _('Missing name.');
    return {validity, error};
  },
  credential_id: value => {
    const validity = isDefined(value) && shouldBeNonEmpty(value);
    const error = validity
      ? ''
      : _(
          'Missing credential id. Choose from the dropdown or create a new credential.',
        );
    return {validity, error};
  },
  host: value => {
    const validity = shouldBeNonEmpty(value);
    const error = validity ? '' : _('Missing or invalid host.');
    return {validity, error};
  },
  port: value => {
    const validity = shouldBeNonEmpty(value.toString()); // Port is always returned as an integer from the backend.
    const error = validity ? '' : _('Missing or invalid port.');
    return {validity, error};
  },
};

export default validationRules;
