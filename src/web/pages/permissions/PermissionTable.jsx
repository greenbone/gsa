/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesHeader from 'web/entities/createEntitiesHeader';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import PermissionDetails from 'web/pages/permissions/PermissionDetails';
import PermissionTableRow from 'web/pages/permissions/PermissionTableRow';

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

const PermissionTable = createEntitiesTable({
  emptyTitle: _l('No permissions available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: PermissionTableRow,
  rowDetails: withRowDetails('permission')(PermissionDetails),
  footer: createEntitiesFooter({
    download: 'permissions.xml',
    span: 7,
    trash: true,
  }),
});

export default PermissionTable;
