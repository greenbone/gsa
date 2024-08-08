/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';

import {CPES_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {CpesSeverityLoader} from './loaders';

export const CpesCvssDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of CPEs'),
  title: ({data: tdata}) =>
    _('CPEs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: CPES_FILTER_FILTER,
  displayId: 'cpe-by-cvss',
  displayName: 'CpesCvssDisplay',
});

export const CpesCvssTableDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of CPEs')],
  title: ({data: tdata}) =>
    _('CPEs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: CPES_FILTER_FILTER,
  displayId: 'cpe-by-cvss-table',
  displayName: 'CpesCvssTableDisplay',
});

registerDisplay(CpesCvssDisplay.displayId, CpesCvssDisplay, {
  title: _l('Chart: CPEs by CVSS'),
});

registerDisplay(CpesCvssTableDisplay.displayId, CpesCvssTableDisplay, {
  title: _l('Table: CPEs by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
