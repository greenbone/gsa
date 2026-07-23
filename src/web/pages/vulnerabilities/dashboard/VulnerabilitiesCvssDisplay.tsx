/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {VulnerabilitiesSeverityLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

export const VulnerabilitiesCvssDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of Vulnerabilities'),
  title: ({data: tdata}) =>
    _('Vulnerabilities by CVSS (Total: {{count}})', {count: tdata.total}),
  displayId: 'vuln-by-cvss',
  displayName: 'VulnerabilitiesCvssDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
} as Parameters<typeof createDisplay>[0]);

export const VulnerabilitiesCvssTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of Vulnerabilities')],
  title: ({data: tdata}) =>
    _('Vulnerabilities by CVSS (Total: {{count}})', {count: tdata.total}),
  displayId: 'vuln-by-cvss-table',
  displayName: 'VulnerabilitiesCvssTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
} as Parameters<typeof createDisplay>[0]);

registerDisplay(
  VulnerabilitiesCvssDisplay.displayId,
  VulnerabilitiesCvssDisplay,
  {
    title: _l('Chart: Vulnerabilities by CVSS'),
  },
);

registerDisplay(
  VulnerabilitiesCvssTableDisplay.displayId,
  VulnerabilitiesCvssTableDisplay,
  {
    title: _l('Table: Vulnerabilities by CVSS'),
  },
);
