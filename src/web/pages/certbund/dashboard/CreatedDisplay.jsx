/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import transformCreated from 'web/components/dashboard/display/created/CreatedTransform';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {CertBundCreatedLoader} from 'web/pages/certbund/dashboard/Loaders';
import Theme from 'web/utils/Theme';

export const CertBundCreatedDisplay = createDisplay({
  loaderComponent: CertBundCreatedLoader,
  displayComponent: CreatedDisplay,
  title: () => _('CERT-Bund Advisories by Creation Time'),
  yAxisLabel: _l('# of created CERT-Bund Advisories'),
  y2AxisLabel: _l('Total CERT-Bund Advisories'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created CERT-Bund Advs'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total CERT-Bund Advs'),
  },
  displayId: 'cert_bund_adv-by-created',
  displayName: 'CertBundCreatedDisplay',
  filtersFilter: CERTBUND_FILTER_FILTER,
});

export const CertBundCreatedTableDisplay = createDisplay({
  loaderComponent: CertBundCreatedLoader,
  displayComponent: DataTableDisplay,
  title: () => _('CERT-Bund Advisories by Creation Time'),
  dataTitles: [
    _l('Creation Time'),
    _l('# of CERT-Bund Advs'),
    _l('Total CERT-Bund Advs'),
  ],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayId: 'cert_bund_adv-by-created-table',
  displayName: 'CertBundCreatedTableDisplay',
  filtersFilter: CERTBUND_FILTER_FILTER,
});

registerDisplay(
  CertBundCreatedTableDisplay.displayId,
  CertBundCreatedTableDisplay,
  {
    title: _l('Table: CERT-Bund Advisories by Creation Time'),
  },
);

registerDisplay(CertBundCreatedDisplay.displayId, CertBundCreatedDisplay, {
  title: _l('Chart: CERT-Bund Advisories by Creation Time'),
});
