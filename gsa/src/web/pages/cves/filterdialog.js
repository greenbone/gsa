/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {createFilterDialog} from 'web/components/powerfilter/dialog';

const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'vector',
    displayName: _l('Vector'),
  },
  {
    name: 'complexity',
    displayName: _l('Complexity'),
  },
  {
    name: 'authentication',
    displayName: _l('Authentication'),
  },
  {
    name: 'confidentiality_impact',
    displayName: _l('Confidentiality Impact'),
  },
  {
    name: 'integrity_impact',
    displayName: _l('Integrity Impact'),
  },
  {
    name: 'availability_impact',
    displayName: _l('Availability Impact'),
  },
  {
    name: 'published',
    displayName: _l('Published'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
];

export default createFilterDialog({
  sortFields: SORT_FIELDS,
});

// vim: set ts=2 sw=2 tw=80:
