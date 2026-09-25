/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import transformCreated from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {NvtCreatedLoader} from 'web/pages/nvts/dashboard/NvtLoaders';
import Theme from 'web/utils/theme';

export const NvtsCreatedDisplay = createDisplay({
  loaderComponent: NvtCreatedLoader,
  displayComponent: props => (
    <CreatedDisplay
      {...props}
      dataTransform={transformCreated}
      title={() => _('NVTs by Creation Time')}
      xAxisLabel={_('Time')}
      y2AxisLabel={_('Total NVTs')}
      y2Line={{
        color: Theme.darkGreenTransparent,
        dashArray: '3, 2',
        label: _('Total NVTs'),
      }}
      yAxisLabel={_('# of created NVTs')}
      yLine={{
        color: Theme.darkGreenTransparent,
        label: _('Created NVTs'),
      }}
    />
  ),
  displayId: 'nvt-by-created',
  displayName: 'NvtCreatedDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

export const NvtsCreatedTableDisplay = createDisplay({
  loaderComponent: NvtCreatedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.label ?? '', row.y, row.y2]) ?? []
      }
      dataTitles={[_('Creation Time'), _('# of NVTs'), _('Total NVTs')]}
      dataTransform={transformCreated}
      title={() => _('NVTs by Creation Time')}
    />
  ),
  displayId: 'nvt-by-created-table',
  displayName: 'nvtCreatedTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsCreatedDisplay, _l('Chart: NVTs by Creation Time'));

registerDisplay(NvtsCreatedTableDisplay, _l('Table: NVTs by Creation Time'));
