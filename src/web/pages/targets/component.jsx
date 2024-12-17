/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import _ from 'gmp/locale';
import {YES_VALUE} from 'gmp/parser';
import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import EntityComponent from 'web/entity/component';
import CredentialsDialog from 'web/pages/credentials/dialog';
import PortListDialog from 'web/pages/portlists/dialog';
import PropTypes from 'web/utils/proptypes';
import {UNSET_VALUE} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

import TargetDialog from './dialog';

const DEFAULT_PORT_LIST_ID = '33d0cd82-57c6-11e1-8ed1-406186ea4fc5'; // All IANA assigned TCP 2012-02-10

const id_or__ = value => {
  return isDefined(value) ? value.id : UNSET_VALUE;
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
    this.handleCloseCredentialsDialog = this.handleCloseCredentialsDialog.bind(
      this,
    );
    this.openPortListDialog = this.openPortListDialog.bind(this);
    this.handleClosePortListDialog = this.handleClosePortListDialog.bind(this);
    this.openTargetDialog = this.openTargetDialog.bind(this);
    this.handleCloseTargetDialog = this.handleCloseTargetDialog.bind(this);
    this.openCreateTargetDialog = this.openCreateTargetDialog.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleCreatePortList = this.handleCreatePortList.bind(this);
    this.handlePortListChange = this.handlePortListChange.bind(this);
    this.handleEsxiCredentialChange = this.handleEsxiCredentialChange.bind(
      this,
    );
    this.handleSshCredentialChange = this.handleSshCredentialChange.bind(this);
    this.handleSshElevateCredentialChange = this.handleSshElevateCredentialChange.bind(
      this,
    );
    this.handleSmbCredentialChange = this.handleSmbCredentialChange.bind(this);
    this.handleSnmpCredentialChange = this.handleSnmpCredentialChange.bind(
      this,
    );
  }

  openCredentialsDialog({id_field, types, title}) {
    this.id_field = id_field;

    this.setState({
      credentialsDialogVisible: true,
      credentialTypes: types,
      credentials_title: title,
    });

    this.handleInteraction();
  }

  closeCredentialsDialog() {
    this.setState({credentialsDialogVisible: false});
  }

  handleCloseCredentialsDialog() {
    this.closeCredentialsDialog();
    this.handleInteraction();
  }

  openTargetDialog(entity, initial = {}) {
    if (isDefined(entity)) {
      this.setState({
        targetDialogVisible: true,
        id: entity.id,
        allowSimultaneousIPs: entity.allowSimultaneousIPs,
        alive_tests: entity.alive_tests,
        comment: entity.comment,
        esxi_credential_id: id_or__(entity.esxi_credential),
        exclude_hosts: isDefined(entity.exclude_hosts)
          ? entity.exclude_hosts.join(', ')
          : '',
        hosts: entity.hosts.join(', '),
        in_use: entity.isInUse(),
        name: entity.name,
        port: isDefined(entity.ssh_credential)
          ? entity.ssh_credential.port
          : '22',
        reverse_lookup_only: entity.reverse_lookup_only,
        reverse_lookup_unify: entity.reverse_lookup_unify,
        target_source: 'manual',
        target_exclude_source: 'manual',
        target_title: _('Edit Target {{name}}', entity),
      });

      // set credential and port list ids after credentials and port lists have been loaded
      this.loadAll().then(() => {
        this.setState({
          port_list_id: id_or__(entity.port_list),
          smb_credential_id: id_or__(entity.smb_credential),
          snmp_credential_id: id_or__(entity.snmp_credential),
          ssh_credential_id: id_or__(entity.ssh_credential),
          ssh_elevate_credential_id: id_or__(entity.ssh_elevate_credential),
        });
      });
    } else {
      this.loadAll().then(() => {
        this.setState({
          port_list_id: DEFAULT_PORT_LIST_ID,
        });
      });

      this.setState({
        targetDialogVisible: true,
        allowSimultaneousIPs: YES_VALUE,
        alive_tests: undefined,
        comment: undefined,
        esxi_credential_id: undefined,
        exclude_hosts: undefined,
        hosts: undefined,
        id: undefined,
        in_use: undefined,
        name: undefined,
        port: undefined,
        reverse_lookup_only: undefined,
        reverse_lookup_unify: undefined,
        smb_credential_id: undefined,
        snmp_credential_id: undefined,
        ssh_credential_id: undefined,
        ssh_elevate_credential_id: undefined,
        target_source: undefined,
        target_exclude_source: undefined,
        target_title: _('New Target'),
        ...initial,
      });
    }

    this.handleInteraction();
  }

  openCreateTargetDialog(initial = {}) {
    this.openTargetDialog(undefined, initial);
  }

  closeTargetDialog() {
    this.setState({targetDialogVisible: false});
  }

  handleCloseTargetDialog() {
    this.closeTargetDialog();
    this.handleInteraction();
  }

  loadAll() {
    return Promise.all([
      this.loadCredentials().then(credentials => this.setState({credentials})),
      this.loadPortLists().then(port_lists => this.setState({port_lists})),
    ]);
  }

  loadCredentials() {
    const {gmp} = this.props;
    return gmp.credentials.getAll().then(response => response.data);
  }

  loadPortLists() {
    const {gmp} = this.props;
    return gmp.portlists.getAll().then(response => response.data);
  }

  openPortListDialog() {
    this.setState({
      portListDialogVisible: true,
      port_lists_title: _('New Port List'),
    });
    this.handleInteraction();
  }

  closePortListDialog() {
    this.setState({portListDialogVisible: false});
  }

  handleClosePortListDialog() {
    this.closePortListDialog();
    this.handleInteraction();
  }

  handleCreateCredential(data) {
    const {gmp} = this.props;

    let credential_id;

    this.handleInteraction();

    return gmp.credential
      .create(data)
      .then(response => {
        const {data: credential} = response;

        credential_id = credential.id;
        this.closeCredentialsDialog();
        return this.loadCredentials();
      })
      .then(credentials => {
        this.setState({
          [this.id_field]: credential_id,
          credentials,
        });
      });
  }

  handleCreatePortList(data) {
    const {gmp} = this.props;
    let port_list_id;

    this.handleInteraction();

    return gmp.portlist
      .create(data)
      .then(response => {
        const {data: portlist} = response;
        port_list_id = portlist.id;
        this.closePortListDialog();
        return this.loadPortLists();
      })
      .then(port_lists => {
        this.setState({
          port_lists,
          port_list_id,
        });
      });
  }

  handlePortListChange(port_list_id) {
    this.setState({port_list_id});
  }

  handleEsxiCredentialChange(esxi_credential_id) {
    this.setState({esxi_credential_id});
  }

  handleSshCredentialChange(ssh_credential_id) {
    this.setState({ssh_credential_id});

    if (ssh_credential_id === UNSET_VALUE) {
      this.setState({ssh_elevate_credential_id: UNSET_VALUE}); // if ssh_credential_id is changed to UNSET_VALUE, elevate privileges option will not be rendered anymore. If we don't reset ssh_elevate_credential_id, then the previously set ssh_elevate_credential_id will never be available for the SSH dropdown again because it will still be set in the dialog state. ssh_elevate_credential_id should be available again if we ever unset ssh_credential_id
    }
  }

  handleSshElevateCredentialChange(ssh_elevate_credential_id) {
    this.setState({ssh_elevate_credential_id});
  }

  handleSnmpCredentialChange(snmp_credential_id) {
    this.setState({snmp_credential_id});
  }

  handleSmbCredentialChange(smb_credential_id) {
    this.setState({smb_credential_id});
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
      hosts_count,
      hosts_filter,
      id,
      in_use,
      name,
      port,
      port_list_id,
      port_lists,
      port_lists_title,
      allowSimultaneousIPs,
      reverse_lookup_only,
      reverse_lookup_unify,
      smb_credential_id,
      snmp_credential_id,
      ssh_credential_id,
      ssh_elevate_credential_id,
      target_source,
      target_exclude_source,
      target_title,
      credentialTypes = [],
    } = this.state;
    return (
      <EntityComponent
        name="target"
        onCloneError={onCloneError}
        onCloned={onCloned}
        onCreateError={onCreateError}
        onCreated={onCreated}
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
        onInteraction={onInteraction}
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({save, ...other}) => (
          <React.Fragment>
            {children({
              ...other,
              create: this.openCreateTargetDialog,
              edit: this.openTargetDialog,
            })}
            {targetDialogVisible && (
              <TargetDialog
                alive_tests={alive_tests}
                allowSimultaneousIPs={allowSimultaneousIPs}
                comment={comment}
                credential={credential}
                credentials={credentials}
                esxi_credential_id={esxi_credential_id}
                exclude_hosts={exclude_hosts}
                hosts={hosts}
                hosts_count={hosts_count}
                hosts_filter={hosts_filter}
                id={id}
                in_use={in_use}
                name={name}
                port={port}
                port_list_id={port_list_id}
                port_lists={port_lists}
                reverse_lookup_only={reverse_lookup_only}
                reverse_lookup_unify={reverse_lookup_unify}
                smb_credential_id={smb_credential_id}
                snmp_credential_id={snmp_credential_id}
                ssh_credential_id={ssh_credential_id}
                ssh_elevate_credential_id={ssh_elevate_credential_id}
                target_exclude_source={target_exclude_source}
                target_source={target_source}
                title={target_title}
                onClose={this.handleCloseTargetDialog}
                onEsxiCredentialChange={this.handleEsxiCredentialChange}
                onNewCredentialsClick={this.openCredentialsDialog}
                onNewPortListClick={this.openPortListDialog}
                onPortListChange={this.handlePortListChange}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeTargetDialog());
                }}
                onSmbCredentialChange={this.handleSmbCredentialChange}
                onSnmpCredentialChange={this.handleSnmpCredentialChange}
                onSshCredentialChange={this.handleSshCredentialChange}
                onSshElevateCredentialChange={
                  this.handleSshElevateCredentialChange
                }
              />
            )}
            {credentialsDialogVisible && (
              <CredentialsDialog
                base={first(credentialTypes)}
                title={`${credentials_title}`}
                types={credentialTypes}
                onClose={this.handleCloseCredentialsDialog}
                onSave={this.handleCreateCredential}
              />
            )}
            {portListDialogVisible && (
              <PortListDialog
                title={port_lists_title}
                visible={portListDialogVisible}
                onClose={this.handleClosePortListDialog}
                onSave={this.handleCreatePortList}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

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
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(TargetComponent);

// vim: set ts=2 sw=2 tw=80:
