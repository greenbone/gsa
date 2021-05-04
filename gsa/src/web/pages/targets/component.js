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

import {parseCsv, YES_VALUE} from 'gmp/parser';

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
          aliveTest: entity.aliveTest,
          comment: entity.comment,
          esxiCredentialId: id_or__(entity.esxiCredential),
          excludeHosts: isDefined(entity.excludeHosts)
            ? entity.excludeHosts.join(', ')
            : '',
          hosts: entity.hosts.join(', '),
          inUse: entity.isInUse(),
          name: entity.name,
          port: isDefined(entity.sshCredential)
            ? entity.sshCredential.port
            : '22',
          reverseLookupOnly: entity.reverseLookupOnly,
          reverseLookupUnify: entity.reverseLookupUnify,
          targetSource: 'manual',
          targetExcludeSource: 'manual',
          targetTitle: _('Edit Target {{name}}', entity),
        }),
      );

      // set credential and port list ids after credentials and port lists have been loaded
      loadAll().then(() => {
        dispatchState(
          updateState({
            smbCredentialId: id_or__(entity.smbCredential),
            sshCredentialId: id_or__(entity.sshCredential),
            snmpCredentialId: id_or__(entity.snmpCredential),
            portListId: id_or__(entity.portList),
          }),
        );
      });
    } else {
      loadAll().then(() => {
        dispatchState(
          updateState({
            portListId: DEFAULT_PORT_LIST_ID,
          }),
        );
      });

      dispatchState(
        updateState({
          targetDialogVisible: true,
          id: undefined,
          aliveTest: undefined,
          allowSimultaneousIPs: YES_VALUE,
          comment: undefined,
          esxiCredentialId: undefined,
          excludeHosts: undefined,
          hosts: undefined,
          inUse: undefined,
          name: undefined,
          port: undefined,
          reverseLookupOnly: undefined,
          reverseLookupUnify: undefined,
          targetSource: undefined,
          targetExcludeSource: undefined,
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
    let portListId;

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
        portListId = createdId;
        closePortListDialog();
        return refetchPortLists();
      })
      .then(() => {
        dispatchState(
          updateState({
            portListId,
          }),
        );
      });
  };

  const handlePortListChange = portListId => {
    dispatchState(
      updateState({
        portListId,
      }),
    );
  };

  const handleEsxiCredentialChange = esxiCredentialId => {
    dispatchState(
      updateState({
        esxiCredentialId,
      }),
    );
  };

  const handleSshCredentialChange = sshCredentialId => {
    dispatchState(
      updateState({
        sshCredentialId,
      }),
    );
  };

  const handleSnmpCredentialChange = snmpCredentialId => {
    dispatchState(
      updateState({
        snmpCredentialId,
      }),
    );
  };

  const handleSmbCredentialChange = smbCredentialId => {
    dispatchState(
      updateState({
        smbCredentialId,
      }),
    );
  };

  const handleInteraction = () => {
    const {onInteraction} = props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const setHostFileText = (file, excludeFile) => {
    let fileText;
    let excludeFileText;

    if (isDefined(file)) {
      fileText = file.text().then(text => {
        return text;
      });
    } else {
      fileText = Promise.resolve();
    }

    if (isDefined(excludeFile)) {
      excludeFileText = excludeFile.text().then(text => {
        return text;
      });
    } else {
      excludeFileText = Promise.resolve();
    }

    return Promise.all([fileText, excludeFileText]);
  };

  const handleSaveTarget = ({
    aliveTest,
    allowSimultaneousIPs,
    comment,
    esxiCredentialId,
    excludeHosts,
    excludeFile,
    file,
    hosts,
    hostsFilter,
    id,
    inUse,
    name,
    port,
    portListId,
    reverseLookupOnly,
    reverseLookupUnify,
    smbCredentialId,
    snmpCredentialId,
    sshCredentialId,
    targetExcludeSource,
    targetSource,
  }) => {
    handleInteraction();

    if (isDefined(id)) {
      const {onSaved, onSaveError} = props;

      return setHostFileText(file, excludeFile)
        .then(text => {
          const [fileText, excludeFileText] = text;

          let mutationData;
          if (inUse) {
            mutationData = {
              name,
              comment,
              aliveTest,
              id,
            };
          } else {
            mutationData = {
              id,
              aliveTest,
              allowSimultaneousIPs,
              comment,
              hosts: targetSource === 'file' ? parseCsv(fileText) : hosts,
              excludeHosts:
                targetExcludeSource === 'file'
                  ? parseCsv(excludeFileText)
                  : excludeHosts,
              name,
              portListId,
              reverseLookupOnly,
              reverseLookupUnify,
              credentials: {
                ssh: sshCredentialId
                  ? {id: sshCredentialId, port: parseInt(port)}
                  : null,
                smb: smbCredentialId ? {id: smbCredentialId} : null,
                snmp: snmpCredentialId ? {id: snmpCredentialId} : null,
                esxi: esxiCredentialId ? {id: esxiCredentialId} : null,
              },
            };
          }

          return modifyTarget(mutationData);
        })
        .then(onSaved, onSaveError)
        .then(closeTargetDialog);
    }

    const {onCreated, onCreateError} = props;

    return setHostFileText(file, excludeFile)
      .then(text => {
        const [fileText, excludeFileText] = text;

        const mutationData = {
          aliveTest,
          allowSimultaneousIPs,
          comment,
          name,
          hosts: targetSource === 'file' ? parseCsv(fileText) : hosts,
          excludeHosts:
            targetExcludeSource === 'file'
              ? parseCsv(excludeFileText)
              : excludeHosts,
          portListId,
          reverseLookupOnly,
          reverseLookupUnify,
          credentials: {
            ssh: sshCredentialId
              ? {id: sshCredentialId, port: parseInt(port)}
              : null,
            smb: smbCredentialId ? {id: smbCredentialId} : null,
            snmp: snmpCredentialId ? {id: snmpCredentialId} : null,
            esxi: esxiCredentialId ? {id: esxiCredentialId} : null,
          },
          hostsFilter,
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
    aliveTest,
    allowSimultaneousIPs,
    comment,
    esxiCredentialId,
    excludeHosts,
    hosts,
    hostsCount,
    hostsFilter,
    id,
    inUse,
    name,
    port,
    portListId,
    reverseLookupOnly,
    reverseLookupUnify,
    smbCredentialId,
    sshCredentialId,
    snmpCredentialId,
    targetSource,
    targetExcludeSource,
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
              aliveTest={aliveTest}
              allowSimultaneousIPs={allowSimultaneousIPs}
              comment={comment}
              // credential={credential} // this is undefined?
              credentials={credentials}
              esxiCredentialId={esxiCredentialId}
              excludeHosts={excludeHosts}
              hosts={hosts}
              hostsCount={hostsCount}
              hostsFilter={hostsFilter}
              id={id}
              inUse={inUse}
              name={name}
              port={port}
              portLists={portLists}
              portListId={portListId}
              reverseLookupOnly={reverseLookupOnly}
              reverseLookupUnify={reverseLookupUnify}
              smbCredentialId={smbCredentialId}
              snmpCredentialId={snmpCredentialId}
              sshCredentialId={sshCredentialId}
              targetSource={targetSource}
              targetExcludeSource={targetExcludeSource}
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
