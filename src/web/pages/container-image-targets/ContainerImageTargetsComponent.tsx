/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {type EntityActionResponse} from 'gmp/commands/entity';
import {
  type OciImageTargetCreateParams,
  type OciImageTargetSaveParams,
} from 'gmp/commands/oci-image-target';
import {
  type default as Credential,
  type CredentialType,
} from 'gmp/models/credential';
import type OciImageTarget from 'gmp/models/oci-image-target';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import {
  useCreateOciImageTarget,
  useSaveOciImageTarget,
  useDeleteOciImageTarget,
  useCloneOciImageTarget,
} from 'web/hooks/use-query/oci-image-targets';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ContainerImageTargetsDialog, {
  type ContainerImageTargetsDialogData,
} from 'web/pages/container-image-targets/ContainerImageTargetsDialog';
import CredentialDialog from 'web/pages/credentials/CredentialDialog';

interface ContainerImageTargetComponentRenderProps {
  delete: (entity: OciImageTarget) => Promise<void>;
  edit: (entity: OciImageTarget) => void;
  create: () => void;
  clone: (entity: OciImageTarget) => Promise<EntityActionResponse>;
  download: (entity: OciImageTarget) => Promise<void>;
  save: (entity: OciImageTarget) => void;
}

interface ContainerImageTargetsComponentProps {
  children: (
    actions: ContainerImageTargetComponentRenderProps,
  ) => React.ReactNode;
  onDeleted?: () => void;
  onDeleteError?: (error: Error) => void;
  onSaved?: () => void;
  onSaveError?: (error: Error) => void;
  onCreated?: () => void;
  onCreateError?: (error: Error) => void;
  onCloned?: () => void;
  onCloneError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onDownloadError?: (error: Error) => void;
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

  const handleEntityDownload = useEntityDownload(
    entity => gmp.ociimagetarget.export(entity),
    {
      onDownloaded,
      onDownloadError,
    },
  );

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
  const [credentialId, setCredentialId] = useState<string | undefined>(
    undefined,
  );

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

    setCredentialId(target.credential?.id || undefined);
  };

  const createTarget = async () => {
    setSelectedTarget(undefined);
    setEditDialogTitle(_('New Container Image Target'));
    setEditDialogVisible(true);
    const creds = await loadCredentials();
    setCredentials(creds);

    setCredentialId(undefined);
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
    setCredentialId(undefined);
  };

  const handleCloseEditDialog = () => {
    closeEditDialog();
  };

  const handleSaveEdit = async (data: ContainerImageTargetsDialogData) => {
    if (selectedTarget?.id) {
      const saveParams: OciImageTargetSaveParams = {
        id: selectedTarget.id,
        name: data.name,
        comment: data.comment,
        imageReferences: data.hosts,
        credentialId,
        reverseLookupOnly: data.reverseLookupOnly,
        reverseLookupUnify: data.reverseLookupUnify,
        inUse: data.inUse,
        targetSource: data.targetSource,
        targetExcludeSource: data.targetExcludeSource,
      };

      await saveMutation.mutateAsync(saveParams);
    } else {
      const createParams: OciImageTargetCreateParams = {
        name: data.name || '',
        comment: data.comment || '',
        imageReferences: data.hosts || '',
        targetSource: data.targetSource || 'manual',
        targetExcludeSource: data.targetExcludeSource || 'manual',
        credentialId,
        reverseLookupOnly: data.reverseLookupOnly,
        reverseLookupUnify: data.reverseLookupUnify,
      };

      await createMutation.mutateAsync(createParams);
    }
    closeEditDialog();
  };

  const openCredentialsDialog = ({
    types,
    title,
  }: {
    types: CredentialType[];
    title: string;
  }) => {
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
          comment={selectedTarget?.comment}
          credentialId={credentialId}
          credentials={credentials}
          excludeHosts={''}
          hosts={selectedTarget?.imageReferences.join(', ')}
          inUse={selectedTarget?.inUse}
          name={selectedTarget?.name}
          reverseLookupOnly={selectedTarget?.reverseLookupOnly}
          reverseLookupUnify={selectedTarget?.reverseLookupUnify}
          targetExcludeSource={'manual'}
          targetSource={'manual'}
          title={editDialogTitle}
          onClose={handleCloseEditDialog}
          onCredentialChange={setCredentialId}
          onNewCredentialsClick={openCredentialsDialog}
          onSave={handleSaveEdit}
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
