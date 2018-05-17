/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard2/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard2/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard2/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard2/registry';

import {DfnCertSeverityLoader} from './loaders';

export const DfnCertCvssDisplay = createDisplay({
  loaderComponent: DfnCertSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _('# of DFN-CERT Advs'),
  title: ({data: tdata}) => _('DFN-CERT Advisories by CVSS (Total: {{count}})',
    {count: tdata.total}),
  filtersFilter: DFNCERT_FILTER_FILTER,
  displayId: 'dfn_cert_adv-by-cvss',
  displayName: 'DfnCertCvssDisplay',
});

export const DfnCertCvssTableDisplay = createDisplay({
  loaderComponent: DfnCertSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_('Severity'), _('# of DFN-CERT Advisories')],
  title: ({data: tdata}) => _('DFN-CERT Advisories by CVSS (Total: {{count}})',
    {count: tdata.total}),
  filtersFilter: DFNCERT_FILTER_FILTER,
  displayId: 'dfn_cert_adv-by-cvss-table',
  displayName: 'DfnCertCvssTableDisplay',
});

registerDisplay(DfnCertCvssDisplay.displayId, DfnCertCvssDisplay, {
  title: _('Chart: DFN-CERT Advisories by CVSS'),
});

registerDisplay(DfnCertCvssTableDisplay.displayId, DfnCertCvssTableDisplay, {
  title: _('Table: DFN-CERT Advisories by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
