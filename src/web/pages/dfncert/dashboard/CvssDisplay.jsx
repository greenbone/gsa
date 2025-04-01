/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {DfnCertSeverityLoader} from 'web/pages/dfncert/dashboard/Loaders';

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
