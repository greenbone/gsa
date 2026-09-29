/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CPES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformSeverityData from 'web/components/dashboard/display/severity/severity-class-transform';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {CpesSeverityLoader} from 'web/pages/cpes/dashboard/CpeLoaders';

export const CpesSeverityClassDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
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
          _('CPEs by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'cpe-by-severity-class',
  displayName: 'CpesSeverityClassDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

export const CpesSeverityClassTableDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <SeverityClassTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity Class'), _('# of CPEs')]}
        title={({data}) =>
          _('CPEs by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'cpe-by-severity-table',
  displayName: 'CpesSeverityClassTableDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

registerDisplay(CpesSeverityClassDisplay, _l('Chart: CPEs by Severity Class'));

registerDisplay(
  CpesSeverityClassTableDisplay,
  _l('Table: CPEs by Severity Class'),
);
