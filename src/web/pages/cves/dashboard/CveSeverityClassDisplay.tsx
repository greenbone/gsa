/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CVES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {CvesSeverityLoader} from 'web/pages/cves/dashboard/CveLoaders';

export const CvesSeverityClassDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: props => (
    <SeverityClassDisplay
      {...props}
      title={({data}) =>
        _('CVEs by Severity Class (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'cve-by-severity-class',
  displayName: 'CvesSeverityClassDisplay',
  filtersFilter: CVES_FILTER_FILTER,
});

export const CvesSeverityClassTableDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: props => (
    <SeverityClassTableDisplay
      {...props}
      dataTitles={[_('Severity Class'), _('# of CVEs')]}
      title={({data}) =>
        _('CVEs by Severity Class (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'cve-by-severity-table',
  displayName: 'CvesSeverityClassTableDisplay',
  filtersFilter: CVES_FILTER_FILTER,
});

registerDisplay(CvesSeverityClassDisplay, _l('Chart: CVEs by Severity Class'));

registerDisplay(
  CvesSeverityClassTableDisplay,
  _l('Table: CVEs by Severity Class'),
);
