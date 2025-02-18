/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {createEntitiesFooter} from 'web/entities/Footer';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';

import GroupDetails from './Details';
import Header from './Header';
import Row from './Row';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
];

const GroupsTable = createEntitiesTable({
  emptyTitle: _l('No Groups available'),
  header: Header,
  row: Row,
  rowDetails: withRowDetails('group')(GroupDetails),
  footer: createEntitiesFooter({
    download: 'groups.xml',
    span: 7,
    trash: true,
  }),
});

export default GroupsTable;
