/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import Rejection from 'gmp/http/rejection';
import Agent from 'gmp/models/agent';
import {useDeleteAgent, useModifyAgent} from 'web/hooks/useQuery/agents';
import useTranslation from 'web/hooks/useTranslation';
import AgentDialog, {AgentDialogState} from 'web/pages/agents/AgentDialog';

interface AgentComponentRenderProps {
  delete: (entity: Agent) => Promise<void>;
  edit: (entity: Agent) => void;
  authorize: (entity: Agent) => Promise<void>;
}

interface AgentComponentProps {
  children: (actions: AgentComponentRenderProps) => React.ReactNode;
  onDeleted?: () => void;
  onDeleteError?: (error: Rejection) => void;
  onSaved?: () => void;
  onSaveError?: (error: Rejection) => void;
}

const AgentComponent = ({
  children,
  onDeleted,
  onDeleteError,
  onSaved,
  onSaveError,
}: AgentComponentProps) => {
  const [_] = useTranslation();

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editDialogTitle, setEditDialogTitle] = useState<string | undefined>();
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(
    undefined,
  );

  const deleteMutation = useDeleteAgent({
    onSuccess: onDeleted,
    onError: onDeleteError,
  });

  const handleDelete = (agent: Agent) => {
    if (!agent.id) {
      throw new Error('Agent ID is required for deletion');
    }
    return deleteMutation.mutateAsync({id: agent.id as string});
  };

  const modifyAgentsMutation = useModifyAgent({
    onSuccess: onSaved,
    onError: onSaveError,
  });

  const handleAuthorize = async (agent: Agent) => {
    await modifyAgentsMutation.mutateAsync({
      agentsIds: [agent.id as string],
      authorized: !agent.isAuthorized(),
    });
  };

  const editAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditDialogTitle(
      _('Edit Agent - {{name}}', {
        name: agent.name || agent.agentId || '',
      }),
    );
    setEditDialogVisible(true);
  };

  const closeEditDialog = () => {
    setEditDialogVisible(false);
    setSelectedAgent(undefined);
  };

  const handleCloseEditDialog = () => {
    closeEditDialog();
  };

  const handleSaveEdit = async (data: AgentDialogState) => {
    await modifyAgentsMutation.mutateAsync({
      agentsIds: [data.id as string],
      authorized: selectedAgent?.isAuthorized(),
      attempts: selectedAgent?.config?.agentControl?.retry?.attempts,
      delayInSeconds: selectedAgent?.config?.agentControl?.retry.delayInSeconds,
      maxJitterInSeconds:
        selectedAgent?.config?.agentControl?.retry?.maxJitterInSeconds,
      bulkSize: selectedAgent?.config?.agentScriptExecutor?.bulkSize,
      bulkThrottleTime:
        selectedAgent?.config?.agentScriptExecutor?.bulkThrottleTimeInMs,
      indexerDirDepth:
        selectedAgent?.config?.agentScriptExecutor?.indexerDirDepth,
      schedulerCronTimes: data?.schedulerCronExpression,
      intervalInSeconds: data?.intervalInSeconds,
      missUntilInactive: selectedAgent?.config?.heartbeat?.missUntilInactive,
      comment: data.comment,
    });
    closeEditDialog();
    setSelectedAgent(undefined);
  };

  return (
    <>
      {children({
        delete: handleDelete,
        edit: editAgent,
        authorize: handleAuthorize,
      })}
      {editDialogVisible && selectedAgent && (
        <AgentDialog
          comment={selectedAgent.comment}
          configurationUpdated={selectedAgent.modificationTime}
          heartbeatReceived={selectedAgent.lastUpdaterHeartbeat}
          id={selectedAgent.id}
          intervalInSeconds={selectedAgent.config?.heartbeat?.intervalInSeconds}
          ipAddress={selectedAgent.hostname}
          lastContact={selectedAgent.lastUpdate}
          name={selectedAgent.name || selectedAgent.agentId}
          schedulerCronTime={
            selectedAgent.config?.agentScriptExecutor?.schedulerCronTimes?.[0]
          }
          status={selectedAgent.connectionStatus}
          title={editDialogTitle}
          onClose={handleCloseEditDialog}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default AgentComponent;
