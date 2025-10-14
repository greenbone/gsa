/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useRef} from 'react';
import {type EntityActionResponse} from 'gmp/commands/entity';
import {
  type OciImageTargetCreateParams,
  type OciImageTargetSaveParams,
} from 'gmp/commands/ociImageTarget';
import type Rejection from 'gmp/http/rejection';
import {
  type default as Credential,
  type CredentialType,
} from 'gmp/models/credential';
import type OciImageTarget from 'gmp/models/ociImageTarget';
import useEntityDownload from 'web/entity/hooks/useEntityDownload';
import useGmp from 'web/hooks/useGmp';
import {
  useCreateOciImageTarget,
  useSaveOciImageTarget,
  useDeleteOciImageTarget,
  useCloneOciImageTarget,
} from 'web/hooks/useQuery/ociImageTargets';
import useTranslation from 'web/hooks/useTranslation';
import ContainerImageTargetsDialog, {
  type ContainerImageTargetsDialogData,
} from 'web/pages/container-image-targets/ContainerImageTargetsDialog';
import CredentialDialog from 'web/pages/credentials/CredentialDialog';
import {UNSET_VALUE} from 'web/utils/Render';

interface ContainerImageTargetComponentRenderProps {
  delete: (entity: OciImageTarget) => Promise<void>;
  edit: (entity: OciImageTarget) => void;
  create: (initial?: Record<string, unknown>) => void;
  clone: (entity: OciImageTarget) => Promise<EntityActionResponse>;
  download: (entity: OciImageTarget) => Promise<void>;
  save: (entity: OciImageTarget) => void;
}

interface ContainerImageTargetsComponentProps {
  children: (
    actions: ContainerImageTargetComponentRenderProps,
  ) => React.ReactNode;
  onDeleted?: () => void;
  onDeleteError?: (error: Rejection) => void;
  onSaved?: () => void;
  onSaveError?: (error: Rejection) => void;
  onCreated?: () => void;
  onCreateError?: (error: Rejection) => void;
  onCloned?: () => void;
  onCloneError?: (error: Rejection) => void;
  onDownloaded?: (data: {filename: string; data: string}) => void;
  onDownloadError?: (error: Rejection) => void;
}

const ContainerImageTargetsComponent = ({
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
}: ContainerImageTargetsComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const idFieldRef = useRef<string | null>(null);

  const handleEntityDownload = useEntityDownload('ociimagetarget', {
    onDownloaded,
    onDownloadError,
  });

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editDialogTitle, setEditDialogTitle] = useState<string | undefined>();
  const [selectedTarget, setSelectedTarget] = useState<
    OciImageTarget | undefined
  >(undefined);
  const [credentialsDialogVisible, setCredentialsDialogVisible] =
    useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([]);
  const [credentialsTitle, setCredentialsTitle] = useState<string>('');
  const [credentialId, setCredentialId] = useState<string>(UNSET_VALUE);

  const deleteMutation = useDeleteOciImageTarget({
    onSuccess: onDeleted,
    onError: onDeleteError,
  });

  const handleDelete = (target: OciImageTarget) => {
    if (!target.id) {
      throw new Error('Container ImageTarget ID is required for deletion');
    }
    return deleteMutation.mutateAsync({id: target.id as string});
  };

  const saveMutation = useSaveOciImageTarget({
    onSuccess: onSaved,
    onError: onSaveError,
  });

  const createMutation = useCreateOciImageTarget({
    onSuccess: onCreated,
    onError: onCreateError,
  });

  const cloneMutation = useCloneOciImageTarget({
    onSuccess: onCloned,
    onError: onCloneError,
  });

  const loadCredentials = async () => {
    // @ts-expect-error
    const response = await gmp.credentials.getAll();
    return response.data;
  };

  const editTarget = async (target: OciImageTarget) => {
    setSelectedTarget(target);
    setEditDialogTitle(
      _('Edit Container Image Target - {{name}}', {
        name: target.name || target.id || '',
      }),
    );
    setEditDialogVisible(true);
    const creds = await loadCredentials();
    setCredentials(creds);

    setCredentialId(target.credential?.id || UNSET_VALUE);
  };

  const createTarget = async (initial: Record<string, unknown> = {}) => {
    setSelectedTarget(undefined);
    setEditDialogTitle(_('New Container Image Target'));
    setEditDialogVisible(true);
    const creds = await loadCredentials();
    setCredentials(creds);

    setCredentialId(UNSET_VALUE);
  };

  const cloneTarget = async (target: OciImageTarget) => {
    if (!target.id) {
      throw new Error('Container Image Target ID is required for cloning');
    }
    return cloneMutation.mutateAsync({id: target.id as string});
  };

  const downloadTarget = async (target: OciImageTarget) => {
    return handleEntityDownload(target);
  };

  const closeEditDialog = () => {
    setEditDialogVisible(false);
    setSelectedTarget(undefined);
    setCredentialId(UNSET_VALUE);
  };

  const handleCloseEditDialog = () => {
    closeEditDialog();
  };

  const handleSaveEdit = async (data: ContainerImageTargetsDialogData) => {
    if (selectedTarget?.id) {
      const saveParams: OciImageTargetSaveParams = {
        id: selectedTarget.id,
      };

      saveParams.name = data.name || '';
      saveParams.comment = data.comment || '';

      if (data.hosts) {
        saveParams.imageReferences = data.hosts;
      }

      if (credentialId && credentialId !== UNSET_VALUE) {
        saveParams.credentialId = credentialId;
      }

      if (data.reverseLookupOnly !== undefined) {
        saveParams.reverseLookupOnly = data.reverseLookupOnly;
      }

      if (data.reverseLookupUnify !== undefined) {
        saveParams.reverseLookupUnify = data.reverseLookupUnify;
      }

      saveParams.inUse = data.inUse;

      if (data.targetSource) {
        saveParams.targetSource = data.targetSource;
      }

      if (data.targetExcludeSource) {
        saveParams.targetExcludeSource = data.targetExcludeSource;
      }

      await saveMutation.mutateAsync(saveParams);
    } else {
      const createParams: OciImageTargetCreateParams = {
        name: data.name || '',
        comment: data.comment || '',
        imageReferences: data.hosts || '',
        targetSource: data.targetSource || 'manual',
        targetExcludeSource: data.targetExcludeSource || 'manual',
        credentialId: credentialId !== UNSET_VALUE ? credentialId : undefined,
      };

      if (data.reverseLookupOnly !== undefined) {
        createParams.reverseLookupOnly = data.reverseLookupOnly;
      }

      if (data.reverseLookupUnify !== undefined) {
        createParams.reverseLookupUnify = data.reverseLookupUnify;
      }

      await createMutation.mutateAsync(createParams);
    }
    closeEditDialog();
  };

  const openCredentialsDialog = ({idField, types, title}) => {
    idFieldRef.current = idField;
    setCredentialTypes(types);
    setCredentialsTitle(title);
    setCredentialsDialogVisible(true);
  };

  const closeCredentialsDialog = () => {
    setCredentialsDialogVisible(false);
  };

  const handleCloseCredentialsDialog = () => {
    closeCredentialsDialog();
  };

  const handleCreateCredential = async data => {
    // @ts-expect-error
    const response = await gmp.credential.create(data);
    closeCredentialsDialog();
    const newCredentials = await loadCredentials();
    setCredentials(newCredentials);

    if (response.data?.id) {
      setCredentialId(response.data.id);
    }
  };

  return (
    <>
      {children({
        delete: handleDelete,
        edit: editTarget,
        create: createTarget,
        clone: cloneTarget,
        download: downloadTarget,
        save: editTarget,
      })}
      {editDialogVisible && (
        <ContainerImageTargetsDialog
          comment={selectedTarget?.comment ?? ''}
          credentials={credentials}
          excludeHosts={''}
          hosts={
            selectedTarget?.imageReferences
              ? selectedTarget.imageReferences.join(', ')
              : ''
          }
          inUse={selectedTarget?.inUse ?? false}
          name={selectedTarget?.name}
          reverseLookupOnly={selectedTarget?.reverseLookupOnly ?? false}
          reverseLookupUnify={selectedTarget?.reverseLookupUnify ?? false}
          smbCredentialId={credentialId}
          targetExcludeSource={'manual'}
          targetSource={'manual'}
          title={editDialogTitle}
          onClose={handleCloseEditDialog}
          onNewCredentialsClick={openCredentialsDialog}
          onSave={handleSaveEdit}
          onSmbCredentialChange={setCredentialId}
        />
      )}
      {credentialsDialogVisible && (
        <CredentialDialog
          title={credentialsTitle}
          types={credentialTypes}
          onClose={handleCloseCredentialsDialog}
          onSave={handleCreateCredential}
        />
      )}
    </>
  );
};

export default ContainerImageTargetsComponent;
