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

import {OVALDEFS_FILTER_FILTER} from 'gmp/models/filter';

import Theme from 'web/utils/theme';

import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import transformCreated from 'web/components/dashboard/display/created/createdtransform'; // eslint-disable-line max-len
import CreatedDisplay from 'web/components/dashboard/display/created/createddisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {OvaldefCreatedLoader} from './loaders';

export const OvaldefsCreatedDisplay = createDisplay({
  loaderComponent: OvaldefCreatedLoader,
  displayComponent: CreatedDisplay,
  title: () => _('OVAL Definitions by Creation Time'),
  yAxisLabel: _l('# of created OVAL Definitions'),
  y2AxisLabel: _l('Total OVAL Definitions'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created OVAL Defs'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total OVAL Defs'),
  },
  displayId: 'ovaldef-by-created',
  displayName: 'OvaldefsCreatedDisplay',
  filtersFilter: OVALDEFS_FILTER_FILTER,
});

export const OvaldefsCreatedTableDisplay = createDisplay({
  loaderComponent: OvaldefCreatedLoader,
  displayComponent: DataTableDisplay,
  title: () => _('OVAL Definitions by Creation Time'),
  dataRow: row => [row.label, row.y, row.y2],
  dataTitles: [
    _l('Creation Time'),
    _l('# of OVAL Defs'),
    _l('Total OVAL Defs'),
  ],
  dataTransform: transformCreated,
  displayId: 'ovaldef-by-created-table',
  displayName: 'OvaldefsCreatedTableDisplay',
  filtersFilter: OVALDEFS_FILTER_FILTER,
});

registerDisplay(
  OvaldefsCreatedTableDisplay.displayId,
  OvaldefsCreatedTableDisplay,
  {
    title: _l('Table: OVAL Definitions by Creation Time'),
  },
);

registerDisplay(OvaldefsCreatedDisplay.displayId, OvaldefsCreatedDisplay, {
  title: _l('Chart: OVAL Definitions by Creation Time'),
});

// vim: set ts=2 sw=2 tw=80:
