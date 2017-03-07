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

import _ from '../../locale.js';
import {shorten} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../icons/helpicon.js';
import Icon from '../icons/icon.js';
import NewIcon from '../icons/newicon.js';

import {PORTLISTS_FILTER_FILTER} from '../../gmp/models/filter.js';

import FilterDialog from './filterdialog.js';
import ImportPortListDialog from './importdialog.js';
import PortListDialog from './dialog.js';
import Table from './table.js';

const ToolBarIcons = ({
    onNewPortListClick,
    onImportPortListClick,
  }, {capabilities}) => {
  return (
    <Layout flex box>
      <HelpIcon
        page="port_lists"
        title={_('Help: Port Lists')}/>
      {capabilities.mayCreate('port_list') &&
        <NewIcon
          title={_('New Port List')}
          onClick={onNewPortListClick}/>
      }
      <Icon
        img="upload.svg"
        title={_('Import Port List')}
        onClick={onImportPortListClick}/>
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewPortListClick: React.PropTypes.func,
  onImportPortListClick: React.PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.openImportDialog = this.openImportDialog.bind(this);
    this.openPortListDialog = this.openPortListDialog.bind(this);
    this.handleImportPortList = this.handleImportPortList.bind(this);
    this.handleSavePortList = this.handleSavePortList.bind(this);
  }

  openPortListDialog(entity) {
    let {entityCommand} = this.props;
    if (entity) {
      entityCommand.get(entity).then(response => {
        let port_list = response.data;
        this.port_list_dialog.show({
          port_list: response.data,
          name: port_list.name,
          comment: port_list.comment,
        }, {
          title: _('Edit Port List {{name}}', {name: shorten(port_list.name)}),
        });
      });
    }
    else {
      this.port_list_dialog.show({}, {
          title: _('New Port List'),
      });
    }
  }

  openImportDialog() {
    this.import_dialog.show({
    });
  }

  handleSavePortList(data) {
    let {onChanged, entityCommand} = this.props;

    let promise;
    if (data.port_list) {
      promise = entityCommand.save(data);
    }
    else {
      promise = entityCommand.create(data);
    }
    return promise.then(() => onChanged());
  }

  handleImportPortList(data) {
    let {onChanged, entityCommand} = this.props;
    return entityCommand.import(data).then(() => onChanged());
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEditPortList={this.openPortListDialog}
          onNewPortListClick={this.openPortListDialog}
          onImportPortListClick={this.openImportDialog}
        />
        <PortListDialog
          ref={ref => this.port_list_dialog = ref}
          onSave={this.handleSavePortList}
        />
        <ImportPortListDialog
          ref={ref => this.import_dialog = ref}
          onSave={this.handleImportPortList}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: React.PropTypes.func.isRequired,
};


Page.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
};

export default withEntitiesContainer(Page, 'portlist', {
  filterEditDialog: FilterDialog,
  filtersFilter: PORTLISTS_FILTER_FILTER,
  sectionIcon: 'port_list.svg',
  table: Table,
  title: _('Port Lists'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
