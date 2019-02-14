/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {_, _l} from 'gmp/locale/lang';

import {SECINFO_FILTER_FILTER} from 'gmp/models/filter';

import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay'; // eslint-disable-line max-len
import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {SecInfosSeverityLoader} from './loaders';

export const SecInfosSeverityClassDisplay = createDisplay({
  loaderComponent: SecInfosSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('SecInfo Items by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'allinfo-by-severity-class',
  displayName: 'SecInfoSeverityClassDisplay',
  filtersFilter: SECINFO_FILTER_FILTER,
});

export const SecInfosSeverityClassTableDisplay = createDisplay({
  loaderComponent: SecInfosSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('SecInfo Items by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  dataTitles: [_l('Severity Class'), _l('# of SecInfo Items')],
  displayId: 'allinfo-by-severity-table',
  displayName: 'SecInfoSeverityClassTableDisplay',
  filtersFilter: SECINFO_FILTER_FILTER,
});

registerDisplay(
  SecInfosSeverityClassDisplay.displayId,
  SecInfosSeverityClassDisplay,
  {
    title: _l('Chart: SecInfo Items by Severity Class'),
  },
);

registerDisplay(
  SecInfosSeverityClassTableDisplay.displayId,
  SecInfosSeverityClassTableDisplay,
  {
    title: _l('Table: SecInfo Items by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
