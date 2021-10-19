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

import {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {DfnCertSeverityLoader} from './loaders';

export const DfnCertCvssDisplay = createDisplay({
  loaderComponent: DfnCertSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of DFN-CERT Advs'),
  title: ({data: tdata}) =>
    _('DFN-CERT Advisories by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: DFNCERT_FILTER_FILTER,
  displayId: 'dfn_cert_adv-by-cvss',
  displayName: 'DfnCertCvssDisplay',
});

export const DfnCertCvssTableDisplay = createDisplay({
  loaderComponent: DfnCertSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of DFN-CERT Advisories')],
  title: ({data: tdata}) =>
    _('DFN-CERT Advisories by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: DFNCERT_FILTER_FILTER,
  displayId: 'dfn_cert_adv-by-cvss-table',
  displayName: 'DfnCertCvssTableDisplay',
});

registerDisplay(DfnCertCvssDisplay.displayId, DfnCertCvssDisplay, {
  title: _l('Chart: DFN-CERT Advisories by CVSS'),
});

registerDisplay(DfnCertCvssTableDisplay.displayId, DfnCertCvssTableDisplay, {
  title: _l('Table: DFN-CERT Advisories by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
