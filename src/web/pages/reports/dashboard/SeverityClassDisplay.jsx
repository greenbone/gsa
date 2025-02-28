/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {ReportsSeverityLoader} from 'web/pages/reports/dashboard/Loaders';

export const ReportsSeverityDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('Reports by Severity Class (Total: {{count}})', {count: tdata.total}),
  filtersFilter: REPORTS_FILTER_FILTER,
  displayName: 'ReportsSeverityDisplay',
  displayId: 'report-by-severity-class',
});

export const ReportsSeverityTableDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  filtersFilter: REPORTS_FILTER_FILTER,
  dataTitles: [_l('Severity Class'), _l('# of Reports')],
  title: ({data: tdata}) =>
    _('Reports by Severity Class (Total: {{count}})', {count: tdata.total}),
  displayName: 'ReportsSeverityTableDisplay',
  displayId: 'report-by-severity-class-table',
});

registerDisplay(ReportsSeverityDisplay.displayId, ReportsSeverityDisplay, {
  title: _l('Chart: Reports by Severity Class'),
});

registerDisplay(
  ReportsSeverityTableDisplay.displayId,
  ReportsSeverityTableDisplay,
  {
    title: _l('Table: Reports by Severity Class'),
  },
);
