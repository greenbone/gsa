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

import {CPES_FILTER_FILTER} from 'gmp/models/filter';

import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay'; // eslint-disable-line max-len
import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {CpesSeverityLoader} from './loaders';

export const CpesSeverityClassDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('CPEs by Severity Class (Total: {{count}})', {count: tdata.total}),
  displayId: 'cpe-by-severity-class',
  displayName: 'CpesSeverityClassDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

export const CpesSeverityClassTableDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('CPEs by Severity Class (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('Severity Class'), _l('# of CPEs')],
  displayId: 'cpe-by-severity-table',
  displayName: 'CpesSeverityClassTableDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

registerDisplay(CpesSeverityClassDisplay.displayId, CpesSeverityClassDisplay, {
  title: _l('Chart: CPEs by Severity Class'),
});

registerDisplay(
  CpesSeverityClassTableDisplay.displayId,
  CpesSeverityClassTableDisplay,
  {
    title: _l('Table: CPEs by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
