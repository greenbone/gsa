/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CVES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay';  
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay';  
import {registerDisplay} from 'web/components/dashboard/registry';

import {CvesSeverityLoader} from './loaders';

export const CvesSeverityClassDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('CVEs by Severity Class (Total: {{count}})', {count: tdata.total}),
  displayId: 'cve-by-severity-class',
  displayName: 'CvesSeverityClassDisplay',
  filtersFilter: CVES_FILTER_FILTER,
});

export const CvesSeverityClassTableDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('CVEs by Severity Class (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('Severity Class'), _l('# of CVEs')],
  displayId: 'cve-by-severity-table',
  displayName: 'CvesSeverityClassTableDisplay',
  filtersFilter: CVES_FILTER_FILTER,
});

registerDisplay(CvesSeverityClassDisplay.displayId, CvesSeverityClassDisplay, {
  title: _l('Chart: CVEs by Severity Class'),
});

registerDisplay(
  CvesSeverityClassTableDisplay.displayId,
  CvesSeverityClassTableDisplay,
  {
    title: _l('Table: CVEs by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
