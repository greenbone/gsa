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

import  _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';

import {withDashboard} from '../dashboard/dashboard.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import HostsCharts from './charts.js';
import HostDialog from './dialog.js';
import HostsFilterDialog from './filterdialog.js';
import HostsTable from './table.js';

const ToolBarIcons = ({onNewHostClick}) => {
  return (
    <Layout flex box>
      <HelpIcon page="hosts"/>
      <NewIcon
        title={_('New Host')}
        onClick={onNewHostClick}/>
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewHostClick: React.PropTypes.func,
};

const Dashboard = withDashboard(HostsCharts, {
  hideFilterSelect: true,
  configPrefId: 'd3f5f2de-a85b-43f2-a817-b127457cc8ba',
  defaultControllersString: 'host-by-severity-class|host-by-topology|' +
    'host-by-modification-time',
  defaultControllerString: 'hosts-by-cvss',
});


class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.openHostDialog = this.openHostDialog.bind(this);
    this.handleSaveHost = this.handleSaveHost.bind(this);
    this.handleCreateTarget = this.handleCreateTarget.bind(this);
  }

  openHostDialog(host) {
    this.hosts_dialog.show({
      host,
      id: is_defined(host) ? host.id : undefined,
      name: is_defined(host) ? host.name : '127.0.0.1',
      comment: is_defined(host) ? host.comment : '',
    });
  }

  handleSaveHost(data) {
    let {gmp} = this.context;
    let {onChanged} = this.props;
    let promise;

    if (is_defined(data.host)) {
      promise = gmp.host.save(data);
    }
    else {
      promise = gmp.host.create(data);
    }
    return promise.then(() => onChanged());
  }

  handleCreateTarget(host) {
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onCreateTargetSelection={this.handleCreateTargetSelection}
          onCreateTarget={this.handleCreateTarget}
          onNewHostClick={this.openHostDialog}
          onEditHost={this.openHostDialog}
        />
        <HostDialog
          ref={ref => this.hosts_dialog = ref}
          onSave={this.handleSaveHost}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  onChanged: React.PropTypes.func,
};

Page.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default withEntitiesContainer(Page, 'hosts', {
  dashboard: Dashboard,
  filterEditDialog: HostsFilterDialog,
  sectionIcon: 'host.svg',
  table: HostsTable,
  title: _('Hosts'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
