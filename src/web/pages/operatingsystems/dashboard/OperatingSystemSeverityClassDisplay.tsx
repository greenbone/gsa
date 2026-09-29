/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {OS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformSeverityData from 'web/components/dashboard/display/severity/severity-class-transform';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {OperatingSystemAverageSeverityLoader} from 'web/pages/operatingsystems/dashboard/OperatingSystemLoaders';

export const OperatingSystemSeverityClassDisplay = createDisplay({
  loaderComponent: OperatingSystemAverageSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <SeverityClassDisplay
        {...props}
        data={transformedData}
        title={({data}) =>
          _('Operating Systems by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'os-by-severity-class',
  displayName: 'OsSeverityClassDisplay',
  filtersFilter: OS_FILTER_FILTER,
});

export const OperatingSystemSeverityClassTableDisplay = createDisplay({
  loaderComponent: OperatingSystemAverageSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <SeverityClassTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity Class'), _('# of Operating Systems')]}
        title={({data}) =>
          _('Operating Systems by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'os-by-severity-table',
  displayName: 'OsSeverityClassTableDisplay',
  filtersFilter: OS_FILTER_FILTER,
});

registerDisplay(
  OperatingSystemSeverityClassDisplay,
  _l('Chart: Operating Systems by Severity Class'),
);

registerDisplay(
  OperatingSystemSeverityClassTableDisplay,
  _l('Table: Operating Systems by Severity Class'),
);
