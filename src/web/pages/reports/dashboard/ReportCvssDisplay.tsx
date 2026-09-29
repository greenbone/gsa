/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformCvssData from 'web/components/dashboard/display/cvss/cvss-transform';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {ReportsSeverityLoader} from 'web/pages/reports/dashboard/ReportLoaders';

export const ReportsCvssDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssDisplay
        {...props}
        data={transformedData}
        title={({data}) =>
          _('Reports by CVSS (Total: {{count}})', {count: data?.total ?? 0})
        }
        yLabel={_('# of Reports')}
      />
    );
  },
  displayId: 'report-by-cvss',
  displayName: 'ReportsCvssDisplay',
  filtersFilter: REPORTS_FILTER_FILTER,
});

export const ReportsCvssTableDisplay = createDisplay({
  loaderComponent: ReportsSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity'), _('# of Reports')]}
        title={({data}) =>
          _('Reports by CVSS (Total: {{count}})', {count: data?.total ?? 0})
        }
      />
    );
  },
  displayId: 'report-by-cvss-table',
  displayName: 'ReportsCvssTableDisplay',
  filtersFilter: REPORTS_FILTER_FILTER,
});

registerDisplay(ReportsCvssDisplay, _l('Chart: Reports by CVSS'));

registerDisplay(ReportsCvssTableDisplay, _l('Table: Reports by CVSS'));
