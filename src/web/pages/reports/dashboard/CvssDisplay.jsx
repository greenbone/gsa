/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {ReportsSeverityLoader} from 'web/pages/reports/dashboard/Loaders';

export const ReportsCvssDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of Reports'),
  title: ({data: tdata}) =>
    _('Reports by CVSS (Total: {{count}})', {count: tdata.total}),
  displayId: 'report-by-cvss',
  displayName: 'ReportsCvssDisplay',
  filtersFilter: REPORTS_FILTER_FILTER,
});

export const ReportsCvssTableDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: CvssTableDisplay,
  yLabel: _l('# of Reports'),
  title: ({data: tdata}) =>
    _('Reports by CVSS (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('Severity'), _l('# of Reports')],
  displayId: 'report-by-cvss-table',
  displayName: 'ReportsCvssTableDisplay',
  filtersFilter: REPORTS_FILTER_FILTER,
});

registerDisplay(ReportsCvssDisplay.displayId, ReportsCvssDisplay, {
  title: _l('Chart: Reports by CVSS'),
});

registerDisplay(ReportsCvssTableDisplay.displayId, ReportsCvssTableDisplay, {
  title: _l('Table: Reports by CVSS'),
});
