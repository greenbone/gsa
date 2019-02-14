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

import {OS_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {OsAverageSeverityLoader} from './loaders';

export const OsCvssDisplay = createDisplay({
  loaderComponent: OsAverageSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of Vulnerabilities'),
  title: ({data: tdata}) =>
    _('Operating Systems by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: OS_FILTER_FILTER,
  displayId: 'os-by-cvss',
  displayName: 'OsCvssDisplay',
});

export const OsCvssTableDisplay = createDisplay({
  loaderComponent: OsAverageSeverityLoader,
  displayComponent: CvssTableDisplay,
  filtersFilter: OS_FILTER_FILTER,
  dataTitles: [_l('Severity'), _l('# of Operating Systems')],
  title: ({data: tdata = {}}) =>
    _('Operating Systems by CVSS (Total: {{count}})', {count: tdata.total}),
  displayId: 'os-by-cvss-table',
  displayName: 'OsCvssTableDisplay',
});

registerDisplay(OsCvssTableDisplay.displayId, OsCvssTableDisplay, {
  title: _l('Table: Operating Systems by CVSS'),
});

registerDisplay(OsCvssDisplay.displayId, OsCvssDisplay, {
  title: _l('Chart: Operating Systems by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
