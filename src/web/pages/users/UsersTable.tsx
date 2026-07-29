/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type User from 'gmp/models/user';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import UserDetails from 'web/pages/users/UserDetails';
import UsersHeader from 'web/pages/users/UsersTableHeader';
import UsersTableRow from 'web/pages/users/UsersTableRow';

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

const UsersTable = createEntitiesTable<User>({
  emptyTitle: _l('No Users available'),
  header: UsersHeader,
  row: UsersTableRow,
  rowDetails: withRowDetails<User>('user')(UserDetails),
  footer: createEntitiesFooter({
    download: 'users.xml',
    span: 7,
    delete: true,
  }),
});

export default UsersTable;
