/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import GroupDetails from './details';
import Header from './header';
import Row from './row';
import {createEntitiesFooter} from '../../entities/footer';
import {createEntitiesTable} from '../../entities/table';
import withRowDetails from '../../entities/withRowDetails';


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

// vim: set ts=2 sw=2 tw=80:
