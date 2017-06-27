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
import {is_defined, map} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import SelectionType from '../utils/selectiontype.js';

import {withDashboard} from '../dashboard/dashboard.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../components/icon/helpicon.js';
import NewIcon from '../components/icon/newicon.js';

import TargetDialogContainer from '../targets/dialogcontainer.js';

import HostsCharts from './charts.js';
import HostDialog from './dialog.js';
import HostsFilterDialog from './filterdialog.js';
import HostsTable from './table.js';

import {ASSETS_FILTER_FILTER} from '../../gmp/models/filter.js';

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
  onNewHostClick: PropTypes.func,
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
    this.openCreateTargetDialog = this.openCreateTargetDialog.bind(this);
    this.openCreateTargetSelectionDialog =
      this.openCreateTargetSelectionDialog.bind(this);
    this.handleSaveHost = this.handleSaveHost.bind(this);
  }

  openHostDialog(host) {
    this.hosts_dialog.show({
      host,
      id: is_defined(host) ? host.id : undefined,
      name: is_defined(host) ? host.name : '127.0.0.1',
      comment: is_defined(host) ? host.comment : '',
    });
  }

  openCreateTargetDialog(host) {
    this._openTargetDialog(1, 'uuid=' + host.id);
  }

  openCreateTargetSelectionDialog() {
    let {entities, entitiesSelected, selectionType, filter} = this.props;

    let size;
    let filterstring;

    if (selectionType === SelectionType.SELECTION_USER) {
      let hosts = [...entitiesSelected]; // convert set to array
      size = entitiesSelected.size;
      filterstring = map(hosts, host => 'uuid=' + host.id).join(" ");

    }
    else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      size = entities.length;
      filterstring = filter.toFilterString();
    }
    else {
      let counts = entities.getCounts();
      size = counts.filtered;
      filterstring = filter.all().toFilterString();
    }
    this._openTargetDialog(size, filterstring);
  }

  _openTargetDialog(count, filterstring) {
    this.target_dialog.show({
      target_source: 'asset_hosts',
      hosts_count: count,
      hosts_filter: filterstring,
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

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onCreateTargetSelection={this.openCreateTargetSelectionDialog}
          onCreateTarget={this.openCreateTargetDialog}
          onNewHostClick={this.openHostDialog}
          onEditHost={this.openHostDialog}
        />
        <HostDialog
          ref={ref => this.hosts_dialog = ref}
          onSave={this.handleSaveHost}
        />
        <TargetDialogContainer
          ref={ref => this.target_dialog = ref}
          onSave={this.handleCreateTarget}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  selectionType: PropTypes.string,
  entities: PropTypes.collection,
  entitiesSelected: PropTypes.set,
  filter: PropTypes.filter,
  onChanged: PropTypes.func,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

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
