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

import  _ from 'gmp/locale.js';

import IconDivider from '../../components/layout/icondivider.js';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import {withEntitiesContainer} from '../../entities/container.js';

import {withDashboard} from '../../components/dashboard/dashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';
import NewIcon from '../../components/icon/newicon.js';

import HostsCharts from './charts.js';
import HostsFilterDialog from './filterdialog.js';
import HostsTable from './table.js';
import withHostComponent from './withHostComponent.js';

import {ASSETS_FILTER_FILTER} from 'gmp/models/filter.js';

const ToolBarIcons = ({
  onHostCreateClick,
}, {capabilities}) => (
  <IconDivider>
    <HelpIcon page="hosts"/>
    {capabilities.mayCreate('host') &&
      <NewIcon
        title={_('New Host')}
        onClick={onHostCreateClick}/>
    }
  </IconDivider>
);

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ToolBarIcons.propTypes = {
  onHostCreateClick: PropTypes.func.isRequired,
};

const Dashboard = withDashboard(HostsCharts, {
  hideFilterSelect: true,
  configPrefId: 'd3f5f2de-a85b-43f2-a817-b127457cc8ba',
  defaultControllersString: 'host-by-severity-class|host-by-topology|' +
    'host-by-modification-time',
  defaultControllerString: 'hosts-by-cvss',
});

const Page = withHostComponent({
  onCreated: 'onChanged',
  onSaved: 'onChanged',
  onCloned: 'onChanged',
  onDeleted: 'onChanged',
})(EntitiesPage);

export default withEntitiesContainer(Page, 'host', {
  filtersFilter: ASSETS_FILTER_FILTER,
  dashboard: Dashboard,
  filterEditDialog: HostsFilterDialog,
  sectionIcon: 'host.svg',
  table: HostsTable,
  title: _('Hosts'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
