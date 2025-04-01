/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {OS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {OsAverageSeverityLoader} from 'web/pages/operatingsystems/dashboard/Loaders';

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
