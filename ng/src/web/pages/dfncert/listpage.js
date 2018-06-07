/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Seffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import React from 'react';

import _ from 'gmp/locale.js';

import {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';

 // DFN-CERT uses same filter dialog as CERT-Bund
import FilterDialog from '../certbund/filterdialog.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import DashboardControls from '../../components/dashboard/controls';

import ManualIcon from '../../components/icon/manualicon.js';

import DfnCertTable from './table.js';

import DfnCertDashboard, {DFNCERT_DASHBOARD_ID} from './dashboard/index.js';

const ToolBarIcons = props => {
  return (
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="id15"
      title={_('Help: DFN-CERT Advisories')}/>
  );
};

export default withEntitiesContainer('dfncert', {
  createFilterType: 'info',
  dashboard2: DfnCertDashboard,
  dashboardControls: () => (
    <DashboardControls dashboardId={DFNCERT_DASHBOARD_ID}/>
  ),
  filterEditDialog: FilterDialog,
  filtersFilter: DFNCERT_FILTER_FILTER,
  sectionIcon: 'dfn_cert_adv.svg',
  table: DfnCertTable,
  title: _('DFN-CERT Advisories'),
  toolBarIcons: ToolBarIcons,
})(EntitiesPage);

// vim: set ts=2 sw=2 tw=80:
