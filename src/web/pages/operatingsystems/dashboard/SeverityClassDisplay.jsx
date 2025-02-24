/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {OS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {OsAverageSeverityLoader} from 'web/pages/operatingsystems/dashboard/Loaders';

export const OsSeverityClassDisplay = createDisplay({
  loaderComponent: OsAverageSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('Operating Systems by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'os-by-severity-class',
  displayName: 'OsSeverityClassDisplay',
  filtersFilter: OS_FILTER_FILTER,
});

export const OsSeverityClassTableDisplay = createDisplay({
  loaderComponent: OsAverageSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('Operating Systems by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  dataTitles: [_l('Severity Class'), _l('# of Operating Systems')],
  displayId: 'os-by-severity-table',
  displayName: 'OsSeverityClassTableDisplay',
  filtersFilter: OS_FILTER_FILTER,
});

registerDisplay(OsSeverityClassDisplay.displayId, OsSeverityClassDisplay, {
  title: _l('Chart: Operating Systems by Severity Class'),
});

registerDisplay(
  OsSeverityClassTableDisplay.displayId,
  OsSeverityClassTableDisplay,
  {
    title: _l('Table: Operating Systems by Severity Class'),
  },
);
