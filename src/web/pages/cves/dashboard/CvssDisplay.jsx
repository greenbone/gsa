/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CVES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {CvesSeverityLoader} from 'web/pages/cves/dashboard/Loaders';

export const CvesCvssDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of CVEs'),
  title: ({data: tdata}) =>
    _('CVEs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: CVES_FILTER_FILTER,
  displayId: 'cve-by-cvss',
  displayName: 'CvesCvssDisplay',
});

export const CvesCvssTableDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of CVEs')],
  title: ({data: tdata}) =>
    _('CVEs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: CVES_FILTER_FILTER,
  displayId: 'cve-by-cvss-table',
  displayName: 'CvesCvssTableDisplay',
});

registerDisplay(CvesCvssDisplay.displayId, CvesCvssDisplay, {
  title: _l('Chart: CVEs by CVSS'),
});

registerDisplay(CvesCvssTableDisplay.displayId, CvesCvssTableDisplay, {
  title: _l('Table: CVEs by CVSS'),
});
