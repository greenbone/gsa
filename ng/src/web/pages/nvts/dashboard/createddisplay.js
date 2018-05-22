/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import {NVTS_FILTER_FILTER} from 'gmp/models/filter';

import Theme from 'web/utils/theme';

import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import transformCreated from 'web/components/dashboard/display/created/createdtransform'; // eslint-disable-line max-len
import CreatedDisplay from 'web/components/dashboard/display/created/createddisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {NvtCreatedLoader} from './loaders';

export const NvtsCreatedDisplay = createDisplay({
  loaderComponent: NvtCreatedLoader,
  displayComponent: CreatedDisplay,
  title: ({data: tdata}) => _('NVTs by Creation Time'),
  yAxisLabel: _('# of created NVTs'),
  y2AxisLabel: _('Total NVTs'),
  xAxisLabel: _('Time'),
  yLine: {
    color: Theme.darkGreen,
    label: _('Created NVTs'),
  },
  y2Line: {
    color: Theme.darkGreen,
    dashArray: '3, 2',
    label: _('Total NVTs'),
  },
  displayId: 'nvt-by-created',
  displayName: 'NvtCreatedDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

export const NvtsCreatedTableDisplay = createDisplay({
  loaderComponent: NvtCreatedLoader,
  displayComponent: DataTableDisplay,
  title: ({data: tdata}) => _('NVTs by Creation Time'),
    dataTitles: [_('Creation Time'), _('# of NVTs'), _('Total NVTs')],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayId: 'nvt-by-created-table',
  displayName: 'nvtCreatedTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsCreatedDisplay.displayId,
  NvtsCreatedDisplay, {
    title: _('Chart: NVTs by Creation Time'),
  },
);

registerDisplay(NvtsCreatedTableDisplay.displayId,
  NvtsCreatedTableDisplay, {
    title: _('Table: NVTs by Creation Time'),
  },
);

// vim: set ts=2 sw=2 tw=80:
