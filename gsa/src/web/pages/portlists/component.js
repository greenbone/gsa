/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import React from 'react';

import _ from 'gmp/locale';

import {parseInt} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import ImportPortListDialog from './importdialog';
import PortListsDialog from './dialog';
import PortRangeDialog from './portrangedialog';

class PortListComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      importDialogVisible: false,
      portListDialogVisible: false,
      portRangeDialogVisible: false,
    };

    this.created_port_ranges = [];
    this.deleted_port_ranges = [];

    this.handleCloseImportDialog = this.handleCloseImportDialog.bind(this);
    this.handleClosePortListDialog = this.handleClosePortListDialog.bind(this);
    this.handleCloseNewPortRangeDialog = this.handleCloseNewPortRangeDialog.bind(
      this,
    );
    this.openImportDialog = this.openImportDialog.bind(this);
    this.openNewPortRangeDialog = this.openNewPortRangeDialog.bind(this);
    this.openPortListDialog = this.openPortListDialog.bind(this);
    this.handleDeletePortRange = this.handleDeletePortRange.bind(this);
    this.handleImportPortList = this.handleImportPortList.bind(this);
    this.handleSavePortList = this.handleSavePortList.bind(this);
    this.handleSavePortRange = this.handleSavePortRange.bind(this);
    this.handleTmpAddPortRange = this.handleTmpAddPortRange.bind(this);
    this.handleTmpDeletePortRange = this.handleTmpDeletePortRange.bind(this);
  }

  openPortListDialog(entity) {
    const {gmp} = this.props;

    if (entity) {
      gmp.portlist.get(entity).then(response => {
        const port_list = response.data;
        this.created_port_ranges = [];
        this.deleted_port_ranges = [];
        this.setState({
          comment: port_list.comment,
          id: port_list.id,
          port_list,
          name: port_list.name,
          portListDialogVisible: true,
          port_ranges: port_list.port_ranges,
          title: _('Edit Port List {{name}}', {name: shorten(port_list.name)}),
        });
      });
    } else {
      this.created_port_ranges = [];
      this.deleted_port_ranges = [];
      this.setState({
        comment: undefined,
        id: undefined,
        name: undefined,
        port_list: undefined,
        portListDialogVisible: true,
        title: _('New Port List'),
      });
    }

    this.handleInteraction();
  }

  closePortListDialog() {
    this.setState({portListDialogVisible: false});
  }

  handleClosePortListDialog() {
    this.closePortListDialog();
    this.handleInteraction();
  }

  openImportDialog() {
    this.setState({importDialogVisible: true});
    this.handleInteraction();
  }

  closeImportDialog() {
    this.setState({importDialogVisible: false});
  }

  handleCloseImportDialog() {
    this.closeImportDialog();
    this.handleInteraction();
  }

  openNewPortRangeDialog(port_list) {
    this.setState({
      portRangeDialogVisible: true,
      id: port_list.id,
    });
    this.handleInteraction();
  }

  closeNewPortRangeDialog() {
    this.setState({portRangeDialogVisible: false});
  }

  handleCloseNewPortRangeDialog() {
    this.closeNewPortRangeDialog();
    this.handleInteraction();
  }

  handleDeletePortRange(range) {
    const {gmp} = this.props;

    return gmp.portlist.deletePortRange(range).then(response => {
      const {data} = response;
      this.setState({port_list: data});
    });
  }

  handleSavePortRange(data) {
    const {gmp} = this.props;

    return gmp.portlist
      .createPortRange(data)
      .then(response => response.data.id);
  }

  handleImportPortList(data) {
    const {gmp, onImported, onImportError} = this.props;

    this.handleInteraction();

    return gmp.portlist
      .import(data)
      .then(onImported, onImportError)
      .then(() => this.closeImportDialog());
  }

  handleSavePortList(save, data) {
    const created_port_ranges_copy = [...this.created_port_ranges];

    this.handleInteraction();

    let promises = created_port_ranges_copy.map(range => {
      const saveData = {
        ...range,
        port_range_start: range.start,
        port_range_end: range.end,
        port_type: range.protocol_type,
      };
      return this.handleSavePortRange(saveData).then(id => {
        range.isTmp = false;
        range.id = id;
        this.created_port_ranges = this.created_port_ranges.filter(
          prange => prange !== range,
        );
      });
    });
    const deleted_port_ranges_copy = [...this.deleted_port_ranges];
    promises = [
      ...promises,
      ...deleted_port_ranges_copy.map(range =>
        this.handleDeletePortRange(range).then(
          (this.deleted_port_ranges = this.deleted_port_ranges.filter(
            prange => prange !== range,
          )),
        ),
      ),
    ];
    return Promise.all(promises)
      .then(() => save(data))
      .then(() => this.closePortListDialog());
  }

  handleTmpAddPortRange(values) {
    const {port_ranges} = this.state;
    const {port_range_end, port_range_start, port_type} = values;

    this.handleInteraction();

    // reject port ranges with missing values
    if (!port_range_start || !port_range_end) {
      return Promise.reject(
        new Error(
          _('The port range needs numerical values for start and end!'),
        ),
      );
    }

    // reject port ranges with start value lower than end value
    if (port_range_start > port_range_end) {
      return Promise.reject(
        new Error(_('The end of the port range can not be below its start!')),
      );
    }

    // check if new port range overlaps with existing and temporarily existing
    // ones, only relevant if protocol_type is the same
    for (const range of port_ranges) {
      const start = parseInt(range.start);
      const end = parseInt(range.end);
      if (
        range.protocol_type === port_type &&
        (port_range_start === start ||
          port_range_start === end ||
          (port_range_start > start && port_range_start < end) ||
          port_range_end === start ||
          port_range_end === end ||
          (port_range_end > start && port_range_end < end) ||
          (port_range_start < start && port_range_end > end))
      ) {
        return Promise.reject(
          new Error(_('New port range overlaps with an existing one!')),
        );
      }
    }

    const newRange = {
      end: values.port_range_end,
      entityType: 'portrange',
      id: values.id,
      protocol_type: values.port_type,
      start: values.port_range_start,
      isTmp: true,
    };

    this.created_port_ranges.push(newRange);
    this.setState({
      port_ranges: [...port_ranges, newRange],
    });
    this.closeNewPortRangeDialog();
  }

  handleTmpDeletePortRange(port_range) {
    const {port_ranges} = this.state;
    let new_port_ranges = port_ranges;

    if (port_range.isTmp) {
      this.created_port_ranges = this.created_port_ranges.filter(
        range => range !== port_range,
      );
    } else {
      this.deleted_port_ranges.push(port_range);
    }

    new_port_ranges = port_ranges.filter(range => range !== port_range);
    this.setState({port_ranges: new_port_ranges});

    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
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
      onInteraction,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      comment,
      id,
      importDialogVisible,
      name,
      port_list,
      portListDialogVisible,
      portRangeDialogVisible,
      title,
      port_ranges,
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
        onInteraction={onInteraction}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({save, ...other}) => (
          <React.Fragment>
            {children({
              ...other,
              create: this.openPortListDialog,
              edit: this.openPortListDialog,
              import: this.openImportDialog,
            })}
            {portListDialogVisible && (
              <PortListsDialog
                comment={comment}
                id={id}
                name={name}
                port_list={port_list}
                title={title}
                port_ranges={port_ranges}
                onClose={this.handleClosePortListDialog}
                onNewPortRangeClick={this.openNewPortRangeDialog}
                onSave={(...args) => this.handleSavePortList(save, ...args)}
                onTmpDeletePortRange={this.handleTmpDeletePortRange}
              />
            )}
            {importDialogVisible && (
              <ImportPortListDialog
                onClose={this.handleCloseImportDialog}
                onSave={this.handleImportPortList}
              />
            )}
            {portRangeDialogVisible && (
              <PortRangeDialog
                id={id}
                onClose={this.handleCloseNewPortRangeDialog}
                onSave={this.handleTmpAddPortRange}
              />
            )}
          </React.Fragment>
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
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(PortListComponent);

// vim: set ts=2 sw=2 tw=80:
