/* Copyright (C) 2020-2022 Greenbone AG
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

import {_l} from 'gmp/locale/lang';

const VALID_ROWSPERPAGE_ERROR_MESSAGE = _l(
  '"Rows per page" requires a value of 1 or greater.',
);

export const userSettingsRules = {
  rowsPerPage: value =>
    value > 0 ? undefined : VALID_ROWSPERPAGE_ERROR_MESSAGE,
};

// vim: set ts=2 sw=2 tw=80:
