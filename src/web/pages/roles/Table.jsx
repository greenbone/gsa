/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import Header from 'web/pages/groups/Header';
import RoleDetails from 'web/pages/roles/Details';
import Row from 'web/pages/roles/Row';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '92%',
  },
];

const RolesTable = createEntitiesTable({
  emptyTitle: _l('No Roles available'),
  header: Header,
  row: Row,
  rowDetails: withRowDetails('role')(RoleDetails),
  footer: createEntitiesFooter({
    download: 'roles.xml',
    span: 7,
    trash: true,
  }),
});

export default RolesTable;
