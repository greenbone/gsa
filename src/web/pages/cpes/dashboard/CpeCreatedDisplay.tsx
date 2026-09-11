/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CPES_FILTER_FILTER} from 'gmp/models/filter';
import transformCreated from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {CpesCreatedLoader} from 'web/pages/cpes/dashboard/CpeLoaders';
import Theme from 'web/utils/theme';

export const CpesCreatedDisplay = createDisplay({
  loaderComponent: CpesCreatedLoader,
  displayComponent: props => (
    <CreatedDisplay
      {...props}
      title={() => _('CPEs by Creation Time')}
      xAxisLabel={_('Time')}
      y2AxisLabel={_('Total CPEs')}
      y2Line={{
        color: Theme.darkGreenTransparent,
        dashArray: '3, 2',
        label: _('Total CPEs'),
      }}
      yAxisLabel={_('# of created CPEs')}
      yLine={{
        color: Theme.darkGreenTransparent,
        label: _('Created CPEs'),
      }}
    />
  ),
  displayId: 'cpe-by-created',
  displayName: 'CpeCreatedDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

export const CpesCreatedTableDisplay = createDisplay({
  loaderComponent: CpesCreatedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label ?? '', row.y, row.y2]}
      dataTitles={[_('Creation Time'), _('# of CPEs'), _('Total CPEs')]}
      dataTransform={transformCreated}
      title={() => _('CPEs by Creation Time')}
    />
  ),
  displayId: 'cpe-by-created-table',
  displayName: 'CpeCreatedTableDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

registerDisplay(CpesCreatedDisplay, _l('Chart: CPEs by Creation Time'));

registerDisplay(CpesCreatedTableDisplay, _l('Table: CPEs by Creation Time'));
