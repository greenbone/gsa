/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import AgentGroup from 'gmp/models/agent-groups';
import Agent, {AgentConfig} from 'gmp/models/agents';
import Filter from 'gmp/models/filter';
import Scanner, {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  ScannerElement,
} from 'gmp/models/scanner';
import SaveDialog from 'web/components/dialog/SaveDialog';
import MultiSelect from 'web/components/form/MultiSelect';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {useGetAgents} from 'web/hooks/useQuery/agents';
import useTranslation from 'web/hooks/useTranslation';
import AgentConfigurationSection from 'web/pages/agents/components/AgentConfigurationSection';
import {useGetQuery} from 'web/queries/useGetQuery';

interface AgentGroupsDialogProps {
  agentGroup?: AgentGroup;
  title?: string;
  onClose: () => void;
  onSave: (values: {
    name: string;
    comment: string;
    agentController: string;
    selectedAgents: string[];
    network: string;
    port: number;
    schedulerCronExpression: string | undefined;
    useAdvancedCron: boolean;
    heartbeatIntervalInSeconds: number | undefined;
    config?: AgentConfig;
    authorized?: 0 | 1;
  }) => void;
}

const AgentGroupsDialog = ({
  agentGroup,
  title,
  onClose,
  onSave,
}: AgentGroupsDialogProps) => {
  const [_] = useTranslation();

  const [selectedAgentController, setSelectedAgentController] = useState(
    agentGroup?.scanner?.id ?? '',
  );

  useEffect(() => {
    if (agentGroup?.scanner?.id) {
      setSelectedAgentController(agentGroup.scanner.id);
    }
  }, [agentGroup?.scanner?.id]);

  title = title ?? _('New Agent Group');

  const agentControllersFilter = Filter.fromString(
    `type=${AGENT_CONTROLLER_SCANNER_TYPE} or type=${AGENT_CONTROLLER_SENSOR_SCANNER_TYPE}`,
  );

  const {data: scannersData} = useGetQuery<Scanner>({
    cmd: 'get_scanners',
    name: 'get_scanners',
    filter: agentControllersFilter,
    parseEntity: el => Scanner.fromElement(el as ScannerElement | undefined),
  });

  const agentControllers =
    (scannersData as {entities?: Scanner[]})?.entities?.map(scanner => ({
      value: scanner.id ?? '',
      label: scanner.name ?? _('Unknown Scanner'),
    })) ?? [];

  const allAgentsFilter = Filter.fromString('first=1 rows=-1');
  const {data: agentsData} = useGetAgents({
    filter: selectedAgentController ? allAgentsFilter : undefined,
    enabled: Boolean(selectedAgentController),
    authorized: true,
  });

  const extractSchedulerCron = () => {
    const cronTime =
      agentsData?.entities?.[0].config?.agent_script_executor
        ?.scheduler_cron_time;
    return typeof cronTime === 'string' ? cronTime : '0 */12 * * *';
  };

  const extractHeartbeatInterval = () => {
    const interval =
      agentsData?.entities?.[0]?.config?.heartbeat?.interval_in_seconds;
    return typeof interval === 'number' ? interval : 300;
  };

  const schedulerCron = agentsData ? extractSchedulerCron() : '0 */12 * * *';
  const heartbeatInterval = agentsData ? extractHeartbeatInterval() : 300;

  const handleAgentControllerChange = (value, onValueChange) => {
    setSelectedAgentController(value);
    onValueChange(value, 'agentController');
    onValueChange([], 'selectedAgents');
  };

  return (
    <SaveDialog
      defaultValues={{
        name: agentGroup?.name ?? '',
        comment: agentGroup?.comment ?? '',
        agentController: agentGroup?.scanner?.id ?? '',
        selectedAgents:
          (agentGroup?.agents
            ?.map(agent => agent.id)
            .filter(id => id !== undefined) as string[]) ?? ([] as string[]),
        network: '',
        port: 0,
        schedulerCronExpression: schedulerCron,
        useAdvancedCron: false,
        heartbeatIntervalInSeconds: heartbeatInterval,
      }}
      title={title}
      onClose={onClose}
      onSave={data =>
        onSave({
          ...data,
          config: agentsData?.entities?.[0]?.config,
          authorized: agentsData?.entities?.[0]?.authorized === 1 ? 1 : 0,
        })
      }
    >
      {({values: state, onValueChange}) => {
        const availableAgents = agentsData
          ? ((agentsData as {entities?: Agent[]})?.entities
              ?.filter(agent => agent.authorized === 1)
              ?.map(agent => ({
                value: agent.id ?? '',
                label: `${agent.name ?? agent.agentId ?? _('Unknown Agent')} ${
                  agent.hostname ? `(${agent.hostname})` : ''
                }`.trim(),
              })) ?? [])
          : [];

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
              onChange={value =>
                handleAgentControllerChange(value, onValueChange)
              }
            />

            {state.agentController && (
              <MultiSelect
                items={availableAgents}
                label={_('Select Agents')}
                name="selectedAgents"
                value={state.selectedAgents}
                onChange={onValueChange}
              />
            )}

            {state.agentController && agentsData ? (
              <AgentConfigurationSection
                hidePort
                activeCronExpression={schedulerCron}
                heartbeatIntervalInSeconds={state.heartbeatIntervalInSeconds}
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
