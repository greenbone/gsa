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

import {NVTS_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {NvtsSeverityLoader} from './loaders';

export const NvtsCvssDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of NVTs'),
  title: ({data: tdata}) =>
    _('NVTs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: NVTS_FILTER_FILTER,
  displayId: 'nvt-by-cvss',
  displayName: 'NvtsCvssDisplay',
});

export const NvtsCvssTableDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of NVTs')],
  title: ({data: tdata}) =>
    _('NVTs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: NVTS_FILTER_FILTER,
  displayId: 'nvt-by-cvss-table',
  displayName: 'NvtsCvssTableDisplay',
});

registerDisplay(NvtsCvssDisplay.displayId, NvtsCvssDisplay, {
  title: _l('Chart: NVTs by CVSS'),
});

registerDisplay(NvtsCvssTableDisplay.displayId, NvtsCvssTableDisplay, {
  title: _l('Table: NVTs by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
