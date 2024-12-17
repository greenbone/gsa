/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import PermissionDetails from './details';
import Row from './row';

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
