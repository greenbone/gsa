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

import {CPES_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {CpesSeverityLoader} from './loaders';

export const CpesCvssDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _('# of CPEs'),
  title: ({data: tdata}) => _('CPEs by CVSS (Total: {{count}})',
    {count: tdata.total}),
  filtersFilter: CPES_FILTER_FILTER,
  displayId: 'cpe-by-cvss',
  displayName: 'CpesCvssDisplay',
});

export const CpesCvssTableDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_('Severity'), _('# of CPEs')],
  title: ({data: tdata}) => _('CPEs by CVSS (Total: {{count}})',
    {count: tdata.total}),
  filtersFilter: CPES_FILTER_FILTER,
  displayId: 'cpe-by-cvss-table',
  displayName: 'CpesCvssTableDisplay',
});

registerDisplay(CpesCvssDisplay.displayId, CpesCvssDisplay, {
  title: _('Chart: CPEs by CVSS'),
});

registerDisplay(CpesCvssTableDisplay.displayId, CpesCvssTableDisplay, {
  title: _('Table: CPEs by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
