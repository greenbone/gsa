/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {NvtsSeverityLoader} from 'web/pages/nvts/dashboard/NvtLoaders';

export const NvtsCvssDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: props => (
    <CvssDisplay
      {...props}
      title={({data}) =>
        _('NVTs by CVSS (Total: {{count}})', {count: data?.total ?? 0})
      }
      yLabel={_('# of NVTs')}
    />
  ),
  filtersFilter: NVTS_FILTER_FILTER,
  displayId: 'nvt-by-cvss',
  displayName: 'NvtsCvssDisplay',
});

export const NvtsCvssTableDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: props => (
    <CvssTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of NVTs')]}
      title={({data}) =>
        _('NVTs by CVSS (Total: {{count}})', {count: data?.total ?? 0})
      }
    />
  ),
  filtersFilter: NVTS_FILTER_FILTER,
  displayId: 'nvt-by-cvss-table',
  displayName: 'NvtsCvssTableDisplay',
});

registerDisplay(NvtsCvssDisplay, _l('Chart: NVTs by CVSS'));

registerDisplay(NvtsCvssTableDisplay, _l('Table: NVTs by CVSS'));
