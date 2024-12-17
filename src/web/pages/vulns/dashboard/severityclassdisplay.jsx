/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay';  
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay';  
import {registerDisplay} from 'web/components/dashboard/registry';

import {VulnsSeverityLoader} from './loaders';


export const VulnsSeverityDisplay = createDisplay({
  loaderComponent: VulnsSeverityLoader,
  displayComponent: SeverityClassDisplay,
  dataTitles: [_l('Severity Class'), _l('# of Vulnerabilities')],
  title: ({data: tdata}) =>
    _('Vulnerabilities by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'vuln-by-severity-class',
  displayName: 'VulnsSeverityDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

export const VulnsSeverityTableDisplay = createDisplay({
  loaderComponent: VulnsSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  dataTitles: [_l('Severity Class'), _l('# of Vulnerabilities')],
  title: ({data: tdata}) =>
    _('Vulnerabilities by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'vuln-by-severity-class-table',
  displayName: 'VulnsSeverityTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

registerDisplay(VulnsSeverityDisplay.displayId, VulnsSeverityDisplay, {
  title: _l('Chart: Vulnerabilities by Severity Class'),
});

registerDisplay(
  VulnsSeverityTableDisplay.displayId,
  VulnsSeverityTableDisplay,
  {
    title: _l('Table: Vulnerabilities by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
