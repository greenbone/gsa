/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';

import {RESULTS_FILTER_FILTER} from 'gmp/models/filter';

import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay'; // eslint-disable-line max-len
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {ResultsSeverityLoader} from './loaders';

export const ResultsSeverityDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('Results by Severity Class (Total: {{count}})', {count: tdata.total}),
  filtersFilter: RESULTS_FILTER_FILTER,
  displayId: 'result-by-severity-class',
  displayName: 'ResultsSeverityDisplay',
});

export const ResultsSeverityTableDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('Results by Severity Class (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('Severity Class'), _l('# of Results')],
  filtersFilter: RESULTS_FILTER_FILTER,
  displayId: 'result-by-severity-class-table',
  displayName: 'ResultsSeverityTableDisplay',
});

registerDisplay(ResultsSeverityDisplay.displayId, ResultsSeverityDisplay, {
  title: _l('Chart: Results by Severity Class'),
});

registerDisplay(
  ResultsSeverityTableDisplay.displayId,
  ResultsSeverityTableDisplay,
  {
    title: _l('Table: Results by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
