/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {OS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {OperatingSystemAverageSeverityLoader} from 'web/pages/operatingsystems/dashboard/OperatingSystemLoaders';

export const OperatingSystemCvssDisplay = createDisplay({
  loaderComponent: OperatingSystemAverageSeverityLoader,
  displayComponent: props => (
    <CvssDisplay
      {...props}
      title={({data}) =>
        _('Operating Systems by CVSS (Total: {{count}})', {count: data.total})
      }
      yLabel={_('# of Vulnerabilities')}
    />
  ),
  filtersFilter: OS_FILTER_FILTER,
  displayId: 'os-by-cvss',
  displayName: 'OsCvssDisplay',
});

export const OperatingSystemCvssTableDisplay = createDisplay({
  loaderComponent: OperatingSystemAverageSeverityLoader,
  displayComponent: props => (
    <CvssTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of Operating Systems')]}
      title={({data}) =>
        _('Operating Systems by CVSS (Total: {{count}})', {count: data.total})
      }
    />
  ),
  filtersFilter: OS_FILTER_FILTER,
  displayId: 'os-by-cvss-table',
  displayName: 'OsCvssTableDisplay',
});

registerDisplay(
  OperatingSystemCvssTableDisplay,
  _l('Table: Operating Systems by CVSS'),
);

registerDisplay(
  OperatingSystemCvssDisplay,
  _l('Chart: Operating Systems by CVSS'),
);
