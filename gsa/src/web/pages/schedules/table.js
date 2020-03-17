/* Copyright (C) 2017-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {_l} from 'gmp/locale/lang';

import {createEntitiesFooter} from '../../entities/footer.js';
import {createEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import ScheduleDetails from './details.js';
import Row from './row.js';

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
