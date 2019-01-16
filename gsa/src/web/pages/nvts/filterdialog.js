/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import {_l} from 'gmp/locale/lang';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'family',
    displayName: _l('Family'),
  },
  {
    name: 'created',
    displayName: _l('Created'),
  },
  {
    name: 'modified',
    displayName: _l('Modified'),
  },
  {
    name: 'version',
    displayName: _l('Version'),
  },
  {
    name: 'cve',
    displayName: _l('CVE'),
  },
  {
    name: 'solution_type',
    displayName: _l('Solution Type'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
  {
    name: 'qod',
    displayName: _l('QoD'),
  },
];

export default createFilterDialog({
  sortFields: SORT_FIELDS,
});

// vim: set ts=2 sw=2 tw=80:
