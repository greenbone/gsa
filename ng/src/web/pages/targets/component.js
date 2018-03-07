/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import {first, is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp';
import {UNSET_VALUE} from '../../utils/render.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import CredentialsDialog from '../credentials/dialog.js';

import PortListDialog from '../portlists/dialog.js';

import TargetDialog from './dialog.js';

const id_or__ = value => {
  return is_defined(value) ? value.id : UNSET_VALUE;
};

class TargetComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      credentialsDialogVisible: false,
      portListDialogVisible: false,
      targetDialogVisible: false,
    };

    this.openCredentialsDialog = this.openCredentialsDialog.bind(this);
    this.closeCredentialsDialog = this.closeCredentialsDialog.bind(this);
    this.openPortListDialog = this.openPortListDialog.bind(this);
    this.closePortListDialog = this.closePortListDialog.bind(this);
    this.openTargetDialog = this.openTargetDialog.bind(this);
    this.closeTargetDialog = this.closeTargetDialog.bind(this);
    this.openCreateTargetDialog = this.openCreateTargetDialog.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleCreatePortList = this.handleCreatePortList.bind(this);
  }

  openCredentialsDialog(data) {
    this.setState({
      credentialsDialogVisible: true,
      types: data.types,
      base: first(data.types),
      id_field: data.id_field,
      credentials_title: data.title,
    });
  }

  closeCredentialsDialog() {
    this.setState({credentialsDialogVisible: false});
  }

  openTargetDialog(entity, initial = {}) {
    if (is_defined(entity)) {
      this.setState({
        targetDialogVisible: true,
        id: entity.id,
        alive_tests: entity.alive_tests,
        comment: entity.comment,
        esxi_credential_id: id_or__(entity.esxi_credential),
        exclude_hosts: is_defined(entity.exclude_hosts) ?
          entity.exclude_hosts.join(', ') : '',
        hosts: entity.hosts.join(', '),
        in_use: entity.isInUse(),
        name: entity.name,
        port_list_id: id_or__(entity.port_list),
        port: is_defined(entity.ssh_credential) ?
          entity.ssh_credential.port : '22',
        reverse_lookup_only: entity.reverse_lookup_only,
        reverse_lookup_unify: entity.reverse_lookup_unify,
        smb_credential_id: id_or__(entity.smb_credential),
        snmp_credential_id: id_or__(entity.snmp_credential),
        ssh_credential_id: id_or__(entity.ssh_credential),
        target_source: 'manual',
        target_exclude_source: 'manual',
        target_title: _('Edit Target {{name}}', entity),
      });
      this.loadData();
    }
    else {
      this.setState({
        targetDialogVisible: true,
        alive_tests: undefined,
        comment: undefined,
        esxi_credential_id: undefined,
        hosts: undefined,
        id: undefined,
        in_use: undefined,
        name: undefined,
        port: undefined,
        port_list_id: undefined,
        reverse_lookup_only: undefined,
        reverse_lookup_unify: undefined,
        smb_credential_id: undefined,
        snmp_credential_id: undefined,
        ssh_credential_id: undefined,
        target_source: undefined,
        target_exclude_source: undefined,
        target_title: _('New Target'),
        ...initial,
      });
    }
  }

  openCreateTargetDialog(initial = {}) {
    this.openTargetDialog(undefined, initial);
  }

  closeTargetDialog() {
    this.setState({targetDialogVisible: false});
  }

  loadData() {
    const {gmp} = this.props;

    gmp.portlists.getAll().then(response => {
      const {data: port_lists} = response;
      this.port_lists = port_lists;
      this.setState({port_lists});
    });

    gmp.credentials.getAll().then(response => {
      const {data: credentials} = response;
      this.credentials = credentials;
      this.setState({credentials});
    });
  }

  openPortListDialog() {
    this.setState({
      portListDialogVisible: true,
      port_lists_title: _('New Port List'),
    });
  }

  closePortListDialog() {
    this.setState({portListDialogVisible: false});
  }

  handleCreateCredential(data) {
    const {gmp} = this.props;
    return gmp.credential.create(data).then(response => {
      const credential = response.data;
      const {credentials = []} = this;
      credentials.push(credential);

      this.setState({
        credentials,
        [data.id_field]: credential.id,
      });
    });
  }

  handleCreatePortList(data) {
    const {gmp} = this.props;
    return gmp.portlist.create(data).then(response => {
      const portlist = response.data;
      const {port_lists = []} = this;
      port_lists.push(portlist);
      this.setState({
        port_lists,
        port_list_id: portlist.id,
      });
    });
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
      credentialsDialogVisible,
      portListDialogVisible,
      targetDialogVisible,
      alive_tests,
      comment,
      credentials_title,
      esxi_credential_id,
      exclude_hosts,
      credential,
      credentials,
      hosts,
      id,
      id_field,
      in_use,
      name,
      port,
      port_list_id,
      port_lists,
      port_lists_title,
      reverse_lookup_only,
      reverse_lookup_unify,
      smb_credential_id,
      snmp_credential_id,
      ssh_credential_id,
      target_source,
      target_exclude_source,
      target_title,
      types = [],
    } = this.state;

    const base = first(types);

    return (
      <EntityComponent
        name="target"
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
              create: this.openCreateTargetDialog,
              edit: this.openTargetDialog,
            })}
            <TargetDialog
              alive_tests={alive_tests}
              comment={comment}
              credential={credential}
              credentials={credentials}
              esxi_credential_id={esxi_credential_id}
              exclude_hosts={exclude_hosts}
              hosts={hosts}
              id={id}
              in_use={in_use}
              name={name}
              port={port}
              port_lists={port_lists}
              port_list_id={port_list_id}
              reverse_lookup_only={reverse_lookup_only}
              reverse_lookup_unify={reverse_lookup_unify}
              smb_credential_id={smb_credential_id}
              snmp_credential_id={snmp_credential_id}
              ssh_credential_id={ssh_credential_id}
              target_source={target_source}
              target_exclude_source={target_exclude_source}
              title={target_title}
              types={types}
              visible={targetDialogVisible}
              onClose={this.closeTargetDialog}
              onNewCredentialsClick={this.openCredentialsDialog}
              onNewPortListClick={this.openPortListDialog}
              onSave={save}
            />
            <CredentialsDialog
              types={types}
              base={base}
              id_field={id_field}
              title={credentials_title}
              visible={credentialsDialogVisible}
              onClose={this.closeCredentialsDialog}
              onSave={this.handleCreateCredential}
            />
            <PortListDialog
              title={port_lists_title}
              visible={portListDialogVisible}
              onClose={this.closePortListDialog}
              onSave={this.handleCreatePortList}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
};

TargetComponent.propTypes = {
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(TargetComponent);

// vim: set ts=2 sw=2 tw=80:
