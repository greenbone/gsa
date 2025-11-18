/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useRef} from 'react';
import {
  type TargetCommandSaveParams,
  type TargetExcludeSource,
  type TargetSource,
} from 'gmp/commands/target';
import {
  type default as Credential,
  type CredentialType,
} from 'gmp/models/credential';
import type Filter from 'gmp/models/filter';
import type PortList from 'gmp/models/port-list';
import {
  type default as Target,
  type AliveTest,
  SCAN_CONFIG_DEFAULT,
} from 'gmp/models/target';
import {type YesNo} from 'gmp/parser';
import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import useEntityClone, {
  type EntityCloneResponse,
} from 'web/entity/hooks/useEntityClone';
import useEntityCreate, {
  type EntityCreateResponse,
} from 'web/entity/hooks/useEntityCreate';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import useEntitySave, {
  type EntitySaveResponse,
} from 'web/entity/hooks/useEntitySave';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import CredentialDialog, {
  type CredentialDialogState,
} from 'web/pages/credentials/CredentialDialog';
import PortListDialog from 'web/pages/portlists/PortListDialog';
import TargetDialog, {
  DEFAULT_PORT_LIST_ID,
  type NewCredentialData,
  type ReferenceCredentialId,
  type TargetDialogData,
} from 'web/pages/targets/TargetDialog';
import {UNSET_VALUE} from 'web/utils/Render';

interface OpenTargetDialogData {
  hostsCount?: number;
  hostsFilter?: Filter;
}

interface TargetComponentRenderProps {
  clone: (target: Target) => Promise<void>;
  create: (data?: OpenTargetDialogData) => void;
  delete: (target: Target) => Promise<void>;
  download: (entity: Target) => Promise<void>;
  edit: (target: Target, data?: OpenTargetDialogData) => Promise<void>;
}

interface TargetComponentProps {
  children: (props: TargetComponentRenderProps) => React.ReactNode;
  onCloned?: (response: EntityCloneResponse) => void;
  onCloneError?: (error: Error) => void;
  onCreated?: (response: EntityCreateResponse) => void;
  onCreateError?: (error: Error) => void;
  onDeleted?: () => void;
  onDeleteError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onDownloadError?: (error: Error) => void;
  onSaved?: (response: EntitySaveResponse) => void;
  onSaveError?: (error: Error) => void;
}

const TargetComponent = ({
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
}: TargetComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const idFieldRef = useRef<ReferenceCredentialId | undefined>(undefined);
  const [credentialsDialogVisible, setCredentialsDialogVisible] =
    useState(false);
  const [credentialsTitle, setCredentialsTitle] = useState('');
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [portListDialogVisible, setPortListDialogVisible] = useState(false);
  const [targetDialogVisible, setTargetDialogVisible] = useState(false);
  const [targetTitle, setTargetTitle] = useState('');
  const [portListId, setPortListId] = useState<string | undefined>(
    DEFAULT_PORT_LIST_ID,
  );
  const [portLists, setPortLists] = useState<PortList[]>([]);
  const [portListsTitle, setPortListsTitle] = useState('');
  const [port, setPort] = useState<number | undefined>(undefined);
  const [aliveTests, setAliveTests] = useState<AliveTest[]>([
    SCAN_CONFIG_DEFAULT,
  ]);
  const [allowSimultaneousIPs, setAllowSimultaneousIPs] =
    useState<boolean>(true);
  const [comment, setComment] = useState<string | undefined>(undefined);
  const [esxiCredentialId, setEsxiCredentialId] = useState<string | undefined>(
    undefined,
  );
  const [krb5CredentialId, setKrb5CredentialId] = useState<string | undefined>(
    undefined,
  );
  const [smbCredentialId, setSmbCredentialId] = useState<string | undefined>(
    undefined,
  );
  const [snmpCredentialId, setSnmpCredentialId] = useState<string | undefined>(
    undefined,
  );
  const [sshCredentialId, setSshCredentialId] = useState<string | undefined>(
    undefined,
  );
  const [sshElevateCredentialId, setSshElevateCredentialId] = useState<
    string | undefined
  >(undefined);
  const [name, setName] = useState<string | undefined>(undefined);
  const [inUse, setInUse] = useState<boolean>(false);
  const [excludeHosts, setExcludeHosts] = useState<string | undefined>(
    undefined,
  );
  const [hosts, setHosts] = useState<string | undefined>(undefined);
  const [reverseLookupOnly, setReverseLookupOnly] = useState<YesNo | undefined>(
    undefined,
  );
  const [reverseLookupUnify, setReverseLookupUnify] = useState<
    YesNo | undefined
  >(undefined);
  const [targetExcludeSource, setTargetExcludeSource] = useState<
    TargetExcludeSource | undefined
  >(undefined);
  const [targetSource, setTargetSource] = useState<TargetSource | undefined>(
    undefined,
  );
  const [targetId, setTargetId] = useState<string | undefined>(undefined);
  const [hostsCount, setHostsCount] = useState<number | undefined>(undefined);
  const [hostsFilter, setHostsFilter] = useState<Filter | undefined>(undefined);

  const loadCredentials = async () => {
    // @ts-expect-error
    const response = await gmp.credentials.getAll();
    setCredentials(response.data);
  };

  const loadPortLists = async () => {
    const response = await gmp.portlists.getAll();
    setPortLists(response.data);
  };

  const loadAll = async () => {
    await Promise.all([loadCredentials(), loadPortLists()]);
  };

  const openCredentialsDialog = ({
    idField,
    types,
    title,
  }: NewCredentialData) => {
    idFieldRef.current = idField;
    setCredentialsDialogVisible(true);
    setCredentialsTitle(title);
    setCredentialTypes(types);
  };

  const closeCredentialsDialog = () => {
    setCredentialsDialogVisible(false);
  };

  const handleCloseCredentialsDialog = () => {
    closeCredentialsDialog();
  };

  const openPortListDialog = () => {
    setPortListDialogVisible(true);
    setPortListsTitle(_('New Port List'));
  };

  const closePortListDialog = () => {
    setPortListDialogVisible(false);
  };

  const handleClosePortListDialog = () => {
    closePortListDialog();
  };

  const openTargetDialog = async (
    entity?: Target,
    {hostsCount, hostsFilter}: OpenTargetDialogData = {},
  ) => {
    if (isDefined(entity)) {
      // @ts-expect-error
      setPort(entity?.ssh_credential?.port);
      setAliveTests(entity.alive_tests);
      setAllowSimultaneousIPs(entity.allowSimultaneousIPs);
      setComment(entity.comment);
      setTargetTitle(_('Edit Target {{name}}', {name: entity.name as string}));
      setEsxiCredentialId(entity.esxi_credential?.id);
      setKrb5CredentialId(entity.krb5_credential?.id);
      setSmbCredentialId(entity.smb_credential?.id);
      setSnmpCredentialId(entity.snmp_credential?.id);
      setSshCredentialId(entity.ssh_credential?.id);
      setSshElevateCredentialId(entity.ssh_elevate_credential?.id);
      setPortListId(entity.port_list?.id);
      setName(entity.name);
      setInUse(entity.isInUse());
      setExcludeHosts(entity.exclude_hosts?.join(', '));
      setHosts(entity.hosts.join(', '));
      setReverseLookupOnly(entity.reverse_lookup_only);
      setReverseLookupUnify(entity.reverse_lookup_unify);
      setTargetSource('manual');
      setTargetExcludeSource('manual');
      setTargetId(entity.id);
    } else {
      setAliveTests([SCAN_CONFIG_DEFAULT]);
      setAllowSimultaneousIPs(true);
      setPort(undefined);
      setComment(undefined);
      setName(undefined);
      setTargetTitle(_('New Target'));
      setEsxiCredentialId(undefined);
      setKrb5CredentialId(undefined);
      setSmbCredentialId(undefined);
      setSnmpCredentialId(undefined);
      setSshCredentialId(undefined);
      setSshElevateCredentialId(undefined);
      setPortListId(DEFAULT_PORT_LIST_ID);
      setInUse(false);
      setExcludeHosts(undefined);
      setHosts(undefined);
      setReverseLookupOnly(undefined);
      setReverseLookupUnify(undefined);
      setTargetSource(undefined);
      setTargetExcludeSource(undefined);
      setTargetId(undefined);
    }
    setHostsCount(hostsCount);
    setHostsFilter(hostsFilter);
    await loadAll();
    setTargetDialogVisible(true);
  };

  const openCreateTargetDialog = (data?: OpenTargetDialogData) => {
    void openTargetDialog(undefined, data);
  };

  const closeTargetDialog = () => {
    setTargetDialogVisible(false);
  };

  const handleCloseTargetDialog = () => {
    closeTargetDialog();
  };

  const handleCreateCredential = async (data: CredentialDialogState) => {
    // @ts-expect-error
    const response = await gmp.credential.create(data);
    const credentialId = response.data.id;
    closeCredentialsDialog();
    await loadCredentials();
    if (idFieldRef.current === 'sshElevateCredentialId') {
      setSshElevateCredentialId(credentialId);
    } else if (idFieldRef.current === 'sshCredentialId') {
      setSshCredentialId(credentialId);
    } else if (idFieldRef.current === 'smbCredentialId') {
      setSmbCredentialId(credentialId);
    } else if (idFieldRef.current === 'esxiCredentialId') {
      setEsxiCredentialId(credentialId);
    } else if (idFieldRef.current === 'snmpCredentialId') {
      setSnmpCredentialId(credentialId);
    } else if (idFieldRef.current === 'krb5CredentialId') {
      setKrb5CredentialId(credentialId);
    }
  };

  const handleCreatePortList = async data => {
    const response = await gmp.portlist.create(data);
    setPortListId(response.data.id);
    closePortListDialog();
    await loadPortLists();
  };

  const handlePortListChange = (portListId: string | undefined) => {
    setPortListId(portListId);
  };

  const handleSshCredentialChange = (sshCredentialId: string | undefined) => {
    sshCredentialId = sshCredentialId ?? UNSET_VALUE;

    setSshCredentialId(sshCredentialId);

    if (sshCredentialId === UNSET_VALUE) {
      setSshElevateCredentialId(UNSET_VALUE);
    }
  };

  const handleSshElevateCredentialChange = (
    sshElevateCredentialId: string | undefined,
  ) => {
    setSshElevateCredentialId(sshElevateCredentialId ?? UNSET_VALUE);
  };

  const handleSmbCredentialChange = (smbCredentialId: string | undefined) => {
    setSmbCredentialId(smbCredentialId ?? UNSET_VALUE);
  };

  const handleSnmpCredentialChange = (snmpCredentialId: string | undefined) => {
    setSnmpCredentialId(snmpCredentialId ?? UNSET_VALUE);
  };

  const handleEsxiCredentialChange = (esxiCredentialId: string | undefined) => {
    setEsxiCredentialId(esxiCredentialId ?? UNSET_VALUE);
  };

  const handleKrb5CredentialChange = (krb5CredentialId: string | undefined) => {
    setKrb5CredentialId(krb5CredentialId ?? UNSET_VALUE);
  };

  const handleEntityClone = useEntityClone<Target>(
    entity => gmp.target.clone(entity),
    {
      onCloned,
      onCloneError,
    },
  );

  const handleEntitySave = useEntitySave<TargetCommandSaveParams>(
    data => gmp.target.save(data),
    {
      onSaved,
      onSaveError,
    },
  );

  const handleEntityCreate = useEntityCreate<TargetDialogData>(
    data => gmp.target.create(data),
    {
      onCreated,
      onCreateError,
    },
  );

  const handleSaveClick = async (data: TargetDialogData) => {
    const promise = isDefined(data.id)
      ? handleEntitySave(
          data.inUse
            ? {
                id: data.id as string,
                comment: data.comment,
                aliveTests: data.aliveTests,
                name: data.name,
              }
            : {
                ...data,
                id: data.id as string,
              },
        )
      : handleEntityCreate(data);
    await promise;
    closeTargetDialog();
  };

  const handleEntityDownload = useEntityDownload<Target>(
    entity => gmp.target.export(entity),
    {
      onDownloaded,
      onDownloadError,
    },
  );

  const handleEntityDelete = useEntityDelete<Target>(
    entity => gmp.target.delete(entity),
    {
      onDeleted,
      onDeleteError,
    },
  );

  return (
    <>
      {children({
        clone: handleEntityClone,
        create: openCreateTargetDialog,
        delete: handleEntityDelete,
        download: handleEntityDownload,
        edit: openTargetDialog,
      })}
      {targetDialogVisible && (
        <TargetDialog
          aliveTests={aliveTests}
          allowSimultaneousIPs={allowSimultaneousIPs}
          comment={comment}
          credentials={credentials}
          esxiCredentialId={esxiCredentialId}
          excludeHosts={excludeHosts}
          hosts={hosts}
          hostsCount={hostsCount}
          hostsFilter={hostsFilter}
          id={targetId}
          inUse={inUse}
          krb5CredentialId={krb5CredentialId}
          name={name}
          port={port}
          portListId={portListId}
          portLists={portLists}
          reverseLookupOnly={reverseLookupOnly}
          reverseLookupUnify={reverseLookupUnify}
          smbCredentialId={smbCredentialId}
          snmpCredentialId={snmpCredentialId}
          sshCredentialId={sshCredentialId}
          sshElevateCredentialId={sshElevateCredentialId}
          targetExcludeSource={targetExcludeSource}
          targetSource={targetSource}
          title={targetTitle}
          onClose={handleCloseTargetDialog}
          onEsxiCredentialChange={handleEsxiCredentialChange}
          onKrb5CredentialChange={handleKrb5CredentialChange}
          onNewCredentialsClick={openCredentialsDialog}
          onNewPortListClick={openPortListDialog}
          onPortListChange={handlePortListChange}
          onSave={handleSaveClick}
          onSmbCredentialChange={handleSmbCredentialChange}
          onSnmpCredentialChange={handleSnmpCredentialChange}
          onSshCredentialChange={handleSshCredentialChange}
          onSshElevateCredentialChange={handleSshElevateCredentialChange}
        />
      )}
      {credentialsDialogVisible && (
        <CredentialDialog
          credential_type={first(credentialTypes)}
          title={`${credentialsTitle}`}
          types={credentialTypes}
          onClose={handleCloseCredentialsDialog}
          onSave={handleCreateCredential}
        />
      )}
      {portListDialogVisible && (
        <PortListDialog
          title={portListsTitle}
          onClose={handleClosePortListDialog}
          onSave={handleCreatePortList}
        />
      )}
    </>
  );
};

export default TargetComponent;
