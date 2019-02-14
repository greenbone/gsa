/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {_, _l} from 'gmp/locale/lang';

import {SECINFO_FILTER_FILTER} from 'gmp/models/filter';

import Theme from 'web/utils/theme';

import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import transformCreated from 'web/components/dashboard/display/created/createdtransform'; // eslint-disable-line max-len
import CreatedDisplay from 'web/components/dashboard/display/created/createddisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {SecInfosCreatedLoader} from './loaders';

export const SecInfosCreatedDisplay = createDisplay({
  loaderComponent: SecInfosCreatedLoader,
  displayComponent: CreatedDisplay,
  title: () => _('SecInfo Items by Creation Time'),
  yAxisLabel: _l('# of created SecInfo Items'),
  y2AxisLabel: _l('Total SecInfo Items'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created SecInfo Items'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total SecInfo Items'),
  },
  displayId: 'allinfo-by-created',
  displayName: 'SecInfoCreatedDisplay',
  filtersFilter: SECINFO_FILTER_FILTER,
});

export const SecInfosCreatedTableDisplay = createDisplay({
  loaderComponent: SecInfosCreatedLoader,
  displayComponent: DataTableDisplay,
  title: () => _('SecInfo Items by Creation Time'),
  dataTitles: [
    _l('Creation Time'),
    _l('# of SecInfo Items'),
    _l('Total SecInfo Items'),
  ],
  dataRow: row => [row.label, row.y, row.y2],
  dataTransform: transformCreated,
  displayId: 'allinfo-by-created-table',
  displayName: 'SecInfoCreatedTableDisplay',
  filtersFilter: SECINFO_FILTER_FILTER,
});

registerDisplay(SecInfosCreatedDisplay.displayId, SecInfosCreatedDisplay, {
  title: _l('Chart: SecInfo Items by Creation Time'),
});

registerDisplay(
  SecInfosCreatedTableDisplay.displayId,
  SecInfosCreatedTableDisplay,
  {
    title: _l('Table: SecInfo Items by Creation Time'),
  },
);

// vim: set ts=2 sw=2 tw=80:
