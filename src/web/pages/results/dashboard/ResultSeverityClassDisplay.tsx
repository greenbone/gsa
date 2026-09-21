/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {ResultsSeverityLoader} from 'web/pages/results/dashboard/ResultLoaders';

export const ResultsSeverityDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: props => (
    <SeverityClassDisplay
      {...props}
      title={({data}) =>
        _('Results by Severity Class (Total: {{count}})', {count: data.total})
      }
    />
  ),
  filtersFilter: RESULTS_FILTER_FILTER,
  displayId: 'result-by-severity-class',
  displayName: 'ResultsSeverityDisplay',
});

export const ResultsSeverityTableDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: props => (
    <SeverityClassTableDisplay
      {...props}
      dataTitles={[_('Severity Class'), _('# of Results')]}
      title={({data}) =>
        _('Results by Severity Class (Total: {{count}})', {count: data.total})
      }
    />
  ),
  filtersFilter: RESULTS_FILTER_FILTER,
  displayId: 'result-by-severity-class-table',
  displayName: 'ResultsSeverityTableDisplay',
});

registerDisplay(ResultsSeverityDisplay, _l('Chart: Results by Severity Class'));

registerDisplay(
  ResultsSeverityTableDisplay,
  _l('Table: Results by Severity Class'),
);
