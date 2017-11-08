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
import {shorten} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import EntityComponent from '../../entity/component.js';

import Wrapper from '../../components/layout/wrapper.js';

import ImportPortListDialog from './importdialog.js';
import PortListDialog from './dialog.js';
import PortRangeDialog from './portrangedialog.js';

class PortListComponent extends React.Component {

  constructor(...args) {
    super(...args);

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
        this.port_list_dialog.show({
          id: port_list.id,
          port_list,
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
    this.import_dialog.show();
  }

  openNewPortRangeDialog(port_list) {
    this.port_range_dialog.show({
      id: port_list.id,
    });
  }

  handleDeletePortRange(range) {
    const {gmp} = this.props;

    gmp.portlist.deletePortRange(range).then(response => {
      this.port_list_dialog.setValue('port_list', response.data);
    });
  }

  handleSavePortRange(data) {
    const {gmp} = this.props;

    return gmp.portlist.createPortRange(data).then(response => {
      this.port_list_dialog.setValue('port_list', response.data);
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
            <PortListDialog
              ref={ref => this.port_list_dialog = ref}
              onDeletePortRangeClick={this.handleDeletePortRange}
              onNewPortRangeClick={this.openNewPortRangeDialog}
              onSave={save}
            />
            <ImportPortListDialog
              ref={ref => this.import_dialog = ref}
              onSave={this.handleImportPortList}
            />
            <PortRangeDialog
              ref={ref => this.port_range_dialog = ref}
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
