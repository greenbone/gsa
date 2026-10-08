/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {type EntityActionData} from 'gmp/commands/entity';
import {type CredentialType} from 'gmp/models/credential';
import type WebApplicationTarget from 'gmp/models/web-application-target';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import {useCreateCredential} from 'web/hooks/use-query/credential';
import {
  useCloneWebApplicationTarget,
  useCreateWebApplicationTarget,
  useDeleteWebApplicationTarget,
  useSaveWebApplicationTarget,
} from 'web/hooks/use-query/web-application-target';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import CredentialDialog, {
  type CredentialDialogState,
} from 'web/pages/credentials/CredentialDialog';
import WebApplicationTargetsDialog, {
  type WebApplicationTargetsDialogData,
} from 'web/pages/web-application-targets/WebApplicationTargetsDialog';

interface WebApplicationTargetComponentRenderProps {
  delete: (entity: WebApplicationTarget) => Promise<void>;
  edit: (entity: WebApplicationTarget) => Promise<void>;
  create: () => Promise<void>;
  clone: (entity: WebApplicationTarget) => Promise<EntityActionData>;
  download: (entity: WebApplicationTarget) => Promise<void>;
  save: (entity: WebApplicationTarget) => Promise<void>;
}

interface WebApplicationTargetsComponentProps {
  children: (
    actions: WebApplicationTargetComponentRenderProps,
  ) => React.ReactNode;
  onDeleted?: () => void;
  onDeleteError?: (error: Error) => void;
  onSaved?: () => void;
  onSaveError?: (error: Error) => void;
  onCreated?: (response: EntityActionData) => void;
  onCreateError?: (error: Error) => void;
  onCloned?: () => void;
  onCloneError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onDownloadError?: (error: Error) => void;
}

const WebApplicationTargetsComponent = ({
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
}: WebApplicationTargetsComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const handleEntityDownload = useEntityDownload(
    entity => gmp.webapplicationtarget.export(entity),
    {
      onDownloaded,
      onDownloadError,
    },
  );

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editDialogTitle, setEditDialogTitle] = useState<string | undefined>();
  const [selectedTarget, setSelectedTarget] = useState<
    WebApplicationTarget | undefined
  >(undefined);

  const [credentialsDialogVisible, setCredentialsDialogVisible] =
    useState(false);
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([]);
  const [credentialsTitle, setCredentialsTitle] = useState<string>('');
  const [credentialId, setCredentialId] = useState<string | undefined>(
    undefined,
  );

  const deleteMutation = useDeleteWebApplicationTarget({
    onSuccess: onDeleted,
    onError: onDeleteError,
  });

  const handleDelete = (target: WebApplicationTarget) => {
    if (!target.id) {
      throw new Error('Web Application Target ID is required for deletion');
    }
    return deleteMutation.mutateAsync({
      id: target.id as string,
      name: target.name,
    });
  };

  const saveMutation = useSaveWebApplicationTarget({
    onSuccess: onSaved,
    onError: onSaveError,
  });

  const createMutation = useCreateWebApplicationTarget({
    onSuccess: onCreated,
    onError: onCreateError,
  });

  const cloneMutation = useCloneWebApplicationTarget({
    onSuccess: onCloned,
    onError: onCloneError,
  });

  const createCredentialMutation = useCreateCredential();

  const editTarget = async (target: WebApplicationTarget) => {
    setSelectedTarget(target);
    setEditDialogTitle(
      _('Edit Web Application Target - {{- name}}', {
        name: target.name || target.id || '',
      }),
    );
    setEditDialogVisible(true);
    setCredentialId(target.credential?.id || undefined);
  };

  const createTarget = async () => {
    setSelectedTarget(undefined);
    setEditDialogTitle(_('New Web Application Target'));
    setEditDialogVisible(true);
    setCredentialId(undefined);
  };

  const cloneTarget = async (target: WebApplicationTarget) => {
    if (!target.id) {
      throw new Error('Web Application Target ID is required for cloning');
    }
    return cloneMutation.mutateAsync({
      id: target.id as string,
      name: target.name,
    });
  };

  const downloadTarget = async (target: WebApplicationTarget) => {
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

  const handleSaveEdit = async (data: WebApplicationTargetsDialogData) => {
    const normalizeUrls = (arr: string[]) =>
      arr
        .map(u => u.trim())
        .filter(u => u.length > 0)
        .join(',');

    const normalizedUrls = normalizeUrls(data.urls);
    const normalizedExcludeUrls = normalizeUrls(data.excludeUrls);

    if (selectedTarget?.id) {
      await saveMutation.mutateAsync({
        id: selectedTarget.id,
        name: data.name,
        comment: data.comment,
        urls: normalizedUrls,
        excludeUrls: normalizedExcludeUrls || undefined,
        credentialId,
        inUse: data.inUse,
        reverseLookupOnly: data.reverseLookupOnly,
        reverseLookupUnify: data.reverseLookupUnify,
      });
    } else {
      await createMutation.mutateAsync({
        name: data.name,
        comment: data.comment,
        urls: normalizedUrls,
        excludeUrls: normalizedExcludeUrls || undefined,
        credentialId,
        reverseLookupOnly: data.reverseLookupOnly,
        reverseLookupUnify: data.reverseLookupUnify,
      });
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

  const handleCreateCredential = async (data: CredentialDialogState) => {
    const response = await createCredentialMutation.mutateAsync(data);
    closeCredentialsDialog();
    setCredentialId(response.id);
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
        <WebApplicationTargetsDialog
          comment={selectedTarget?.comment}
          credentialId={credentialId}
          excludeUrls={selectedTarget?.excludeUrls}
          inUse={selectedTarget?.inUse}
          name={selectedTarget?.name}
          reverseLookupOnly={selectedTarget?.reverseLookupOnly}
          reverseLookupUnify={selectedTarget?.reverseLookupUnify}
          title={editDialogTitle}
          urls={selectedTarget?.urls}
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

export default WebApplicationTargetsComponent;
