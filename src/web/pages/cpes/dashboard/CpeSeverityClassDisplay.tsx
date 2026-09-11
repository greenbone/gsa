/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CPES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {CpesSeverityLoader} from 'web/pages/cpes/dashboard/CpeLoaders';

export const CpesSeverityClassDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: props => (
    <SeverityClassDisplay
      {...props}
      title={({data}) =>
        _('CPEs by Severity Class (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'cpe-by-severity-class',
  displayName: 'CpesSeverityClassDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

export const CpesSeverityClassTableDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: props => (
    <SeverityClassTableDisplay
      {...props}
      dataTitles={[_('Severity Class'), _('# of CPEs')]}
      title={({data}) =>
        _('CPEs by Severity Class (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'cpe-by-severity-table',
  displayName: 'CpesSeverityClassTableDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

registerDisplay(CpesSeverityClassDisplay, _l('Chart: CPEs by Severity Class'));

registerDisplay(
  CpesSeverityClassTableDisplay,
  _l('Table: CPEs by Severity Class'),
);
