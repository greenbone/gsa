/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {CertBundSeverityLoader} from 'web/pages/certbund/dashboard/CertBundLoaders';

export const CertBundCvssDisplay = createDisplay({
  loaderComponent: CertBundSeverityLoader,
  displayComponent: props => (
    <CvssDisplay
      {...props}
      title={({data}) =>
        _('CERT-Bund Advisories by CVSS (Total: {{count}})', {
          count: data.total,
        })
      }
      yLabel={_('# of CERT-Bund Advs')}
    />
  ),
  filtersFilter: CERTBUND_FILTER_FILTER,
  displayId: 'cert_bund_adv-by-cvss',
  displayName: 'CertBundCvssDisplay',
});

export const CertBundCvssTableDisplay = createDisplay({
  loaderComponent: CertBundSeverityLoader,
  displayComponent: props => (
    <CvssTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of CERT-Bund Advisories')]}
      title={({data}) =>
        _('CERT-Bund Advisories by CVSS (Total: {{count}})', {
          count: data.total,
        })
      }
    />
  ),
  filtersFilter: CERTBUND_FILTER_FILTER,
  displayId: 'cert_bund_adv-by-cvss-table',
  displayName: 'CertBundCvssTableDisplay',
});

registerDisplay(CertBundCvssDisplay, _l('Chart: CERT-Bund Advisories by CVSS'));

registerDisplay(
  CertBundCvssTableDisplay,
  _l('Table: CERT-Bund Advisories by CVSS'),
);
