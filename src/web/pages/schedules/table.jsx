/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import ScheduleDetails from './details';
import Row from './row';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '30%',
  },
  {
    name: 'first_run',
    displayName: _l('First Run'),
    width: '20%',
  },
  {
    name: 'next_run',
    displayName: _l('Next Run'),
    width: '20%',
  },
  {
    name: 'period',
    displayName: _l('Recurrence'),
    width: '11%',
  },
  {
    name: 'duration',
    displayName: _l('Duration'),
    width: '11%',
  },
];

const SchedulesTable = createEntitiesTable({
  emptyTitle: _l('No schedules available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  rowDetails: withRowDetails('schedule')(ScheduleDetails),
  footer: createEntitiesFooter({
    download: 'schedules.xml',
    span: 6,
    trash: true,
  }),
});

export default SchedulesTable;

// vim: set ts=2 sw=2 tw=80:
