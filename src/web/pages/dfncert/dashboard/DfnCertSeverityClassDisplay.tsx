/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformSeverityData from 'web/components/dashboard/display/severity/severity-class-transform';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {DfnCertSeverityLoader} from 'web/pages/dfncert/dashboard/DfnCertLoaders';

export const DfnCertSeverityClassDisplay = createDisplay({
  loaderComponent: DfnCertSeverityLoader,
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
          _('DFN-CERT Advisories by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'dfn_cert_adv-by-severity-class',
  displayName: 'DfnCertSeverityClassDisplay',
  filtersFilter: DFNCERT_FILTER_FILTER,
});

export const DfnCertSeverityClassTableDisplay = createDisplay({
  loaderComponent: DfnCertSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <SeverityClassTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity Class'), _('# of DFN-CERT Advs')]}
        title={({data}) =>
          _('DFN-CERT Advisories by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'dfn_cert_adv-by-severity-table',
  displayName: 'DfnCertSeverityClassTableDisplay',
  filtersFilter: DFNCERT_FILTER_FILTER,
});

registerDisplay(
  DfnCertSeverityClassDisplay,
  _l('Chart: DFN-CERT Advisories by Severity Class'),
);

registerDisplay(
  DfnCertSeverityClassTableDisplay,
  _l('Table: DFN-CERT Advisories by Severity Class'),
);
