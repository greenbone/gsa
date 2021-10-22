/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {_, _l} from 'gmp/locale/lang';

import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';

import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay'; // eslint-disable-line max-len
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {ReportsSeverityLoader} from './loaders';

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

// vim: set ts=2 sw=2 tw=80:
