/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import Header from './header';
import Row from './row';
import ScanConfigDetails from './details';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'type',
    displayName: _l('Type'),
  },
  {
    name: 'families_total',
    displayName: _l('Families: Total'),
  },
  {
    name: 'families_trend',
    displayName: _l('Families: Trend'),
  },
  {
    name: 'nvts_total',
    displayName: _l('NVTs: Total'),
  },
  {
    name: 'nvts_trend',
    displayName: _l('NVTs: Trend'),
  },
];

const ScanConfigsTable = createEntitiesTable({
  emptyTitle: _l('No Scan Configs available'),
  header: Header,
  row: Row,
  rowDetails: withRowDetails('scanconfig')(ScanConfigDetails),
  footer: createEntitiesFooter({
    download: 'scanconfigs.xml',
    span: 7,
    trash: true,
  }),
});

export default ScanConfigsTable;

// vim: set ts=2 sw=2 tw=80:
