/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {type EntityActionData} from 'gmp/commands/entity';
import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fastxml';
import type AgentGroup from 'gmp/models/agentgroup';
import {isDefined} from 'gmp/utils/identity';
import useEntityClone from 'web/entity/hooks/useEntityClone';
import {
  useCreateAgentGroup,
  useDeleteAgentGroup,
  useSaveAgentGroup,
} from 'web/hooks/useQuery/agentgroups';
import useTranslation from 'web/hooks/useTranslation';
import AgentGroupsDialog, {
  type AgentGroupDialogData,
} from 'web/pages/agent-groups/AgentGroupsDialog';

interface AgentGroupsComponentRenderProps {
  create: () => void;
  clone: (entity: AgentGroup) => void;
  delete: (entity: AgentGroup) => void;
  edit: (entity: AgentGroup) => void;
}

interface AgentGroupsComponentProps {
  children: (actions: AgentGroupsComponentRenderProps) => React.ReactNode;
  onCloned?: () => void;
  onCloneError?: (error: Rejection) => void;
  onCreated?: (response: Response<EntityActionData, XmlMeta>) => void;
  onCreateError?: (error: Rejection) => void;
  onDeleted?: () => void;
  onDeleteError?: (error: Rejection) => void;
  onDownloaded?: () => void;
  onDownloadError?: (error: Rejection) => void;
  onSaved?: () => void;
  onSaveError?: (error: Rejection) => void;
}

const AgentGroupsComponent = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onSaved,
  onSaveError,
}: AgentGroupsComponentProps) => {
  const [_] = useTranslation();
  const [agentGroupsDialogVisible, setAgentGroupsDialogVisible] =
    useState(false);
  const [selectedAgentGroup, setSelectedAgentGroup] = useState<
    AgentGroup | undefined
  >(undefined);

  const handleClone = useEntityClone<AgentGroup>('agentgroup', {
    onCloned,
    onCloneError,
  });

  const deleteMutation = useDeleteAgentGroup({
    onSuccess: onDeleted,
    onError: onDeleteError,
  });

  const handleDelete = (agentGroup: AgentGroup) => {
    return deleteMutation.mutateAsync({id: agentGroup.id as string});
  };

  const createMutation = useCreateAgentGroup({
    onSuccess: onCreated,
    onError: onCreateError,
  });

  const saveMutation = useSaveAgentGroup({
    onSuccess: onSaved,
    onError: onSaveError,
  });

  const closeDialog = () => {
    setAgentGroupsDialogVisible(false);
    setSelectedAgentGroup(undefined);
  };

  const handleSave = async (data: AgentGroupDialogData) => {
    const backendData = {
      name: data.name,
      scannerId: data.agentController,
      agentIds: data.agentIds,
      comment: data.comment,
      authorized: data.authorized,
      attempts: data.config?.agentControl?.retry.attempts,
      delayInSeconds: data.config?.agentControl?.retry.delayInSeconds,
      maxJitterInSeconds: data.config?.agentControl?.retry.maxJitterInSeconds,
      bulkSize: data.config?.agentScriptExecutor?.bulkSize,
      bulkThrottleTime: data.config?.agentScriptExecutor?.bulkThrottleTimeInMs,
      indexerDirDepth: data.config?.agentScriptExecutor?.indexerDirDepth,
      intervalInSeconds: data.intervalInSeconds,
      missUntilInactive: data.config?.heartbeat?.missUntilInactive,
      schedulerCronTimes: data.schedulerCronExpression,
    };

    if (isDefined(selectedAgentGroup)) {
      await saveMutation.mutateAsync({
        ...backendData,
        id: selectedAgentGroup.id as string,
      });
    } else {
      await createMutation.mutateAsync(backendData);
    }
    closeDialog();
  };

  const openAgentGroupsDialog = (agentGroup?: AgentGroup) => {
    setSelectedAgentGroup(agentGroup);
    setAgentGroupsDialogVisible(true);
  };

  return (
    <>
      {children({
        clone: handleClone,
        delete: handleDelete,
        create: openAgentGroupsDialog,
        edit: openAgentGroupsDialog,
      })}
      {agentGroupsDialogVisible && (
        <AgentGroupsDialog
          agentGroup={selectedAgentGroup}
          title={
            selectedAgentGroup
              ? _('Edit Agent Group {{name}}', {
                  name: selectedAgentGroup.name as string,
                })
              : _('New Agent Group')
          }
          onClose={closeDialog}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default AgentGroupsComponent;
