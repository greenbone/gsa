/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import AlertDetails from './details';
import Row from './row';
import {createEntitiesFooter} from '../../entities/footer';
import {createEntitiesHeader} from '../../entities/header';
import {createEntitiesTable} from '../../entities/table';
import withRowDetails from '../../entities/withRowDetails';


export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '25%',
  },
  {
    name: 'event',
    displayName: _l('Event'),
    width: '21%',
  },
  {
    name: 'condition',
    displayName: _l('Condition'),
    width: '21%',
  },
  {
    name: 'method',
    displayName: _l('Method'),
    width: '10%',
  },
  {
    name: 'filter',
    displayName: _l('Filter'),
    width: '10%',
  },
  {
    name: 'active',
    displayName: _l('Active'),
    width: '5%',
  },
];

const AlertsTable = createEntitiesTable({
  emptyTitle: _l('No alerts available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  rowDetails: withRowDetails('alert')(AlertDetails),
  footer: createEntitiesFooter({
    download: 'alerts.xml',
    span: 7,
    trash: true,
  }),
});

export default AlertsTable;

// vim: set ts=2 sw=2 tw=80:
