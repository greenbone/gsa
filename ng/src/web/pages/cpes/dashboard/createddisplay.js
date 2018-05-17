/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.watekamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import _ from 'gmp/locale';

import {CPES_FILTER_FILTER} from 'gmp/models/filter';

import Theme from 'web/utils/theme';

import DataTableDisplay from 'web/components/dashboard2/display/datatabledisplay'; // eslint-disable-line max-len
import transformCreated from 'web/components/dashboard2/display/created/createdtransform'; // eslint-disable-line max-len
import CreatedDisplay from 'web/components/dashboard2/display/created/createddisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard2/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard2/registry';

import {CpesCreatedLoader} from './loaders';

export const CpesCreatedDisplay = createDisplay({
  loaderComponent: CpesCreatedLoader,
  displayComponent: CreatedDisplay,
  title: ({data: tdata}) => _('CPEs by Creation Time'),
  yAxisLabel: _('# of created CPEs'),
  y2AxisLabel: _('Total CPEs'),
  xAxisLabel: _('Time'),
  yLine: {
    color: Theme.darkGreen,
    label: _('Created CPEs'),
  },
  y2Line: {
    color: Theme.darkGreen,
    dashArray: '3, 2',
    label: _('Total CPEs'),
  },
  displayId: 'cpe-by-created',
  displayName: 'CpeCreatedDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

export const CpesCreatedTableDisplay = createDisplay({
  loaderComponent: CpesCreatedLoader,
  displayComponent: DataTableDisplay,
  title: ({data: tdata}) => _('CPEs by Creation Time'),
    dataTitles: [_('Creation Time'), _('# of CPEs'), _('Total CPEs')],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayId: 'cpe-by-created-table',
  displayName: 'CpeCreatedTableDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

registerDisplay(CpesCreatedDisplay.displayId,
  CpesCreatedDisplay, {title: _('Chart: CPEs by Creation Time')});

registerDisplay(CpesCreatedTableDisplay.displayId,
  CpesCreatedTableDisplay, {title: _('Table: CPEs by Creation Time')});

// vim: set ts=2 sw=2 tw=80:
