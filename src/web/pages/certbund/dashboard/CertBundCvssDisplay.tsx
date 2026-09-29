/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformCvssData from 'web/components/dashboard/display/cvss/cvss-transform';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {CertBundSeverityLoader} from 'web/pages/certbund/dashboard/CertBundLoaders';

export const CertBundCvssDisplay = createDisplay({
  loaderComponent: CertBundSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssDisplay
        {...props}
        data={transformedData}
        title={({data}) =>
          _('CERT-Bund Advisories by CVSS (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
        yLabel={_('# of CERT-Bund Advs')}
      />
    );
  },
  filtersFilter: CERTBUND_FILTER_FILTER,
  displayId: 'cert_bund_adv-by-cvss',
  displayName: 'CertBundCvssDisplay',
});

export const CertBundCvssTableDisplay = createDisplay({
  loaderComponent: CertBundSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity'), _('# of CERT-Bund Advisories')]}
        title={({data}) =>
          _('CERT-Bund Advisories by CVSS (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  filtersFilter: CERTBUND_FILTER_FILTER,
  displayId: 'cert_bund_adv-by-cvss-table',
  displayName: 'CertBundCvssTableDisplay',
});

registerDisplay(CertBundCvssDisplay, _l('Chart: CERT-Bund Advisories by CVSS'));

registerDisplay(
  CertBundCvssTableDisplay,
  _l('Table: CERT-Bund Advisories by CVSS'),
);
