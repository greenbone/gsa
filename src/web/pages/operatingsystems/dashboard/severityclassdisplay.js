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

import {OS_FILTER_FILTER} from 'gmp/models/filter';

import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay'; // eslint-disable-line max-len
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {OsAverageSeverityLoader} from './loaders';

export const OsSeverityClassDisplay = createDisplay({
  loaderComponent: OsAverageSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('Operating Systems by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'os-by-severity-class',
  displayName: 'OsSeverityClassDisplay',
  filtersFilter: OS_FILTER_FILTER,
});

export const OsSeverityClassTableDisplay = createDisplay({
  loaderComponent: OsAverageSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('Operating Systems by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  dataTitles: [_l('Severity Class'), _l('# of Operating Systems')],
  displayId: 'os-by-severity-table',
  displayName: 'OsSeverityClassTableDisplay',
  filtersFilter: OS_FILTER_FILTER,
});

registerDisplay(OsSeverityClassDisplay.displayId, OsSeverityClassDisplay, {
  title: _l('Chart: Operating Systems by Severity Class'),
});

registerDisplay(
  OsSeverityClassTableDisplay.displayId,
  OsSeverityClassTableDisplay,
  {
    title: _l('Table: Operating Systems by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
