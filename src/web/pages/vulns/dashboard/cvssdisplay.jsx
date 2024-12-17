/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay';  
import {registerDisplay} from 'web/components/dashboard/registry';

import {VulnsSeverityLoader} from './loaders';

export const VulnsCvssDisplay = createDisplay({
  loaderComponent: VulnsSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of Vulnerabilities'),
  title: ({data: tdata}) =>
    _('Vulnerabilities by CVSS (Total: {{count}})', {count: tdata.total}),
  displayId: 'vuln-by-cvss',
  displayName: 'VulnsCvssDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

export const VulnsCvssTableDisplay = createDisplay({
  loaderComponent: VulnsSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of Vulnerabilities')],
  title: ({data: tdata}) =>
    _('Vulnerabilities by CVSS (Total: {{count}})', {count: tdata.total}),
  displayId: 'vuln-by-cvss-table',
  displayName: 'VulnsCvssTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

registerDisplay(VulnsCvssDisplay.displayId, VulnsCvssDisplay, {
  title: _l('Chart: Vulnerabilities by CVSS'),
});

registerDisplay(VulnsCvssTableDisplay.displayId, VulnsCvssTableDisplay, {
  title: _l('Table: Vulnerabilities by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
