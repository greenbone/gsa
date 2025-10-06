/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import ActionResult from 'gmp/models/actionresult';
import Agent from 'gmp/models/agent';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {useModifyAgents} from 'web/hooks/useQuery/agents';
import useTranslation from 'web/hooks/useTranslation';
import AgentDialogEdit from 'web/pages/agents/AgentDialogEdit';
import {useDeleteMutation} from 'web/queries/useDeleteMutation';

interface AgentComponentProps {
  children: (actions: {
    clone: (entity: Agent) => Promise<unknown>;
    delete: (entity: Agent) => Promise<unknown>;
    create: () => void;
    edit: (entity: Agent) => void;
    authorize: (entity: Agent) => Promise<unknown>;
  }) => React.ReactNode;

  onCreated?: () => void;
  onCreateError?: (error: Rejection) => void;
  onDeleted?: () => void;
  onDeleteError?: (error: Rejection) => void;

  onSaved?: (response: Response<ActionResult, XmlMeta>) => void;
  onSaveError?: (error: Rejection) => void;
}

const AgentComponent = ({
  children,
  onCreated,
  onCreateError,
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

  const deleteMutation = useDeleteMutation<{id: string}, void>({
    entityKey: 'agent',
    onSuccess: onDeleted,
    //@ts-expect-error
    onError: onDeleteError,
  });

  const handleDelete = (agent: Agent) => {
    if (!agent.id) {
      throw new Error('Agent ID is required for deletion');
    }
    return deleteMutation.mutateAsync({id: agent.id as string});
  };

  const modifyAgentsMutation = useModifyAgents({
    onSuccess: res => {
      onSaved?.(res);
    },
    onError: onSaveError,
  });

  const handleAuthorize = async (agent: Agent) => {
    if (!agent.id) {
      throw new Error('Agent ID is required');
    }

    const newAuthorizedValue = agent.isAuthorized() ? NO_VALUE : YES_VALUE;

    const saveData = {
      agentsIds: [agent.id],
      authorized: newAuthorizedValue,
    };

    // @ts-ignore
    await modifyAgentsMutation.mutateAsync(saveData);
  };

  const openAgentDialog = () => {
    // TODO: Implement download agent installer
    console.info('Agent creation dialog not implemented yet');
  };

  const editAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditDialogTitle(
      _('Agent Heartbeat - {{name}}', {
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

  const handleSaveEdit = async (data: {
    id?: string;
    schedulerCronTime?: string;
    schedulerCronExpression?: string;
    intervalInSeconds?: number;
    authorized?: number;
    comment?: string;
  }) => {
    if (!data.id) {
      console.error('Agent ID is required for saving');
      throw new Error('Agent ID is required');
    }

    const saveData = {
      agentsIds: [data.id],
      authorized: selectedAgent?.isAuthorized() ? YES_VALUE : NO_VALUE,
      attempts: selectedAgent?.config?.agentControl?.retry?.attempts,
      delayInSeconds: selectedAgent?.config?.agentControl?.retry.delayInSeconds,
      maxJitterInSeconds:
        selectedAgent?.config?.agentControl?.retry?.maxJitterInSeconds,
      bulkSize: selectedAgent?.config?.agentScriptExecutor?.bulkSize,
      bulkThrottleTime:
        selectedAgent?.config?.agentScriptExecutor?.bulkThrottleTimeInMs,
      indexerDirDepth:
        selectedAgent?.config?.agentScriptExecutor?.indexerDirDepth,
      schedulerCronTimes: [data?.schedulerCronExpression],
      intervalInSeconds: data?.intervalInSeconds,
      missUntilInactive: selectedAgent?.config?.heartbeat?.missUntilInactive,
      comment: data.comment,
    };

    // @ts-ignore
    await modifyAgentsMutation.mutateAsync(saveData);
    closeEditDialog();
    setSelectedAgent(undefined);
  };

  return (
    <>
      {children({
        delete: handleDelete,
        create: openAgentDialog,
        edit: editAgent,
        authorize: handleAuthorize,
        clone: function (entity: Agent): Promise<unknown> {
          throw new Error('Function not implemented.');
        },
      })}
      {editDialogVisible && selectedAgent && (
        <AgentDialogEdit
          config={selectedAgent.config}
          configurationUpdated={selectedAgent.modificationTime?.toString()}
          heartbeatReceived={selectedAgent.lastUpdaterHeartbeat?.toString()}
          id={selectedAgent.id}
          intervalInSeconds={selectedAgent.config?.heartbeat?.intervalInSeconds}
          ipAddress={selectedAgent.hostname}
          lastContact={selectedAgent.lastUpdate?.toString()}
          name={selectedAgent.name || selectedAgent.agentId}
          status={selectedAgent.connectionStatus}
          systemScanCompleted="N/A"
          title={editDialogTitle}
          version={selectedAgent.agentVersion}
          onClose={handleCloseEditDialog}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default AgentComponent;
