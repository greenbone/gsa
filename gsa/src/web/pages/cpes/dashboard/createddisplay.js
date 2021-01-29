/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import {_, _l} from 'gmp/locale/lang';

import {CPES_FILTER_FILTER} from 'gmp/models/filter';

import Theme from 'web/utils/theme';

import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import transformCreated from 'web/components/dashboard/display/created/createdtransform'; // eslint-disable-line max-len
import CreatedDisplay from 'web/components/dashboard/display/created/createddisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {CpesCreatedLoader} from './loaders';

export const CpesCreatedDisplay = createDisplay({
  loaderComponent: CpesCreatedLoader,
  displayComponent: CreatedDisplay,
  title: () => _('CPEs by Creation Time'),
  yAxisLabel: _l('# of created CPEs'),
  y2AxisLabel: _l('Total CPEs'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created CPEs'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total CPEs'),
  },
  displayId: 'cpe-by-created',
  displayName: 'CpeCreatedDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

export const CpesCreatedTableDisplay = createDisplay({
  loaderComponent: CpesCreatedLoader,
  displayComponent: DataTableDisplay,
  title: () => _('CPEs by Creation Time'),
  dataTitles: [_l('Creation Time'), _l('# of CPEs'), _l('Total CPEs')],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayId: 'cpe-by-created-table',
  displayName: 'CpeCreatedTableDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

registerDisplay(CpesCreatedDisplay.displayId, CpesCreatedDisplay, {
  title: _l('Chart: CPEs by Creation Time'),
});

registerDisplay(CpesCreatedTableDisplay.displayId, CpesCreatedTableDisplay, {
  title: _l('Table: CPEs by Creation Time'),
});

// vim: set ts=2 sw=2 tw=80:
