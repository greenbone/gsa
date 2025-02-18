/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import transformCreated from 'web/components/dashboard/display/created/CreatedTransform';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import Theme from 'web/utils/Theme';

import {OverridesCreatedLoader} from './Loaders';

export const OverridesCreatedDisplay = createDisplay({
  loaderComponent: OverridesCreatedLoader,
  displayComponent: CreatedDisplay,
  title: () => _('Overrides by Creation Time'),
  yAxisLabel: _l('# of created Overrides'),
  y2AxisLabel: _l('Total Overrides'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created Overrides'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total Overrides'),
  },
  displayId: 'override-by-created',
  displayName: 'OverridesCreatedDisplay',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(OverridesCreatedDisplay.displayId, OverridesCreatedDisplay, {
  title: _l('Chart: Overrides by Creation Time'),
});

export const OverridesCreatedTableDisplay = createDisplay({
  loaderComponent: OverridesCreatedLoader,
  displayComponent: DataTableDisplay,
  title: () => _('Overrides by Creation Time'),
  dataTitles: [
    _l('Creation Time'),
    _l('# of created Overrides'),
    _l('Total Overrides'),
  ],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayName: 'OverridesCreatedTableDisplay',
  displayId: 'override-by-created-table',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(OverridesCreatedDisplay.displayId, OverridesCreatedDisplay, {
  title: _l('Chart: Overrides by Creation Time'),
});

registerDisplay(
  OverridesCreatedTableDisplay.displayId,
  OverridesCreatedTableDisplay,
  {
    title: _l('Table: Overrides by Creation Time'),
  },
);
