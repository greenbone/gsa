/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {ReportsSeverityLoader} from 'web/pages/reports/dashboard/ReportLoaders';

export const ReportsSeverityDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: props => (
    <SeverityClassDisplay
      {...props}
      title={({data}) =>
        _('Reports by Severity Class (Total: {{count}})', {
          count: data?.total ?? 0,
        })
      }
    />
  ),
  filtersFilter: REPORTS_FILTER_FILTER,
  displayName: 'ReportsSeverityDisplay',
  displayId: 'report-by-severity-class',
});

export const ReportsSeverityTableDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: props => (
    <SeverityClassTableDisplay
      {...props}
      dataTitles={[_('Severity Class'), _('# of Reports')]}
      title={({data}) =>
        _('Reports by Severity Class (Total: {{count}})', {
          count: data?.total ?? 0,
        })
      }
    />
  ),
  filtersFilter: REPORTS_FILTER_FILTER,
  displayName: 'ReportsSeverityTableDisplay',
  displayId: 'report-by-severity-class-table',
});

registerDisplay(ReportsSeverityDisplay, _l('Chart: Reports by Severity Class'));

registerDisplay(
  ReportsSeverityTableDisplay,
  _l('Table: Reports by Severity Class'),
);
