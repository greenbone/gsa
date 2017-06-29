/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

 // DFN-CERT uses same filter dialog as CERT-Bund
import FilterDialog from '../certbund/filterdialog.js';

import EntitiesPage from '../../entities/page.js';
import {withEntitiesContainer} from '../../entities/container.js';

import {withDashboard} from '../../components/dashboard/dashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';

import DfnCertCharts from './charts.js';
import DfnCertTable from './table.js';

const ToolBarIcons = props => {
  return (
    <HelpIcon
      page="dfn_cert_advs"
      title={_('Help: DFN-CERT Advisories')}/>
  );
};

const Dashboard = withDashboard(DfnCertCharts, {
  hideFilterSelect: true,
  configPrefId: '9812ea49-682d-4f99-b3cc-eca051d1ce59',
  defaultControllersString: 'dfn_cert_adv-by-severity-class|' +
    'dfn_cert_adv-by-created|dfn_cert_adv-by-cvss',
  defaultControllerString: 'dfn_cert_adv-by-cvss',
});

export default withEntitiesContainer(EntitiesPage, 'dfncertadv', {
  dashboard: Dashboard,
  filterEditDialog: FilterDialog,
  sectionIcon: 'dfn_cert_adv.svg',
  table: DfnCertTable,
  title: _('DFN-CERT Advisories'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
