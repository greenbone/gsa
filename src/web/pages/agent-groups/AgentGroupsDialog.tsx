/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo, useState} from 'react';
import {AgentConfig} from 'gmp/models/agent';
import AgentGroup from 'gmp/models/agentgroup';
import Filter from 'gmp/models/filter';
import Scanner, {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {filter, map} from 'gmp/utils/array';
import SaveDialog from 'web/components/dialog/SaveDialog';
import MultiSelect from 'web/components/form/MultiSelect';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {useGetAgents} from 'web/hooks/useQuery/agents';
import useTranslation from 'web/hooks/useTranslation';
import AgentConfigurationSection, {
  DEFAULT_CRON_EXPRESSION,
  DEFAULT_HEARTBEAT_INTERVAL,
} from 'web/pages/agents/components/AgentConfigurationSection';
import {useGetEntities} from 'web/queries/useGetEntities';
import {RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface AgentGroupsDialogProps {
  agentGroup?: AgentGroup;
  title?: string;
  onClose?: () => void;
  onSave?: (values: AgentGroupDialogData) => void | Promise<void>;
}

interface AgentGroupsDialogValues {
  agentController: string;
}

interface AgentGroupsDialogDefaultValues {
  agentIds: string[];
  authorized?: boolean;
  comment: string;
  config?: AgentConfig;
  intervalInSeconds?: number;
  name: string;
  network: string;
  port: number;
  schedulerCronExpression?: string;
  useAdvancedCron: boolean;
}

export type AgentGroupDialogData = AgentGroupsDialogDefaultValues &
  AgentGroupsDialogValues;

const AGENT_CONTROLLERS_FILTER = Filter.fromString(
  `type=${AGENT_CONTROLLER_SCANNER_TYPE} or type=${AGENT_CONTROLLER_SENSOR_SCANNER_TYPE}`,
);

const AgentGroupsDialog = ({
  agentGroup,
  title,
  onClose,
  onSave,
}: AgentGroupsDialogProps) => {
  const [_] = useTranslation();

  title = title ?? _('New Agent Group');

  const [selectedAgentController, setSelectedAgentController] = useState(
    agentGroup?.scanner?.id ?? '',
  );

  const {data: scannersData} = useGetEntities<Scanner>({
    queryId: 'get_scanners',
    entityType: 'scanner',
    filter: AGENT_CONTROLLERS_FILTER,
  });

  const agentControllers = renderSelectItems(
    scannersData?.entities as RenderSelectItemProps[],
  );

  const allAgentsFilter = Filter.fromString('first=1 rows=-1');
  const {data: agentsData} = useGetAgents({
    filter: selectedAgentController ? allAgentsFilter : undefined,
    enabled: Boolean(selectedAgentController),
    authorized: true,
  });

  const availableAgents = filter(agentsData?.entities, agent =>
    Boolean(agent.authorized),
  ).map(agent => ({
    value: agent.id as string,
    label: `${agent.name ?? agent.agentId} ${
      agent.hostname ? `(${agent.hostname})` : ''
    }`.trim(),
  }));
  const selectedAgents = map(agentGroup?.agents, agent => agent.id as string);
  const first = agentsData?.entities?.find(
    agent => agent.id === selectedAgents[0],
  );
  const firstAgentFromGroup = useMemo(() => {
    const firstId = selectedAgents[0];
    return agentsData?.entities?.find(a => a.id === firstId);
  }, [agentsData, selectedAgents]);
  const schedulerCron =
    first?.config?.agentScriptExecutor?.schedulerCronTimes?.[0] ??
    DEFAULT_CRON_EXPRESSION;
  const heartbeatInterval =
    first?.config?.heartbeat?.intervalInSeconds ?? DEFAULT_HEARTBEAT_INTERVAL;

  const defaultsKey = [
    agentGroup?.id ?? 'new',
    selectedAgentController || 'no-ctrl',
    selectedAgents[0] || 'no-first',
    schedulerCron,
    heartbeatInterval,
  ].join('|');

  return (
    <SaveDialog<AgentGroupsDialogValues, AgentGroupsDialogDefaultValues>
      key={defaultsKey}
      defaultValues={{
        config: firstAgentFromGroup?.config,
        authorized: firstAgentFromGroup?.authorized,
        name: agentGroup?.name ?? '',
        comment: agentGroup?.comment ?? '',
        agentIds: selectedAgents,
        network: '',
        port: 0,
        schedulerCronExpression: schedulerCron,
        useAdvancedCron: false,
        intervalInSeconds: heartbeatInterval,
      }}
      title={title}
      values={{
        agentController: selectedAgentController,
      }}
      onClose={onClose}
      onSave={values => {
        const firstSelected = agentsData?.entities?.find(
          a => a.id === values.agentIds?.[0],
        );

        const payload: AgentGroupDialogData = {
          ...values,
          authorized: firstSelected?.authorized ?? values.authorized,
          config: firstSelected?.config ?? values.config,
        };

        return onSave?.(payload);
      }}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <TextField
              name="name"
              title={_('Group Name')}
              value={state.name}
              onChange={onValueChange}
            />

            <TextField
              description={_('Optional')}
              name="comment"
              title={_('Comment')}
              value={state.comment}
              onChange={onValueChange}
            />

            <Select
              items={agentControllers}
              label={_('Agent Controller')}
              name="agentController"
              value={state.agentController}
              onChange={value => {
                setSelectedAgentController(value);
                onValueChange([], 'selectedAgents');
              }}
            />

            {state.agentController && (
              <MultiSelect
                items={availableAgents}
                label={_('Select Agents')}
                name="agentIds"
                value={state.agentIds}
                onChange={onValueChange}
              />
            )}

            {state.agentController && agentsData ? (
              <AgentConfigurationSection
                hidePort
                activeCronExpression={schedulerCron}
                intervalInSeconds={state.intervalInSeconds}
                port={state.port}
                schedulerCronExpression={state.schedulerCronExpression}
                useAdvancedCron={state.useAdvancedCron}
                onValueChange={onValueChange}
              />
            ) : state.agentController ? (
              <div>{_('Loading configuration...')}</div>
            ) : undefined}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default AgentGroupsDialog;
