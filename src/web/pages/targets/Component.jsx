/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useRef} from 'react';
import {YES_VALUE} from 'gmp/parser';
import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import CredentialsDialog from 'web/pages/credentials/Dialog';
import PortListDialog from 'web/pages/portlists/PortListDialog';
import TargetDialog from 'web/pages/targets/Dialog';
import PropTypes from 'web/utils/PropTypes';
import {UNSET_VALUE} from 'web/utils/Render';

const DEFAULT_PORT_LIST_ID = '33d0cd82-57c6-11e1-8ed1-406186ea4fc5'; // All IANA assigned TCP 2012-02-10

const getIdOrDefault = value => (isDefined(value) ? value.id : UNSET_VALUE);

function TargetComponent(props) {
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
  } = props;
  const gmp = useGmp();
  const [_] = useTranslation();
  const idFieldRef = useRef(null);

  const [state, setState] = useState({
    credentialsDialogVisible: false,
    portListDialogVisible: false,
    targetDialogVisible: false,
    portListId: DEFAULT_PORT_LIST_ID,
  });

  const updateState = upd => setState(prev => ({...prev, ...upd}));

  const loadCredentials = async () => {
    const response = await gmp.credentials.getAll();
    return response.data;
  };

  const loadPortLists = async () => {
    const response = await gmp.portlists.getAll();
    return response.data;
  };

  const loadAll = async () => {
    const [credentials, portLists] = await Promise.all([
      loadCredentials(),
      loadPortLists(),
    ]);
    updateState({credentials, portLists});
  };

  const openCredentialsDialog = ({idField, types, title}) => {
    idFieldRef.current = idField;
    updateState({
      credentialsDialogVisible: true,
      credentialTypes: types,
      credentialsTitle: title,
    });
  };

  const closeCredentialsDialog = () =>
    updateState({credentialsDialogVisible: false});

  const handleCloseCredentialsDialog = () => {
    closeCredentialsDialog();
  };

  const openPortListDialog = () => {
    updateState({
      portListDialogVisible: true,
      portListsTitle: _('New Port List'),
    });
  };

  const closePortListDialog = () => updateState({portListDialogVisible: false});

  const handleClosePortListDialog = () => {
    closePortListDialog();
  };

  const openTargetDialog = async (entity, initial = {}) => {
    if (isDefined(entity)) {
      updateState({
        targetDialogVisible: true,
        id: entity.id,
        allowSimultaneousIPs: entity.allowSimultaneousIPs,
        aliveTests: entity.alive_tests,
        comment: entity.comment,
        esxiCredentialId: getIdOrDefault(entity.esxi_credential),
        excludeHosts: isDefined(entity.exclude_hosts)
          ? entity.exclude_hosts.join(', ')
          : '',
        hosts: entity.hosts.join(', '),
        inUse: entity.isInUse(),
        name: entity.name,
        port: isDefined(entity.ssh_credential)
          ? entity.ssh_credential.port
          : '22',
        reverseLookupOnly: entity.reverse_lookup_only,
        reverseLookupUnify: entity.reverse_lookup_unify,
        targetSource: 'manual',
        targetExcludeSource: 'manual',
        targetTitle: _('Edit Target {{name}}', entity),
      });
      await loadAll();
      updateState({
        krb5CredentialId: getIdOrDefault(entity.krb5_credential),
        portListId: getIdOrDefault(entity.port_list),
        smbCredentialId: getIdOrDefault(entity.smb_credential),
        snmpCredentialId: getIdOrDefault(entity.snmp_credential),
        sshCredentialId: getIdOrDefault(entity.ssh_credential),
        sshElevateCredentialId: getIdOrDefault(entity.ssh_elevate_credential),
      });
    } else {
      await loadAll();
      updateState({
        aliveTests: undefined,
        allowSimultaneousIPs: YES_VALUE,
        comment: undefined,
        esxiCredentialId: undefined,
        excludeHosts: undefined,
        hosts: undefined,
        id: undefined,
        inUse: undefined,
        krb5CredentialId: undefined,
        name: undefined,
        port: undefined,
        reverseLookupOnly: undefined,
        reverseLookupUnify: undefined,
        smbCredentialId: undefined,
        snmpCredentialId: undefined,
        sshCredentialId: undefined,
        sshElevateCredentialId: undefined,
        targetDialogVisible: true,
        targetExcludeSource: undefined,
        targetSource: undefined,
        targetTitle: _('New Target'),
        ...initial,
      });
    }
  };

  const openCreateTargetDialog = (initial = {}) =>
    openTargetDialog(undefined, initial);

  const closeTargetDialog = () => updateState({targetDialogVisible: false});

  const handleCloseTargetDialog = () => {
    closeTargetDialog();
  };

  const handleCreateCredential = async data => {
    const response = await gmp.credential.create(data);
    const {data: credential} = response;
    const credentialId = credential.id;
    closeCredentialsDialog();
    const credentials = await loadCredentials();
    updateState({[idFieldRef.current]: credentialId, credentials});
  };

  const handleCreatePortList = async data => {
    const response = await gmp.portlist.create(data);
    const {data: portlist} = response;
    const portListId = portlist.id;
    closePortListDialog();
    const portLists = await loadPortLists();
    updateState({portLists, portListId});
  };

  const handlePortListChange = portListId => updateState({portListId});

  const handleEsxiCredentialChange = esxiCredentialId =>
    updateState({esxiCredentialId});

  /**
   * if ssh_credential_id is changed to UNSET_VALUE, elevate privileges option will not be rendered anymore.
   * If we don't reset ssh_elevate_credential_id, then the previously set ssh_elevate_credential_id will never be available for the SSH dropdown again because it will still be set in the dialog state.
   * ssh_elevate_credential_id should be available again if we ever unset ssh_credential_id
   */
  const handleSshCredentialChange = sshCredentialId => {
    updateState({sshCredentialId});

    if (sshCredentialId === UNSET_VALUE) {
      updateState({sshElevateCredentialId: UNSET_VALUE});
    }
  };

  const handleSshElevateCredentialChange = sshElevateCredentialId =>
    updateState({sshElevateCredentialId});

  const handleSnmpCredentialChange = snmpCredentialId =>
    updateState({snmpCredentialId});

  const handleSmbCredentialChange = smbCredentialId =>
    updateState({smbCredentialId});

  const handleKrb5CredentialChange = krb5CredentialId =>
    updateState({krb5CredentialId});

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
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, create, ...other}) => (
        <>
          {children({
            ...other,
            create: openCreateTargetDialog,
            edit: openTargetDialog,
          })}
          {state.targetDialogVisible && (
            <TargetDialog
              aliveTests={state.aliveTests}
              allowSimultaneousIPs={state.allowSimultaneousIPs}
              comment={state.comment}
              credential={state.credential}
              credentials={state.credentials}
              esxiCredentialId={state.esxiCredentialId}
              excludeHosts={state.excludeHosts}
              hosts={state.hosts}
              hostsCount={state.hostsCount}
              hostsFilter={state.hostsFilter}
              id={state.id}
              inUse={state.inUse}
              krb5CredentialId={state.krb5CredentialId}
              name={state.name}
              port={state.port}
              portListId={state.portListId}
              portLists={state.portLists}
              reverseLookupOnly={state.reverseLookupOnly}
              reverseLookupUnify={state.reverseLookupUnify}
              smbCredentialId={state.smbCredentialId}
              snmpCredentialId={state.snmpCredentialId}
              sshCredentialId={state.sshCredentialId}
              sshElevateCredentialId={state.sshElevateCredentialId}
              targetExcludeSource={state.targetExcludeSource}
              targetSource={state.targetSource}
              title={state.targetTitle}
              onClose={handleCloseTargetDialog}
              onEsxiCredentialChange={handleEsxiCredentialChange}
              onKrb5CredentialChange={handleKrb5CredentialChange}
              onNewCredentialsClick={openCredentialsDialog}
              onNewPortListClick={openPortListDialog}
              onPortListChange={handlePortListChange}
              onSave={d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                return promise.then(() => closeTargetDialog());
              }}
              onSmbCredentialChange={handleSmbCredentialChange}
              onSnmpCredentialChange={handleSnmpCredentialChange}
              onSshCredentialChange={handleSshCredentialChange}
              onSshElevateCredentialChange={handleSshElevateCredentialChange}
            />
          )}
          {state.credentialsDialogVisible && (
            <CredentialsDialog
              base={first(state.credentialTypes)}
              title={`${state.credentialsTitle}`}
              types={state.credentialTypes}
              onClose={handleCloseCredentialsDialog}
              onSave={handleCreateCredential}
            />
          )}
          {state.portListDialogVisible && (
            <PortListDialog
              title={state.portListsTitle}
              visible={state.portListDialogVisible}
              onClose={handleClosePortListDialog}
              onSave={handleCreatePortList}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
}

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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default TargetComponent;
