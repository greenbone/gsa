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

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import {withDashboard} from '../components/dashboard/dashboard.js';

import HelpIcon from '../components/icon/helpicon.js';

import CveCharts from './charts.js';
import CveFilterDialog from './filterdialog.js';
import CvesTable from './table.js';

const ToolBarIcons = props => {
  return (
    <HelpIcon
      page="cves"
      title={_('Help: CVEs')}/>
  );
};

const Dashboard = withDashboard(CveCharts, {
  hideFilterSelect: true,
  configPrefId: '815ddd2e-8654-46c7-a05b-d73224102240',
  defaultControllersString: 'cve-by-severity-class|cve-by-created|' +
    'cve-by-cvss',
  defaultControllerString: 'cve-by-cvss',
});

export default withEntitiesContainer(EntitiesPage, 'cve', {
  dashboard: Dashboard,
  filterEditDialog: CveFilterDialog,
  sectionIcon: 'cve.svg',
  table: CvesTable,
  title: _('CVEs'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
