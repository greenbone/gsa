/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformCvssData from 'web/components/dashboard/display/cvss/cvss-transform';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {DfnCertSeverityLoader} from 'web/pages/dfncert/dashboard/DfnCertLoaders';

export const DfnCertCvssDisplay = createDisplay({
  loaderComponent: DfnCertSeverityLoader,
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
          _('DFN-CERT Advisories by CVSS (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
        yLabel={_('# of DFN-CERT Advs')}
      />
    );
  },
  filtersFilter: DFNCERT_FILTER_FILTER,
  displayId: 'dfn_cert_adv-by-cvss',
  displayName: 'DfnCertCvssDisplay',
});

export const DfnCertCvssTableDisplay = createDisplay({
  loaderComponent: DfnCertSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity'), _('# of DFN-CERT Advisories')]}
        title={({data}) =>
          _('DFN-CERT Advisories by CVSS (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  filtersFilter: DFNCERT_FILTER_FILTER,
  displayId: 'dfn_cert_adv-by-cvss-table',
  displayName: 'DfnCertCvssTableDisplay',
});

registerDisplay(DfnCertCvssDisplay, _l('Chart: DFN-CERT Advisories by CVSS'));

registerDisplay(
  DfnCertCvssTableDisplay,
  _l('Table: DFN-CERT Advisories by CVSS'),
);
