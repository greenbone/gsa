/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformSeverityData from 'web/components/dashboard/display/severity/severity-class-transform';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {HostsSeverityLoader} from 'web/pages/hosts/dashboard/HostsLoaders';

export const HostsSeverityClassDisplay = createDisplay({
  loaderComponent: HostsSeverityLoader,
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
          _('Hosts by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-severity-class',
  displayName: 'HostsSeverityClassDisplay',
});

export const HostsSeverityClassTableDisplay = createDisplay({
  loaderComponent: HostsSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <SeverityClassTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity Class'), _('# of Hosts')]}
        title={({data}) =>
          _('Hosts by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-severity-class-table',
  displayName: 'HostsSeverityClassTableDisplay',
});

registerDisplay(
  HostsSeverityClassDisplay,
  _l('Chart: Hosts by Severity Class'),
);
registerDisplay(
  HostsSeverityClassTableDisplay,
  _l('Table: Hosts by Severity Class'),
);
