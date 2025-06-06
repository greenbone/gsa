/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CPES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {CpesSeverityLoader} from 'web/pages/cpes/dashboard/Loaders';

export const CpesCvssDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of CPEs'),
  title: ({data: tdata}) =>
    _('CPEs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: CPES_FILTER_FILTER,
  displayId: 'cpe-by-cvss',
  displayName: 'CpesCvssDisplay',
});

export const CpesCvssTableDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of CPEs')],
  title: ({data: tdata}) =>
    _('CPEs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: CPES_FILTER_FILTER,
  displayId: 'cpe-by-cvss-table',
  displayName: 'CpesCvssTableDisplay',
});

registerDisplay(CpesCvssDisplay.displayId, CpesCvssDisplay, {
  title: _l('Chart: CPEs by CVSS'),
});

registerDisplay(CpesCvssTableDisplay.displayId, CpesCvssTableDisplay, {
  title: _l('Table: CPEs by CVSS'),
});
