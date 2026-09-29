/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformSeverityData from 'web/components/dashboard/display/severity/severity-class-transform';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {VulnerabilitiesSeverityLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

export const VulnerabilitiesSeverityDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const severityRating = gmp.settings.severityRating;
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating,
    });
    return (
      <SeverityClassDisplay
        {...props}
        data={transformedData}
        dataTitles={[_l('Severity Class'), _l('# of Vulnerabilities')]}
        title={({data}) =>
          _('Vulnerabilities by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'vuln-by-severity-class',
  displayName: 'VulnerabilitiesSeverityDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

export const VulnerabilitiesSeverityTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const severityRating = gmp.settings.severityRating;
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating,
    });
    return (
      <SeverityClassTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_l('Severity Class'), _l('# of Vulnerabilities')]}
        title={({data}) =>
          _('Vulnerabilities by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'vuln-by-severity-class-table',
  displayName: 'VulnerabilitiesSeverityTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

registerDisplay(
  VulnerabilitiesSeverityDisplay,
  _l('Chart: Vulnerabilities by Severity Class'),
);

registerDisplay(
  VulnerabilitiesSeverityTableDisplay,
  _l('Table: Vulnerabilities by Severity Class'),
);
