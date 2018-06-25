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

import {OVALDEFS_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {OvaldefSeverityLoader} from './loaders';

export const OvaldefCvssDisplay = createDisplay({
  loaderComponent: OvaldefSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _('# of OVAL Defs'),
  title: ({data: tdata}) => _('OVAL Definitions by CVSS (Total: {{count}})',
    {count: tdata.total}),
  displayId: 'ovaldef-by-cvss',
  displayName: 'OvaldefCvssDisplay',
  filtersFilter: OVALDEFS_FILTER_FILTER,
});

export const OvaldefCvssTableDisplay = createDisplay({
  loaderComponent: OvaldefSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_('Severity'), _('# of OVAL Defs')],
  title: ({data: tdata}) => _('OVAL Definitions by CVSS (Total: {{count}})',
    {count: tdata.total}),
  filtersFilter: OVALDEFS_FILTER_FILTER,
  displayId: 'ovaldef-by-cvss-table',
  displayName: 'OvaldefsCvssTableDisplay',
});

registerDisplay(OvaldefCvssDisplay.displayId, OvaldefCvssDisplay, {
  title: _('Chart: OVAL Definitions by CVSS'),
});

registerDisplay(OvaldefCvssTableDisplay.displayId, OvaldefCvssTableDisplay, {
  title: _('Table: OVAL Definitions by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
