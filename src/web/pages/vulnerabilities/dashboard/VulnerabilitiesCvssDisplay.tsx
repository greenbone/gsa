/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformCvssData from 'web/components/dashboard/display/cvss/cvss-transform';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {VulnerabilitiesSeverityLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

export const VulnerabilitiesCvssDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const severityRating = gmp.settings.severityRating;
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating,
    });
    return (
      <CvssDisplay
        {...props}
        data={transformedData}
        title={({data}) =>
          _('Vulnerabilities by CVSS (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
        yLabel={_l('# of Vulnerabilities')}
      />
    );
  },
  displayId: 'vuln-by-cvss',
  displayName: 'VulnerabilitiesCvssDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

export const VulnerabilitiesCvssTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const severityRating = gmp.settings.severityRating;
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating,
    });
    return (
      <CvssTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity'), _('# of Vulnerabilities')]}
        title={({data}) =>
          _('Vulnerabilities by CVSS (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'vuln-by-cvss-table',
  displayName: 'VulnerabilitiesCvssTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

registerDisplay(
  VulnerabilitiesCvssDisplay,
  _l('Chart: Vulnerabilities by CVSS'),
);

registerDisplay(
  VulnerabilitiesCvssTableDisplay,
  _l('Table: Vulnerabilities by CVSS'),
);
