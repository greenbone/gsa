/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CVES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformCvssData from 'web/components/dashboard/display/cvss/cvss-transform';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {CvesSeverityLoader} from 'web/pages/cves/dashboard/CveLoaders';

export const CvesCvssDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
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
          _('CVEs by CVSS (Total: {{count}})', {count: data?.total ?? 0})
        }
        yLabel={_('# of CVEs')}
      />
    );
  },
  filtersFilter: CVES_FILTER_FILTER,
  displayId: 'cve-by-cvss',
  displayName: 'CvesCvssDisplay',
});

export const CvesCvssTableDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity'), _('# of CVEs')]}
        title={({data}) =>
          _('CVEs by CVSS (Total: {{count}})', {count: data?.total ?? 0})
        }
      />
    );
  },
  filtersFilter: CVES_FILTER_FILTER,
  displayId: 'cve-by-cvss-table',
  displayName: 'CvesCvssTableDisplay',
});

registerDisplay(CvesCvssDisplay, _l('Chart: CVEs by CVSS'));

registerDisplay(CvesCvssTableDisplay, _l('Table: CVEs by CVSS'));
