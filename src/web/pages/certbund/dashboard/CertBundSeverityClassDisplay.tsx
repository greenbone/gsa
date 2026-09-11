/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {CertBundSeverityLoader} from 'web/pages/certbund/dashboard/CertBundLoaders';

export const CertBundSeverityClassDisplay = createDisplay({
  loaderComponent: CertBundSeverityLoader,
  displayComponent: props => (
    <SeverityClassDisplay
      {...props}
      title={({data}) =>
        _('CERT-Bund Advisories by Severity Class (Total: {{count}})', {
          count: data.total,
        })
      }
    />
  ),
  displayId: 'cert_bund_adv-by-severity-class',
  displayName: 'CertBundSeverityClassDisplay',
  filtersFilter: CERTBUND_FILTER_FILTER,
});

export const CertBundSeverityClassTableDisplay = createDisplay({
  loaderComponent: CertBundSeverityLoader,
  displayComponent: props => (
    <SeverityClassTableDisplay
      {...props}
      dataTitles={[_('Severity Class'), _('# of CERT-Bund Advisories')]}
      title={({data}) =>
        _('CERT-Bund Advisories by Severity Class (Total: {{count}})', {
          count: data.total,
        })
      }
    />
  ),
  displayId: 'cert_bund_adv-by-severity-table',
  displayName: 'CertBundSeverityClassTableDisplay',
  filtersFilter: CERTBUND_FILTER_FILTER,
});

registerDisplay(
  CertBundSeverityClassDisplay,
  _l('Chart: CERT-Bund Advisories by Severity Class'),
);

registerDisplay(
  CertBundSeverityClassTableDisplay,
  _l('Table: CERT-Bund Advisories by Severity Class'),
);
