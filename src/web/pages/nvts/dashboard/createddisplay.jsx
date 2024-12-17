/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import CreatedDisplay from 'web/components/dashboard/display/created/createddisplay';  
import transformCreated from 'web/components/dashboard/display/created/createdtransform';  
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay';  
import {registerDisplay} from 'web/components/dashboard/registry';
import Theme from 'web/utils/theme';

import {NvtCreatedLoader} from './loaders';

export const NvtsCreatedDisplay = createDisplay({
  loaderComponent: NvtCreatedLoader,
  displayComponent: CreatedDisplay,
  title: () => _('NVTs by Creation Time'),
  yAxisLabel: _l('# of created NVTs'),
  y2AxisLabel: _l('Total NVTs'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created NVTs'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total NVTs'),
  },
  displayId: 'nvt-by-created',
  displayName: 'NvtCreatedDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

export const NvtsCreatedTableDisplay = createDisplay({
  loaderComponent: NvtCreatedLoader,
  displayComponent: DataTableDisplay,
  title: () => _('NVTs by Creation Time'),
  dataTitles: [_l('Creation Time'), _l('# of NVTs'), _l('Total NVTs')],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayId: 'nvt-by-created-table',
  displayName: 'nvtCreatedTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsCreatedDisplay.displayId, NvtsCreatedDisplay, {
  title: _l('Chart: NVTs by Creation Time'),
});

registerDisplay(NvtsCreatedTableDisplay.displayId, NvtsCreatedTableDisplay, {
  title: _l('Table: NVTs by Creation Time'),
});

// vim: set ts=2 sw=2 tw=80:
