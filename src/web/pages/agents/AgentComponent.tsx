/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import ActionResult from 'gmp/models/actionresult';
import Agent from 'gmp/models/agents';
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
    onSuccess: () => {
      if (onDeleted) {
        onDeleted();
      }
    },
    onError: (error: unknown) => {
      if (onDeleteError) {
        onDeleteError(error as Rejection);
      }
    },
  });

  const handleDelete = (agent: Agent) => {
    if (!agent.id) {
      throw new Error('Agent ID is required for deletion');
    }
    return deleteMutation.mutateAsync({id: agent.id});
  };

  const modifyAgentsMutation = useModifyAgents();

  const handleAuthorize = async (agent: Agent) => {
    if (!agent.id) {
      throw new Error('Agent ID is required');
    }

    const newAuthorizedValue = agent.isAuthorized() ? NO_VALUE : YES_VALUE;

    const transformedConfig = agent.config
      ? {
          agent_control: {
            retry: {
              attempts: agent.config.agent_control?.retry?.attempts,
              delay_in_seconds:
                agent.config.agent_control?.retry?.delay_in_seconds,
              max_jitter_in_seconds:
                agent.config.agent_control?.retry?.max_jitter_in_seconds,
            },
          },
          agent_script_executor: {
            bulk_size: agent.config.agent_script_executor?.bulk_size,
            bulk_throttle_time_in_ms:
              agent.config.agent_script_executor?.bulk_throttle_time_in_ms,
            indexer_dir_depth:
              agent.config.agent_script_executor?.indexer_dir_depth,
            scheduler_cron_time: {
              item: (() => {
                const cronTimes =
                  agent.config.agent_script_executor?.scheduler_cron_times;
                if (cronTimes && cronTimes.length > 0) {
                  return cronTimes;
                }
                const singleCron =
                  agent.config.agent_script_executor?.scheduler_cron_time;
                return singleCron || undefined;
              })(),
            },
          },
          heartbeat: {
            interval_in_seconds: agent.config.heartbeat?.interval_in_seconds,
            miss_until_inactive: agent.config.heartbeat?.miss_until_inactive,
          },
        }
      : undefined;

    const saveData = {
      agents: [{id: agent.id}],
      authorized: newAuthorizedValue,
      config: transformedConfig,
    };

    try {
      const result = await modifyAgentsMutation.mutateAsync(saveData);
      if (onSaved) {
        onSaved(result as Response<ActionResult, XmlMeta>);
      }
      return result;
    } catch (error) {
      if (onSaveError) {
        onSaveError(error as Rejection);
      }
      let errorMessage = 'An unknown error occurred';
      if (error && typeof error === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err.data?.message && typeof err.data.message === 'string') {
          errorMessage = err.data.message;
        } else if (
          err.response?.data?.message &&
          typeof err.response.data.message === 'string'
        ) {
          errorMessage = err.response.data.message;
        }
      }
      throw new Error(errorMessage);
    }
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
    heartbeatIntervalInSeconds?: number;
    authorized?: number;
    comment?: string;
  }) => {
    if (!data.id) {
      console.error('Agent ID is required for saving');
      throw new Error('Agent ID is required');
    }

    const transformedConfig = selectedAgent?.config
      ? {
          agent_control: {
            retry: {
              attempts: selectedAgent.config.agent_control?.retry?.attempts,
              delay_in_seconds:
                selectedAgent.config.agent_control?.retry?.delay_in_seconds,
              max_jitter_in_seconds:
                selectedAgent.config.agent_control?.retry
                  ?.max_jitter_in_seconds,
            },
          },
          agent_script_executor: {
            bulk_size: selectedAgent.config.agent_script_executor?.bulk_size,
            bulk_throttle_time_in_ms:
              selectedAgent.config.agent_script_executor
                ?.bulk_throttle_time_in_ms,
            indexer_dir_depth:
              selectedAgent.config.agent_script_executor?.indexer_dir_depth,
            scheduler_cron_time: {
              item: (() => {
                const newCronTime =
                  data.schedulerCronExpression || data.schedulerCronTime;

                if (newCronTime) {
                  const existingCronTimes =
                    selectedAgent.config.agent_script_executor
                      ?.scheduler_cron_times;
                  if (existingCronTimes && existingCronTimes.length > 1) {
                    return [newCronTime, ...existingCronTimes.slice(1)];
                  }
                  return [newCronTime];
                }
                const cronTimes =
                  selectedAgent.config.agent_script_executor
                    ?.scheduler_cron_times;
                if (cronTimes && cronTimes.length > 0) {
                  return cronTimes;
                }
                const singleCron =
                  selectedAgent.config.agent_script_executor
                    ?.scheduler_cron_time;
                return singleCron ? [singleCron] : ['0 */12 * * *'];
              })(),
            },
          },
          heartbeat: {
            interval_in_seconds:
              data.heartbeatIntervalInSeconds ||
              selectedAgent.config.heartbeat?.interval_in_seconds,
            miss_until_inactive:
              selectedAgent.config.heartbeat?.miss_until_inactive,
          },
        }
      : undefined;

    const saveData = {
      agents: [{id: data.id}],
      authorized: selectedAgent?.isAuthorized() ? YES_VALUE : NO_VALUE,
      config: transformedConfig,
      comment: data.comment,
    };

    try {
      const result = await modifyAgentsMutation.mutateAsync(saveData);
      if (onSaved) {
        onSaved(result as Response<ActionResult, XmlMeta>);
      }
      closeEditDialog();
      return result;
    } catch (error) {
      if (onSaveError) {
        onSaveError(error as Rejection);
      }
      let errorMessage = 'An unknown error occurred';
      if (error && typeof error === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err.data?.message && typeof err.data.message === 'string') {
          errorMessage = err.data.message;
        } else if (
          err.response?.data?.message &&
          typeof err.response.data.message === 'string'
        ) {
          errorMessage = err.response.data.message;
        }
      }
      throw new Error(errorMessage);
    }
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
          heartbeatIntervalInSeconds={
            selectedAgent.config?.heartbeat?.interval_in_seconds
          }
          heartbeatReceived={selectedAgent.lastUpdaterHeartbeat?.toString()}
          id={selectedAgent.id}
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
