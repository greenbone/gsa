/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {VulnerabilitiesSeverityLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

export const VulnerabilitiesCvssDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: props => (
    <CvssDisplay
      {...props}
      title={({data}) =>
        _('Vulnerabilities by CVSS (Total: {{count}})', {
          count: data?.total ?? 0,
        })
      }
      yLabel={_l('# of Vulnerabilities')}
    />
  ),
  displayId: 'vuln-by-cvss',
  displayName: 'VulnerabilitiesCvssDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

export const VulnerabilitiesCvssTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesSeverityLoader,
  displayComponent: props => (
    <CvssTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of Vulnerabilities')]}
      title={({data}) =>
        _('Vulnerabilities by CVSS (Total: {{count}})', {
          count: data?.total ?? 0,
        })
      }
    />
  ),
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
