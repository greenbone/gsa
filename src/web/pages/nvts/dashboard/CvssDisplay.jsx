/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {NvtsSeverityLoader} from 'web/pages/nvts/dashboard/Loaders';

export const NvtsCvssDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of NVTs'),
  title: ({data: tdata}) =>
    _('NVTs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: NVTS_FILTER_FILTER,
  displayId: 'nvt-by-cvss',
  displayName: 'NvtsCvssDisplay',
});

export const NvtsCvssTableDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of NVTs')],
  title: ({data: tdata}) =>
    _('NVTs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: NVTS_FILTER_FILTER,
  displayId: 'nvt-by-cvss-table',
  displayName: 'NvtsCvssTableDisplay',
});

registerDisplay(NvtsCvssDisplay.displayId, NvtsCvssDisplay, {
  title: _l('Chart: NVTs by CVSS'),
});

registerDisplay(NvtsCvssTableDisplay.displayId, NvtsCvssTableDisplay, {
  title: _l('Table: NVTs by CVSS'),
});
