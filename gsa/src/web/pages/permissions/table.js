/* Copyright (C) 2017-2018 Greenbone Networks GmbH
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

import {createEntitiesFooter} from '../../entities/footer.js';
import {createEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import PermissionDetails from './details.js';
import Row from './row.js';

export const SORT_FIELDS = [
  ['name', _l('Name'), '16%'],
  ['description', _l('Description'), '28%'],
  ['type', _l('Resource Type'), '12%'],
  ['_resource', _l('Resource'), '12%'],
  ['subject_type', _l('Subject Type'), '12%'],
  ['_subject', _l('Subject'), '12%'],
];

const Table = createEntitiesTable({
  emptyTitle: _l('No permissions available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  rowDetails: withRowDetails('permission')(PermissionDetails),
  footer: createEntitiesFooter({
    download: 'permissions.xml',
    span: 7,
    trash: true,
  }),
});

export default Table;

// vim: set ts=2 sw=2 tw=80:
