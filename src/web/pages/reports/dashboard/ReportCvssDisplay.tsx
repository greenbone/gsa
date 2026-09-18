/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {ReportsSeverityLoader} from 'web/pages/reports/dashboard/ReportLoaders';

export const ReportsCvssDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: props => (
    <CvssDisplay
      {...props}
      title={({data}) =>
        _('Reports by CVSS (Total: {{count}})', {count: data.total})
      }
      yLabel={_('# of Reports')}
    />
  ),
  displayId: 'report-by-cvss',
  displayName: 'ReportsCvssDisplay',
  filtersFilter: REPORTS_FILTER_FILTER,
});

export const ReportsCvssTableDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: props => (
    <CvssTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of Reports')]}
      title={({data}) =>
        _('Reports by CVSS (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'report-by-cvss-table',
  displayName: 'ReportsCvssTableDisplay',
  filtersFilter: REPORTS_FILTER_FILTER,
});

registerDisplay(ReportsCvssDisplay, _l('Chart: Reports by CVSS'));

registerDisplay(ReportsCvssTableDisplay, _l('Table: Reports by CVSS'));
