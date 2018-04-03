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
import {parse_int} from 'gmp/parser';
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

    this.created_port_ranges = [];
    this.deleted_port_ranges = [];

    this.closeImportDialog = this.closeImportDialog.bind(this);
    this.closePortListDialog = this.closePortListDialog.bind(this);
    this.closeNewPortRangeDialog = this.closeNewPortRangeDialog.bind(this);
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
    }
    else {
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

    return gmp.portlist.deletePortRange(range).then(response => {
      const {data} = response;
      this.setState({port_list: data});
    });
  }

  handleSavePortRange(data) {
    const {gmp} = this.props;

    return gmp.portlist.createPortRange(data)
      .then(response => response.data.id);
  }

  handleImportPortList(data) {
    const {
      gmp,
      onImported,
      onImportError,
    } = this.props;
    return gmp.portlist.import(data).then(onImported, onImportError);
  }

  handleSavePortList(save, data) {
    const created_port_ranges_copy = [...this.created_port_ranges];

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
        this.created_port_ranges = this.created_port_ranges
          .filter(prange => prange !== range);
        }
      );
    });
    const deleted_port_ranges_copy = [...this.deleted_port_ranges];
    promises = [...promises, ...deleted_port_ranges_copy.map(range =>
      this.handleDeletePortRange(range).then(
        this.deleted_port_ranges = this.deleted_port_ranges
          .filter(prange => prange !== range)
      )
    )];
    return Promise.all(promises).then(() => save(data));
  }

  handleTmpAddPortRange(values) {
    const {port_ranges} = this.state;
    const {
      port_range_end,
      port_range_start,
      port_type,
    } = values;

    // reject port ranges with missing values
    if (!port_range_start || !port_range_end) {
      return Promise.reject(new Error(_('The port range needs numerical ' +
        'values for start and end!')));
    }

    // reject port ranges with start value lower than end value
    if (port_range_start > port_range_end) {
      return Promise.reject(new Error(_('The end of the port range can\'t ' +
        'be below its start!')));
    }

    // check if new port range overlaps with existing and temporarily existing
    // ones, only relevant if protocol_type is the same
    for (const range of port_ranges) {
      const start = parse_int(range.start);
      const end = parse_int(range.end);
      if (range.protocol_type === port_type &&
        (
          port_range_start === start ||
          port_range_start === end ||
          (port_range_start > start && port_range_start < end) ||
          port_range_end === start ||
          port_range_end === end ||
          (port_range_end > start && port_range_end < end) ||
          (port_range_start < start && port_range_end > end)
        )
      ) {
        return Promise.reject(new Error(_('New port range overlaps with an ' +
          'existing one!')));
      }
    }

    const newRange = {
      end: values.port_range_end,
      entity_type: 'port_range',
      id: values.id,
      protocol_type: values.port_type,
      start: values.port_range_start,
      isTmp: true,
    };

    port_ranges.push(newRange);
    this.created_port_ranges.push(newRange);
    this.setState({port_ranges});
  }

  handleTmpDeletePortRange(port_range) {
    const {port_ranges} = this.state;
    let new_port_ranges = port_ranges;

    if (port_range.isTmp) {
      this.created_port_ranges = this.created_port_ranges
        .filter(range => range !== port_range);
    }
    else {
      this.deleted_port_ranges.push(port_range);
    }

    new_port_ranges = port_ranges.filter(range => range !== port_range);
    this.setState({port_ranges: new_port_ranges});
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
            {portListDialogVisible &&
              <PortListsDialog
                comment={comment}
                id={id}
                name={name}
                port_list={port_list}
                title={title}
                port_ranges={port_ranges}
                onClose={this.closePortListDialog}
                onNewPortRangeClick={this.openNewPortRangeDialog}
                onSave={(...args) => this.handleSavePortList(save, ...args)}
                onTmpAddPortRange={this.handleTmpAddPortRange}
                onTmpDeletePortRange={this.handleTmpDeletePortRange}
              />
            }
            {importDialogVisible &&
              <ImportPortListDialog
                onClose={this.closeImportDialog}
                onSave={this.handleImportPortList}
              />
            }
            {portRangeDialogVisible &&
              <PortRangeDialog
                id={id}
                onClose={this.closeNewPortRangeDialog}
                onSave={this.handleTmpAddPortRange}
              />
            }
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
