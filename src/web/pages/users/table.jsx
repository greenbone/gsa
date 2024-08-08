/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import UserDetails from './details';
import Header from './header';
import Row from './row';

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
