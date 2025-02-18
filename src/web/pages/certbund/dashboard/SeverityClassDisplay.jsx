/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';

import {CertBundSeverityLoader} from './Loaders';

export const CertBundSeverityClassDisplay = createDisplay({
  loaderComponent: CertBundSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('CERT-Bund Advisories by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'cert_bund_adv-by-severity-class',
  displayName: 'CertBundSeverityClassDisplay',
  filtersFilter: CERTBUND_FILTER_FILTER,
});

export const CertBundSeverityClassTableDisplay = createDisplay({
  loaderComponent: CertBundSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('CERT-Bund Advisories by Severity Class (Total: {{count}})', {
      count: tdata.total,
    }),
  dataTitles: [_l('Severity Class'), _l('# of CERT-Bund Advisories')],
  displayId: 'cert_bund_adv-by-severity-table',
  displayName: 'CertBundSeverityClassTableDisplay',
  filtersFilter: CERTBUND_FILTER_FILTER,
});

registerDisplay(
  CertBundSeverityClassDisplay.displayId,
  CertBundSeverityClassDisplay,
  {
    title: _l('Chart: CERT-Bund Advisories by Severity Class'),
  },
);

registerDisplay(
  CertBundSeverityClassTableDisplay.displayId,
  CertBundSeverityClassTableDisplay,
  {
    title: _l('Table: CERT-Bund Advisories by Severity Class'),
  },
);
