/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {NvtsSeverityLoader} from 'web/pages/nvts/dashboard/NvtLoaders';

export const NvtsSeverityClassDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: props => (
    <SeverityClassDisplay
      {...props}
      title={({data}) =>
        _('NVTs by Severity Class (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'nvt-by-severity-class',
  displayName: 'NvtsSeverityClassDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

export const NvtsSeverityClassTableDisplay = createDisplay({
  loaderComponent: NvtsSeverityLoader,
  displayComponent: props => (
    <SeverityClassTableDisplay
      {...props}
      dataTitles={[_('Severity Class'), _('# of NVTs')]}
      title={({data}) =>
        _('NVTs by Severity Class (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'nvt-by-severity-table',
  displayName: 'NvtsSeverityClassTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsSeverityClassDisplay, _l('Chart: NVTs by Severity Class'));

registerDisplay(
  NvtsSeverityClassTableDisplay,
  _l('Table: NVTs by Severity Class'),
);
