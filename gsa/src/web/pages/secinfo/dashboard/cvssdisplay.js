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

import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {SecInfosSeverityLoader} from './loaders';

export const SecInfosCvssDisplay = createDisplay({
  loaderComponent: SecInfosSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of SecInfo Items'),
  title: ({data: tdata}) =>
    _('SecInfo Items by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: SECINFO_FILTER_FILTER,
  displayId: 'allinfo-by-cvss',
  displayName: 'SecInfosCvssDisplay',
});

export const SecInfosCvssTableDisplay = createDisplay({
  loaderComponent: SecInfosSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of SecInfo Items')],
  title: ({data: tdata}) =>
    _('SecInfo Items by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: SECINFO_FILTER_FILTER,
  displayId: 'allinfo-by-cvss-table',
  displayName: 'SecInfoCvssTableDisplay',
});

registerDisplay(SecInfosCvssDisplay.displayId, SecInfosCvssDisplay, {
  title: _l('Chart: SecInfo Items by CVSS'),
});

registerDisplay(SecInfosCvssTableDisplay.displayId, SecInfosCvssTableDisplay, {
  title: _l('Table: SecInfo Items by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
