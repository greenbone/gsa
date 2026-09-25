/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import transformCreated from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {OverridesCreatedLoader} from 'web/pages/overrides/dashboard/OverrideLoaders';
import Theme from 'web/utils/theme';

export const OverridesCreatedDisplay = createDisplay({
  loaderComponent: OverridesCreatedLoader,
  displayComponent: props => (
    <CreatedDisplay
      {...props}
      dataTransform={transformCreated}
      title={() => _('Overrides by Creation Time')}
      xAxisLabel={_('Time')}
      y2AxisLabel={_('Total Overrides')}
      y2Line={{
        color: Theme.darkGreenTransparent,
        dashArray: '3, 2',
        label: _('Total Overrides'),
      }}
      yAxisLabel={_('# of created Overrides')}
      yLine={{
        color: Theme.darkGreenTransparent,
        label: _('Created Overrides'),
      }}
    />
  ),
  displayId: 'override-by-created',
  displayName: 'OverridesCreatedDisplay',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(
  OverridesCreatedDisplay,
  _l('Chart: Overrides by Creation Time'),
);

export const OverridesCreatedTableDisplay = createDisplay({
  loaderComponent: OverridesCreatedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.label ?? '', row.y, row.y2]) ?? []
      }
      dataTitles={[
        _('Creation Time'),
        _('# of created Overrides'),
        _('Total Overrides'),
      ]}
      dataTransform={transformCreated}
      title={() => _('Overrides by Creation Time')}
    />
  ),
  displayName: 'OverridesCreatedTableDisplay',
  displayId: 'override-by-created-table',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(
  OverridesCreatedDisplay,
  _l('Chart: Overrides by Creation Time'),
);

registerDisplay(
  OverridesCreatedTableDisplay,
  _l('Table: Overrides by Creation Time'),
);
