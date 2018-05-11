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

import {RESULTS_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard2/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard2/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard2/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard2/registry';

import {ResultsSeverityLoader} from './loaders';

export const ResultsCvssDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _('# of Results'),
  title: ({data: tdata}) => _('Results by CVSS (Total: {{count}})',
    {count: tdata.total}),
  displayId: 'result-by-cvss',
  displayName: 'ResultsCvssDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

export const ResultsCvssTableDisplay = createDisplay({
  loaderComponent: ResultsSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_('Severity'), _('# of Results')],
  title: ({data: tdata}) => _('Results by CVSS (Total: {{count}})',
    {count: tdata.total}),
  displayId: 'result-by-cvss-table',
  displayName: 'ResultsCvssTableDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

registerDisplay(ResultsCvssDisplay.displayId, ResultsCvssDisplay, {
  title: _('Chart: Results by CVSS'),
});

registerDisplay(ResultsCvssTableDisplay.displayId, ResultsCvssTableDisplay, {
  title: _('Table: Results by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
