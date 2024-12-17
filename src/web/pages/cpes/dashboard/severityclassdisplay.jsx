/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CPES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {CpesSeverityLoader} from './loaders';

export const CpesSeverityClassDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: SeverityClassDisplay,
  title: ({data: tdata}) =>
    _('CPEs by Severity Class (Total: {{count}})', {count: tdata.total}),
  displayId: 'cpe-by-severity-class',
  displayName: 'CpesSeverityClassDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

export const CpesSeverityClassTableDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  title: ({data: tdata}) =>
    _('CPEs by Severity Class (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_l('Severity Class'), _l('# of CPEs')],
  displayId: 'cpe-by-severity-table',
  displayName: 'CpesSeverityClassTableDisplay',
  filtersFilter: CPES_FILTER_FILTER,
});

registerDisplay(CpesSeverityClassDisplay.displayId, CpesSeverityClassDisplay, {
  title: _l('Chart: CPEs by Severity Class'),
});

registerDisplay(
  CpesSeverityClassTableDisplay.displayId,
  CpesSeverityClassTableDisplay,
  {
    title: _l('Table: CPEs by Severity Class'),
  },
);
