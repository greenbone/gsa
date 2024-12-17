/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';
import CreatedDisplay from 'web/components/dashboard/display/created/createddisplay';  
import transformCreated from 'web/components/dashboard/display/created/createdtransform';  
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay';  
import {registerDisplay} from 'web/components/dashboard/registry';
import Theme from 'web/utils/theme';

import {DfnCertsCreatedLoader} from './loaders';

export const DfnCertsCreatedDisplay = createDisplay({
  loaderComponent: DfnCertsCreatedLoader,
  displayComponent: CreatedDisplay,
  title: () => _('DFN-CERT Advisories by Creation Time'),
  yAxisLabel: _l('# of created DFN-CERT Advs'),
  y2AxisLabel: _l('Total DFN-CERT Advs'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created DFN-CERT Advs'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total DFN-CERT Advs'),
  },
  displayId: 'dfn_cert_adv-by-created',
  displayName: 'DfnCertsCreatedDisplay',
  filtersFilter: DFNCERT_FILTER_FILTER,
});

export const DfnCertsCreatedTableDisplay = createDisplay({
  loaderComponent: DfnCertsCreatedLoader,
  displayComponent: DataTableDisplay,
  title: () => _('DFN-CERT Advisories by Creation Time'),
  dataTitles: [
    _l('Creation Time'),
    _l('# of DFN-CERT Advs'),
    _l('Total DFN-CERT Advs'),
  ],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayId: 'dfn_cert_adv-by-created-table',
  displayName: 'DfnCertsCreatedTableDisplay',
  filtersFilter: DFNCERT_FILTER_FILTER,
});

registerDisplay(
  DfnCertsCreatedTableDisplay.displayId,
  DfnCertsCreatedTableDisplay,
  {
    title: _l('Table: DFN-CERT Advisories by Creation Time'),
  },
);

registerDisplay(DfnCertsCreatedDisplay.displayId, DfnCertsCreatedDisplay, {
  title: _l('Chart: DFN-CERT Advisories by Creation Time'),
});

// vim: set ts=2 sw=2 tw=80:
