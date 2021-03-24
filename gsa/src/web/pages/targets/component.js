/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/* eslint-disable no-shadow */

import React, {useReducer} from 'react';

import _ from 'gmp/locale';

import {
  convertCredentialTypeEnum,
  convertAuthAlgorithmEnum,
  convertPrivacyAlgorithmEnum,
} from 'gmp/models/credential';
import {ALL_FILTER} from 'gmp/models/filter';

import {YES_VALUE} from 'gmp/parser';

import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import EntityComponent from 'web/entity/component';

import CredentialsDialog from 'web/pages/credentials/dialog';

import PortListDialog from 'web/pages/portlists/dialog';

import {
  useCreateCredential,
  useLazyGetCredentials,
} from 'web/graphql/credentials';

import {useLazyGetPortLists, useCreatePortList} from 'web/graphql/portlists';

import {useCreateTarget, useModifyTarget} from 'web/graphql/targets';

import PropTypes from 'web/utils/proptypes';
import readFileToText from 'web/utils/readFileToText';
import {UNSET_VALUE} from 'web/utils/render';
import reducer, {updateState} from 'web/utils/stateReducer';

import TargetDialog from './dialog';

const DEFAULT_PORT_LIST_ID = '33d0cd82-57c6-11e1-8ed1-406186ea4fc5'; // All IANA assigned TCP 2012-02-10

const id_or__ = value => {
  return isDefined(value) ? value.id : UNSET_VALUE;
};

const initialState = {
  credentialsDialogVisible: false,
  portListDialogVisible: false,
  targetDialogVisible: false,
  credentialsDialogState: {},
  portListsTitle: undefined,
  idField: undefined,
};

const TargetComponent = props => {
  const [state, dispatchState] = useReducer(reducer, initialState);

  const [createTarget] = useCreateTarget();
  const [modifyTarget] = useModifyTarget();
  const [createPortList] = useCreatePortList();
  const [createCredential] = useCreateCredential();

  const [
    loadCredentials,
    {credentials, refetch: refetchCredentials},
  ] = useLazyGetCredentials({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadPortLists,
    {portLists, refetch: refetchPortLists},
  ] = useLazyGetPortLists({
    filterString: ALL_FILTER.toFilterString(),
  });

  const openCredentialsDialog = ({id_field, types, title}) => {
    dispatchState(
      updateState({
        idField: id_field,
        credentialsDialogVisible: true,
        credentialTypes: types,
        credentialsTitle: title,
      }),
    );

    handleInteraction();
  };

  const closeCredentialsDialog = () => {
    dispatchState(
      updateState({
        credentialsDialogVisible: false,
      }),
    );
  };

  const handleCloseCredentialsDialog = () => {
    closeCredentialsDialog();
    handleInteraction();
  };

  const openTargetDialog = (entity, initial = {}) => {
    if (isDefined(entity)) {
      dispatchState(
        updateState({
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
          targetTitle: _('Edit Target {{name}}', entity),
        }),
      );

      // set credential and port list ids after credentials and port lists have been loaded
      loadAll().then(() => {
        dispatchState(
          updateState({
            smb_credential_id: id_or__(entity.smb_credential),
            ssh_credential_id: id_or__(entity.ssh_credential),
            port_list_id: id_or__(entity.port_list),
          }),
        );
      });
    } else {
      loadAll().then(() => {
        dispatchState(
          updateState({
            port_list_id: DEFAULT_PORT_LIST_ID,
          }),
        );
      });

      dispatchState(
        updateState({
          targetDialogVisible: true,
          id: undefined,
          alive_tests: undefined,
          allowSimultaneousIPs: YES_VALUE,
          comment: undefined,
          esxi_credential_id: undefined,
          exclude_hosts: undefined,
          hosts: undefined,
          in_use: undefined,
          name: undefined,
          port: undefined,
          reverse_lookup_only: undefined,
          reverse_lookup_unify: undefined,
          target_source: undefined,
          target_exclude_source: undefined,
          targetTitle: _('New Target'),
          ...initial,
        }),
      );
    }

    handleInteraction();
  };

  const openCreateTargetDialog = (initial = {}) => {
    openTargetDialog(undefined, initial);
  };

  const closeTargetDialog = () => {
    dispatchState(
      updateState({
        targetDialogVisible: false,
      }),
    );
  };

  const handleCloseTargetDialog = () => {
    closeTargetDialog();
    handleInteraction();
  };

  const loadAll = () => {
    return Promise.all([loadCredentials(), loadPortLists()]);
  };

  const openPortListDialog = () => {
    dispatchState(
      updateState({
        portListDialogVisible: true,
        portListsTitle: _('New Port List'),
      }),
    );
    handleInteraction();
  };

  const closePortListDialog = () => {
    dispatchState(
      updateState({
        portListDialogVisible: false,
      }),
    );
  };

  const handleClosePortListDialog = () => {
    closePortListDialog();
    handleInteraction();
  };

  const handleCreateCredential = data => {
    handleInteraction();

    return readFileToText(data.private_key)
      .then(privateKey => {
        return createCredential({
          allowInsecure: data.allow_insecure,
          authAlgorithm: convertAuthAlgorithmEnum(data.auth_algorithm),
          comment: data.comment,
          community: data.community,
          login: data.credential_login,
          name: data.name,
          keyPhrase: data.passphrase,
          password: data.password,
          privacyAlgorithm: convertPrivacyAlgorithmEnum(data.privacy_algorithm),
          privacyPassword: data.privacy_password,
          privateKey: privateKey,
          type: convertCredentialTypeEnum(data.credential_type),
        });
      })
      .then(() => {
        closeCredentialsDialog();
        return refetchCredentials();
      });
  };

  const handleCreatePortList = ({
    name,
    comment,
    from_file,
    file,
    port_range,
  }) => {
    let port_list_id;

    handleInteraction();

    return readFileToText(file)
      .then(text => {
        return createPortList({
          name,
          comment,
          portRange: from_file ? text : port_range,
        });
      })
      .then(createdId => {
        port_list_id = createdId;
        closePortListDialog();
        return refetchPortLists();
      })
      .then(() => {
        dispatchState(
          updateState({
            port_list_id,
          }),
        );
      });
  };

  const handlePortListChange = port_list_id => {
    dispatchState(
      updateState({
        port_list_id,
      }),
    );
  };

  const handleEsxiCredentialChange = esxi_credential_id => {
    dispatchState(
      updateState({
        esxi_credential_id,
      }),
    );
  };

  const handleSshCredentialChange = ssh_credential_id => {
    dispatchState(
      updateState({
        ssh_credential_id,
      }),
    );
  };

  const handleSnmpCredentialChange = snmp_credential_id => {
    dispatchState(
      updateState({
        snmp_credential_id,
      }),
    );
  };

  const handleSmbCredentialChange = smb_credential_id => {
    dispatchState(
      updateState({
        smb_credential_id,
      }),
    );
  };

  const handleInteraction = () => {
    const {onInteraction} = props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const setHostFileText = (file, exclude_file) => {
    let fileText;
    let excludeFileText;

    if (isDefined(file)) {
      fileText = file.text().then(text => {
        return text;
      });
    } else {
      fileText = Promise.resolve();
    }

    if (isDefined(exclude_file)) {
      excludeFileText = exclude_file.text().then(text => {
        return text;
      });
    } else {
      excludeFileText = Promise.resolve();
    }

    return Promise.all([fileText, excludeFileText]);
  };

  const handleSaveTarget = ({
    alive_tests,
    allowSimultaneousIPs,
    comment,
    esxi_credential_id,
    exclude_hosts,
    exclude_file,
    file,
    hosts,
    hosts_filter,
    id,
    in_use,
    name,
    port,
    port_list_id,
    reverse_lookup_only,
    reverse_lookup_unify,
    smb_credential_id,
    snmp_credential_id,
    ssh_credential_id,
    target_exclude_source,
    target_source,
  }) => {
    handleInteraction();

    if (isDefined(id)) {
      const {onSaved, onSaveError} = props;

      return setHostFileText(file, exclude_file)
        .then(text => {
          const [fileText, excludeFileText] = text;

          let mutationData;
          if (in_use) {
            mutationData = {
              name,
              comment,
              aliveTest: alive_tests.toLowerCase(),
              id,
            };
          } else {
            mutationData = {
              id,
              aliveTest: alive_tests,
              allowSimultaneousIPs,
              comment,
              esxiCredentialId: esxi_credential_id,
              hosts: target_source === 'file' ? fileText : hosts,
              excludeHosts:
                target_exclude_source === 'file'
                  ? excludeFileText
                  : exclude_hosts,
              name,
              sshCredentialPort: parseInt(port),
              portListId: port_list_id,
              reverseLookupOnly: reverse_lookup_only,
              reverseLookupUnify: reverse_lookup_unify,
              smbCredentialId: smb_credential_id,
              snmpCredentialId: snmp_credential_id,
              sshCredentialId: ssh_credential_id,
            };
          }

          return modifyTarget(mutationData);
        })
        .then(onSaved, onSaveError)
        .then(closeTargetDialog);
    }

    const {onCreated, onCreateError} = props;

    return setHostFileText(file, exclude_file)
      .then(text => {
        const [fileText, excludeFileText] = text;

        const mutationData = {
          aliveTest: alive_tests,
          allowSimultaneousIPs,
          comment,
          esxiCredentialId: esxi_credential_id,
          name,
          hosts: target_source === 'file' ? fileText : hosts,
          excludeHosts:
            target_exclude_source === 'file' ? excludeFileText : exclude_hosts,
          sshCredentialPort: parseInt(port),
          portListId: port_list_id,
          reverseLookupOnly: reverse_lookup_only,
          reverseLookupUnify: reverse_lookup_unify,
          smbCredentialId: smb_credential_id,
          snmpCredentialId: snmp_credential_id,
          sshCredentialId: ssh_credential_id,
          hostsFilter: hosts_filter,
        };

        return createTarget(mutationData);
      })
      .then(onCreated, onCreateError)
      .then(closeTargetDialog);
  };

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
  } = props;

  const {
    alive_tests,
    allowSimultaneousIPs,
    comment,
    esxi_credential_id,
    exclude_hosts,
    hosts,
    hosts_count,
    hosts_filter,
    id,
    in_use,
    name,
    port,
    port_list_id,
    reverse_lookup_only,
    reverse_lookup_unify,
    smb_credential_id,
    ssh_credential_id,
    snmp_credential_id,
    target_source,
    target_exclude_source,
    targetTitle,
    credentialsTitle,
    credentialTypes,
    targetDialogVisible,
    credentialsDialogVisible,
    portListDialogVisible,
    portListsTitle,
  } = state;

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
      onInteraction={onInteraction}
      onSaved={onSaved}
      onSaveError={onSaveError}
    >
      {({...other}) => (
        <React.Fragment>
          {children({
            ...other,
            create: openCreateTargetDialog,
            edit: openTargetDialog,
          })}
          {targetDialogVisible && (
            <TargetDialog
              alive_tests={alive_tests}
              allowSimultaneousIPs={allowSimultaneousIPs}
              comment={comment}
              // credential={credential} // this is undefined?
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
              port_lists={portLists}
              port_list_id={port_list_id}
              reverse_lookup_only={reverse_lookup_only}
              reverse_lookup_unify={reverse_lookup_unify}
              smb_credential_id={smb_credential_id}
              snmp_credential_id={snmp_credential_id}
              ssh_credential_id={ssh_credential_id}
              target_source={target_source}
              target_exclude_source={target_exclude_source}
              title={targetTitle}
              onClose={handleCloseTargetDialog}
              onNewCredentialsClick={openCredentialsDialog}
              onNewPortListClick={openPortListDialog}
              onPortListChange={handlePortListChange}
              onSnmpCredentialChange={handleSnmpCredentialChange}
              onSshCredentialChange={handleSshCredentialChange}
              onEsxiCredentialChange={handleEsxiCredentialChange}
              onSmbCredentialChange={handleSmbCredentialChange}
              onSave={handleSaveTarget}
            />
          )}
          {credentialsDialogVisible && (
            <CredentialsDialog
              types={credentialTypes}
              base={first(credentialTypes)}
              title={`${credentialsTitle}`}
              onClose={handleCloseCredentialsDialog}
              onSave={handleCreateCredential}
            />
          )}
          {portListDialogVisible && (
            <PortListDialog
              title={portListsTitle}
              visible={portListDialogVisible}
              onClose={handleClosePortListDialog}
              onSave={handleCreatePortList}
            />
          )}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

TargetComponent.propTypes = {
  children: PropTypes.func.isRequired,
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

export default TargetComponent;

// vim: set ts=2 sw=2 tw=80:
