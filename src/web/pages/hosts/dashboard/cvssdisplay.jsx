/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {HostsSeverityLoader} from './loaders';

export const HostsCvssDisplay = createDisplay({
  loaderComponent: HostsSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of Hosts'),
  title: ({data: tdata}) =>
    _('Hosts by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-cvss',
  displayName: 'HostsCvssDisplay',
});

export const HostsCvssTableDisplay = createDisplay({
  loaderComponent: HostsSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of Hosts')],
  title: ({data: tdata}) =>
    _('Hosts by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-cvss-table',
  displayName: 'HostsCvssTableDisplay',
});

registerDisplay(HostsCvssDisplay.displayId, HostsCvssDisplay, {
  title: _l('Chart: Hosts by CVSS'),
});

registerDisplay(HostsCvssTableDisplay.displayId, HostsCvssTableDisplay, {
  title: _l('Table: Hosts by CVSS'),
});
