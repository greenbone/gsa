/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';

import {NvtsSeverityLoader} from './Loaders';

export const NvtsSeverityClassDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('NVTs by Severity Class (Total: {{count}})', {count: tdata.total}),
  displayId: 'nvt-by-severity-class',
  displayName: 'NvtsSeverityClassDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

export const NvtsSeverityClassTableDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('NVTs by Severity Class (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('Severity Class'), _l('# of NVTs')],
  displayId: 'nvt-by-severity-table',
  displayName: 'NvtsSeverityClassTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsSeverityClassDisplay.displayId, NvtsSeverityClassDisplay, {
  title: _l('Chart: NVTs by Severity Class'),
});

registerDisplay(
  NvtsSeverityClassTableDisplay.displayId,
  NvtsSeverityClassTableDisplay,
  {
    title: _l('Table: NVTs by Severity Class'),
  },
);
