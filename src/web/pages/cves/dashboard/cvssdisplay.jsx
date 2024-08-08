/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';

import {CVES_FILTER_FILTER} from 'gmp/models/filter';

import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {CvesSeverityLoader} from './loaders';

export const CvesCvssDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of CVEs'),
  title: ({data: tdata}) =>
    _('CVEs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: CVES_FILTER_FILTER,
  displayId: 'cve-by-cvss',
  displayName: 'CvesCvssDisplay',
});

export const CvesCvssTableDisplay = createDisplay({
  loaderComponent: CvesSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of CVEs')],
  title: ({data: tdata}) =>
    _('CVEs by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: CVES_FILTER_FILTER,
  displayId: 'cve-by-cvss-table',
  displayName: 'CvesCvssTableDisplay',
});

registerDisplay(CvesCvssDisplay.displayId, CvesCvssDisplay, {
  title: _l('Chart: CVEs by CVSS'),
});

registerDisplay(CvesCvssTableDisplay.displayId, CvesCvssTableDisplay, {
  title: _l('Table: CVEs by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
