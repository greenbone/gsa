/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Role from 'gmp/models/role';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import Header, {type HeaderProps} from 'web/pages/groups/Header';
import RoleDetails from 'web/pages/roles/RoleDetails';
import RoleTableRow, {
  type RoleTableRowProps,
} from 'web/pages/roles/RoleTableRow';

const RolesTable = createEntitiesTable<
  Role,
  CreateEntitiesFooterProps<Role>,
  HeaderProps,
  RoleTableRowProps
>({
  emptyTitle: _l('No Roles available'),
  header: Header,
  row: RoleTableRow,
  rowDetails: withRowDetails<Role>('role')(RoleDetails),
  footer: createEntitiesFooter<Role>({
    download: 'roles.xml',
    span: 7,
    trash: true,
  }),
});

export default RolesTable;
