/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Permission from 'gmp/models/permission';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesHeader, {
  type CreateEntitiesHeaderProps,
} from 'web/entities/createEntitiesHeader';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import PermissionDetails from 'web/pages/permissions/PermissionDetails';
import PermissionTableRow, {
  type PermissionTableRowProps,
} from 'web/pages/permissions/PermissionTableRow';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '16%',
  },
  {
    name: 'description',
    displayName: _l('Description'),
    width: '28%',
  },
  {
    name: 'type',
    displayName: _l('Resource Type'),
    width: '12%',
  },
  {
    name: '_resource',
    displayName: _l('Resource'),
    width: '12%',
  },
  {
    name: 'subject_type',
    displayName: _l('Subject Type'),
    width: '12%',
  },
  {
    name: '_subject',
    displayName: _l('Subject'),
    width: '12%',
  },
];

const PermissionTable = createEntitiesTable<
  Permission,
  CreateEntitiesFooterProps<Permission>,
  CreateEntitiesHeaderProps,
  PermissionTableRowProps
>({
  emptyTitle: _l('No permissions available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: PermissionTableRow,
  rowDetails: withRowDetails<Permission>('permission')(PermissionDetails),
  footer: createEntitiesFooter<Permission>({
    download: 'permissions.xml',
    span: 7,
    trash: true,
  }),
});

export default PermissionTable;
