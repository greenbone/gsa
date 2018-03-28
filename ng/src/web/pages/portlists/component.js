/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {shorten} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import EntityComponent from '../../entity/component.js';

import Wrapper from '../../components/layout/wrapper.js';

import ImportPortListDialog from './importdialog.js';
import PortListsDialog from './dialog.js';
import PortRangeDialog from './portrangedialog.js';

class PortListComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      importDialogVisible: false,
      portListDialogVisible: false,
      portRangeDialogVisible: false,
    };

    this.closeImportDialog = this.closeImportDialog.bind(this);
    this.closePortListDialog = this.closePortListDialog.bind(this);
    this.closeNewPortRangeDialog = this.closeNewPortRangeDialog.bind(this);
    this.openImportDialog = this.openImportDialog.bind(this);
    this.openNewPortRangeDialog = this.openNewPortRangeDialog.bind(this);
    this.openPortListDialog = this.openPortListDialog.bind(this);
    this.handleDeletePortRange = this.handleDeletePortRange.bind(this);
    this.handleImportPortList = this.handleImportPortList.bind(this);
    this.handleSavePortRange = this.handleSavePortRange.bind(this);
  }

  openPortListDialog(entity) {
    const {gmp} = this.props;

    if (entity) {
      gmp.portlist.get(entity).then(response => {
        const port_list = response.data;
        this.setState({
          comment: port_list.comment,
          port_list,
          name: port_list.name,
          portListDialogVisible: true,
          title: _('Edit Port List {{name}}', {name: shorten(port_list.name)}),
        });
      });
    }
    else {
      this.setState({
        comment: undefined,
        name: undefined,
        port_list: undefined,
        portListDialogVisible: true,
        title: _('New Port List'),
      });
    }
  }

  closePortListDialog() {
    this.setState({portListDialogVisible: false});
  }

  openImportDialog() {
    this.setState({importDialogVisible: true});
  }

  closeImportDialog() {
    this.setState({importDialogVisible: false});
  }

  openNewPortRangeDialog(port_list) {
    this.setState({
      portRangeDialogVisible: true,
      id: port_list.id,
    });
  }

  closeNewPortRangeDialog() {
    this.setState({portRangeDialogVisible: false});
  }

  handleDeletePortRange(range) {
    const {gmp} = this.props;

    gmp.portlist.deletePortRange(range).then(response => {
      const {data} = response;
      this.setState({port_list: data});
    });
  }

  handleSavePortRange(data) {
    const {gmp} = this.props;

    return gmp.portlist.createPortRange(data).then(response => {
      const range = response.data.params;
      const newRange = {
        end: range.port_range_end,
        entity_type: 'port_range',
        id: range.token,
        port_list_id: range.port_list_id,
        protocol_type: range.port_type,
        start: range.port_range_start,
      };
      const {port_list} = this.state;
      port_list.port_ranges.push(newRange);
      this.setState({port_list});
    });
  }

  handleImportPortList(data) {
    const {
      gmp,
      onImported,
      onImportError,
    } = this.props;
    return gmp.portlist.import(data).then(onImported, onImportError);
  }

  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      comment,
      importDialogVisible,
      name,
      port_list,
      portListDialogVisible,
      portRangeDialogVisible,
      title,
    } = this.state;

    return (
      <EntityComponent
        name="portlist"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Wrapper>
            {children({
              ...other,
              create: this.openPortListDialog,
              edit: this.openPortListDialog,
              import: this.openImportDialog,
            })}
            <PortListsDialog
              comment={comment}
              name={name}
              port_list={port_list}
              title={title}
              visible={portListDialogVisible}
              onClose={this.closePortListDialog}
              onDeletePortRangeClick={this.handleDeletePortRange}
              onNewPortRangeClick={this.openNewPortRangeDialog}
              onSave={save}
            />
            <ImportPortListDialog
              visible={importDialogVisible}
              onClose={this.closeImportDialog}
              onSave={this.handleImportPortList}
            />
            <PortRangeDialog
              port_list={port_list}
              visible={portRangeDialogVisible}
              onClose={this.closeNewPortRangeDialog}
              onSave={this.handleSavePortRange}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

PortListComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onImportError: PropTypes.func,
  onImported: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(PortListComponent);

// vim: set ts=2 sw=2 tw=80:
