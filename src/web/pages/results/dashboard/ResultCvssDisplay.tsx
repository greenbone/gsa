/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformCvssData from 'web/components/dashboard/display/cvss/cvss-transform';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {ResultsSeverityLoader} from 'web/pages/results/dashboard/ResultLoaders';

export const ResultsCvssDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
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
          _('Results by CVSS (Total: {{count}})', {count: data?.total ?? 0})
        }
        yLabel={_('# of Results')}
      />
    );
  },
  displayId: 'result-by-cvss',
  displayName: 'ResultsCvssDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

export const ResultsCvssTableDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity'), _('# of Results')]}
        title={({data}) =>
          _('Results by CVSS (Total: {{count}})', {count: data?.total ?? 0})
        }
      />
    );
  },
  displayId: 'result-by-cvss-table',
  displayName: 'ResultsCvssTableDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

registerDisplay(ResultsCvssDisplay, _l('Chart: Results by CVSS'));

registerDisplay(ResultsCvssTableDisplay, _l('Table: Results by CVSS'));
