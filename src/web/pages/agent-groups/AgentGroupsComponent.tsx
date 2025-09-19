/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import ActionResult from 'gmp/models/actionresult';
import AgentGroup from 'gmp/models/agent-groups';
import {AgentConfig} from 'gmp/models/agents';
import useEntityClone from 'web/entity/hooks/useEntityClone';
import useTranslation from 'web/hooks/useTranslation';
import AgentGroupsDialog from 'web/pages/agent-groups/AgentGroupsDialog';
import {useCreateMutation} from 'web/queries/useCreateMutation';
import {useDeleteMutation} from 'web/queries/useDeleteMutation';
import {useSaveMutation} from 'web/queries/useSaveMutation';

interface AgentGroupsComponentProps {
  children: (actions: {
    clone: (entity: AgentGroup) => Promise<unknown>;
    delete: (entity: AgentGroup) => Promise<unknown>;
    create: () => void;
    edit: (entity: AgentGroup) => void;
  }) => React.ReactNode;
  onCloned?: () => void;
  onCloneError?: (error: Rejection) => void;
  onCreated?: () => void;
  onCreateError?: (error: Rejection) => void;
  onDeleted?: () => void;
  onDeleteError?: (error: Rejection) => void;
  onDownloaded?: () => void;
  onDownloadError?: (error: Rejection) => void;
  onSaved?: (response: Response<ActionResult, XmlMeta>) => void;
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

  const [AgentGroupsDialogVisible, setAgentGroupsDialogVisible] =
    useState(false);
  const [selectedAgentGroup, setSelectedAgentGroup] = useState<
    AgentGroup | undefined
  >(undefined);

  const handleClone = useEntityClone<AgentGroup>('agentgroup', {
    onCloned,
    onCloneError,
  });

  const deleteMutation = useDeleteMutation<{id: string}, void>({
    entityKey: 'agentgroup',
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

  const handleDelete = (agentGroup: AgentGroup) => {
    if (!agentGroup.id) {
      throw new Error('Agent Group ID is required for deletion');
    }
    return deleteMutation.mutateAsync({id: agentGroup.id});
  };

  const createMutation = useCreateMutation<
    object,
    Response<ActionResult, XmlMeta>
  >({
    entityKey: 'agentgroup',
    onSuccess: data => {
      if (onSaved) {
        onSaved(data);
      }
    },
    onError: error => {
      if (onSaveError) {
        onSaveError(error as Rejection);
      }
    },
  });

  const saveMutation = useSaveMutation({
    entityKey: 'agentgroup',
    onSuccess: (data: Response<ActionResult, XmlMeta>) => {
      if (onSaved) {
        onSaved(data);
      }
    },
    onError: (error: unknown) => {
      if (onSaveError) {
        onSaveError(error as Rejection);
      }
    },
  });

  const handleSave = (data: {
    name: string;
    comment: string;
    agentController: string;
    selectedAgents: string[];
    port: number;
    schedulerCronExpression: string | undefined;
    useAdvancedCron: boolean;
    heartbeatIntervalInSeconds: number | undefined;
    config?: AgentConfig;
    authorized?: 0 | 1;
  }) => {
    const backendData = {
      name: data.name,
      scannerId: data.agentController,
      agents: data.selectedAgents.map(id => ({id})),
      config: data.config,
      comment: data.comment,
      authorized: data.authorized,
    };

    if (selectedAgentGroup) {
      return saveMutation.mutateAsync({
        id: selectedAgentGroup.id,
        ...backendData,
      });
    } else {
      return createMutation.mutateAsync(backendData);
    }
  };

  const openAgentGroupsDialog = () => {
    setAgentGroupsDialogVisible(true);
  };

  const editAgentGroup = (agentGroup: AgentGroup) => {
    setSelectedAgentGroup(agentGroup);
    setAgentGroupsDialogVisible(true);
  };

  return (
    <>
      {children({
        clone: handleClone,
        delete: handleDelete,
        create: openAgentGroupsDialog,
        edit: editAgentGroup,
      })}
      {AgentGroupsDialogVisible && (
        <AgentGroupsDialog
          agentGroup={selectedAgentGroup}
          title={
            selectedAgentGroup
              ? _('Edit Agent Group {{name}}', {
                  name: selectedAgentGroup.name || '',
                })
              : _('New Agent Group')
          }
          onClose={() => {
            setAgentGroupsDialogVisible(false);
            setSelectedAgentGroup(undefined);
          }}
          onSave={async data => {
            await handleSave(data);
            setAgentGroupsDialogVisible(false);
            setSelectedAgentGroup(undefined);
          }}
        />
      )}
    </>
  );
};

export default AgentGroupsComponent;
