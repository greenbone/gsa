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

import {OVALDEFS_FILTER_FILTER} from 'gmp/models/filter';

import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay'; // eslint-disable-line max-len
import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {OvaldefSeverityLoader} from './loaders';

export const OvaldefSeverityClassDisplay = createDisplay({
  loaderComponent: OvaldefSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('OVAL Definitions by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'ovaldef-by-severity-class',
  displayName: 'OvaldefsSeverityClassDisplay',
  filtersFilter: OVALDEFS_FILTER_FILTER,
});

export const OvaldefSeverityClassTableDisplay = createDisplay({
  loaderComponent: OvaldefSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('OVAL Definitions by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  dataTitles: [_l('Severity Class'), _l('# of OVAL Defs')],
  displayId: 'ovaldef-by-severity-table',
  displayName: 'OvaldefsSeverityClassTableDisplay',
  filtersFilter: OVALDEFS_FILTER_FILTER,
});

registerDisplay(
  OvaldefSeverityClassDisplay.displayId,
  OvaldefSeverityClassDisplay,
  {
    title: _l('Chart: Oval Definitions by Severity Class'),
  },
);

registerDisplay(
  OvaldefSeverityClassTableDisplay.displayId,
  OvaldefSeverityClassTableDisplay,
  {
    title: _l('Table: OVAL Definitions by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
