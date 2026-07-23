/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {VulnerabilitiesSeverityLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

export const VulnerabilitiesSeverityDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: SeverityClassDisplay,
  dataTitles: [_l('Severity Class'), _l('# of Vulnerabilities')],
  title: ({data: tdata}) =>
    _('Vulnerabilities by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'vuln-by-severity-class',
  displayName: 'VulnerabilitiesSeverityDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
} as Parameters<typeof createDisplay>[0]);

export const VulnerabilitiesSeverityTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  dataTitles: [_l('Severity Class'), _l('# of Vulnerabilities')],
  title: ({data: tdata}) =>
    _('Vulnerabilities by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'vuln-by-severity-class-table',
  displayName: 'VulnerabilitiesSeverityTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
} as Parameters<typeof createDisplay>[0]);

registerDisplay(
  VulnerabilitiesSeverityDisplay.displayId,
  VulnerabilitiesSeverityDisplay,
  {
    title: _l('Chart: Vulnerabilities by Severity Class'),
  },
);

registerDisplay(
  VulnerabilitiesSeverityTableDisplay.displayId,
  VulnerabilitiesSeverityTableDisplay,
  {
    title: _l('Table: Vulnerabilities by Severity Class'),
  },
);
