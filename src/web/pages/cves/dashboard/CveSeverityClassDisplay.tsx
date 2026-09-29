/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CVES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformSeverityData from 'web/components/dashboard/display/severity/severity-class-transform';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {CvesSeverityLoader} from 'web/pages/cves/dashboard/CveLoaders';

export const CvesSeverityClassDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
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
          _('CVEs by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'cve-by-severity-class',
  displayName: 'CvesSeverityClassDisplay',
  filtersFilter: CVES_FILTER_FILTER,
});

export const CvesSeverityClassTableDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <SeverityClassTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity Class'), _('# of CVEs')]}
        title={({data}) =>
          _('CVEs by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'cve-by-severity-table',
  displayName: 'CvesSeverityClassTableDisplay',
  filtersFilter: CVES_FILTER_FILTER,
});

registerDisplay(CvesSeverityClassDisplay, _l('Chart: CVEs by Severity Class'));

registerDisplay(
  CvesSeverityClassTableDisplay,
  _l('Table: CVEs by Severity Class'),
);
