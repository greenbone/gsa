/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import {createEntitiesFooter} from '../../entities/footer.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import UserDetails from './details.js';
import Header from './header.js';
import Row from './row.js';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'roles',
    displayName: _l('Roles'),
  },
  {
    name: 'groups',
    displayName: _l('Groups'),
  },
  {
    name: 'host_access',
    displayName: _l('Host Access'),
  },
  {
    name: 'ldap',
    displayName: _l('Authentication Type'),
  },
];

const UsersTable = createEntitiesTable({
  emptyTitle: _l('No Users available'),
  header: Header,
  row: Row,
  rowDetails: withRowDetails('user')(UserDetails),
  footer: createEntitiesFooter({
    download: 'users.xml',
    span: 7,
    delete: true,
  }),
});

export default UsersTable;

// vim: set ts=2 sw=2 tw=80:
