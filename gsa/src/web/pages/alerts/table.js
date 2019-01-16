/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {_l} from 'gmp/locale/lang';

import {createEntitiesFooter} from '../../entities/footer.js';
import {createEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import AlertDetails from './details.js';
import Row from './row.js';

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
