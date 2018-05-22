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
    _('SecInfo Items by Severity Class (Total: {{count}})',
      {count: tdata.total}),
  displayId: 'allinfo-by-severity-class',
  displayName: 'SecInfoSeverityClassDisplay',
  filtersFilter: SECINFO_FILTER_FILTER,
});

export const SecInfosSeverityClassTableDisplay = createDisplay({
  loaderComponent: SecInfosSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('SecInfo Items by Severity Class (Total: {{count}})',
      {count: tdata.total}),
  dataTitles: [_('Severity Class'), _('# of SecInfo Items')],
  displayId: 'allinfo-by-severity-table',
  displayName: 'SecInfoSeverityClassTableDisplay',
  filtersFilter: SECINFO_FILTER_FILTER,
});

registerDisplay(
  SecInfosSeverityClassDisplay.displayId,
  SecInfosSeverityClassDisplay, {
    title: _('Chart: SecInfo Items by Severity Class'),
});

registerDisplay(SecInfosSeverityClassTableDisplay.displayId,
  SecInfosSeverityClassTableDisplay, {
    title: _('Table: SecInfo Items by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
