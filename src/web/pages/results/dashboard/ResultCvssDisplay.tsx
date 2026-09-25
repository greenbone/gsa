/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {ResultsSeverityLoader} from 'web/pages/results/dashboard/ResultLoaders';

export const ResultsCvssDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: props => (
    <CvssDisplay
      {...props}
      title={({data}) =>
        _('Results by CVSS (Total: {{count}})', {count: data?.total ?? 0})
      }
      yLabel={_('# of Results')}
    />
  ),
  displayId: 'result-by-cvss',
  displayName: 'ResultsCvssDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

export const ResultsCvssTableDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: props => (
    <CvssTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of Results')]}
      title={({data}) =>
        _('Results by CVSS (Total: {{count}})', {count: data?.total ?? 0})
      }
    />
  ),
  displayId: 'result-by-cvss-table',
  displayName: 'ResultsCvssTableDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

registerDisplay(ResultsCvssDisplay, _l('Chart: Results by CVSS'));

registerDisplay(ResultsCvssTableDisplay, _l('Table: Results by CVSS'));
