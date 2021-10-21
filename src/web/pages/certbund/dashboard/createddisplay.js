/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {_, _l} from 'gmp/locale/lang';

import {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';

import Theme from 'web/utils/theme';

import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import transformCreated from 'web/components/dashboard/display/created/createdtransform'; // eslint-disable-line max-len
import CreatedDisplay from 'web/components/dashboard/display/created/createddisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {CertBundCreatedLoader} from './loaders';

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

// vim: set ts=2 sw=2 tw=80:
