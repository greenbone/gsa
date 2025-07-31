/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesHeader from 'web/entities/createEntitiesHeader';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import ScheduleDetails from 'web/pages/schedules/Details';
import Row from 'web/pages/schedules/Row';

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
