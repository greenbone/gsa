/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type AgentGroup from 'gmp/models/agent-group';
import Filter from 'gmp/models/filter';
import {
  type default as Scanner,
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {filter, map} from 'gmp/utils/array';
import SaveDialog from 'web/components/dialog/SaveDialog';
import MultiSelect from 'web/components/form/MultiSelect';
import SchedulerCronField from 'web/components/form/SchedulerCronField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {useGetAgents} from 'web/hooks/use-query/agents';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {DEFAULT_CRON_EXPRESSION} from 'web/pages/agents/components/AgentConfigurationSection';
import useGetEntities from 'web/queries/useGetEntities';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

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
  comment: string;
  name: string;
  schedulerCronExpression?: string;
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
  const gmp = useGmp();

  title = title ?? _('New Agent Group');

  const [selectedAgentController, setSelectedAgentController] = useState(
    agentGroup?.scanner?.id ?? '',
  );

  const {data: scannersData, isLoading: isLoadingScanners} =
    useGetEntities<Scanner>({
      queryId: 'get_scanners',
      filter: AGENT_CONTROLLERS_FILTER,
      gmpMethod: gmp.scanners.get.bind(gmp.scanners),
      keepPreviousData: true,
    });

  const agentControllers = renderSelectItems(
    scannersData?.entities as RenderSelectItemProps[],
  );

  const allAgentsFilter = Filter.fromString('first=1 rows=-1');
  const {data: agentsData, isLoading: isLoadingAgents} = useGetAgents({
    filter: allAgentsFilter,
    scannerId: selectedAgentController,
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

  const schedulerCron =
    agentGroup?.schedulerCronTime ?? DEFAULT_CRON_EXPRESSION;
  const defaultsKey = [
    agentGroup?.id ?? 'new',
    selectedAgents[0] || 'no-first',
    schedulerCron,
  ].join('|');

  return (
    <SaveDialog<AgentGroupsDialogValues, AgentGroupsDialogDefaultValues>
      key={defaultsKey}
      defaultValues={{
        name: agentGroup?.name ?? 'Unnamed',
        comment: agentGroup?.comment ?? '',
        agentIds: selectedAgents,
        schedulerCronExpression: schedulerCron,
      }}
      title={title}
      values={{
        agentController: selectedAgentController,
      }}
      onClose={onClose}
      onSave={values => {
        const payload: AgentGroupDialogData = {
          ...values,
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
              isLoading={isLoadingScanners}
              items={agentControllers}
              label={_('Agent Controller')}
              name="agentController"
              value={state.agentController}
              onChange={value => {
                setSelectedAgentController(value);
                onValueChange([], 'agentIds');
                onValueChange(
                  DEFAULT_CRON_EXPRESSION,
                  'schedulerCronExpression',
                );
              }}
            />
            {state.agentController && (
              <MultiSelect
                isLoading={isLoadingAgents}
                items={availableAgents}
                label={_('Select Agents')}
                name="agentIds"
                value={state.agentIds}
                onChange={onValueChange}
              />
            )}

            {state.agentController && agentsData && (
              <SchedulerCronField
                activeCronExpression={schedulerCron}
                infoTip={
                  agentGroup
                    ? _(
                        'This will set when the Agents scan the systems.\nA report is not automatically generated and needs to be set up as a "New Agent Task".',
                      )
                    : undefined
                }
                infoTipAriaLabel={_('More information about scheduler')}
                name="schedulerCronExpression"
                title={_('Scheduler Options')}
                value={state.schedulerCronExpression ?? ''}
                onChange={value =>
                  onValueChange(value, 'schedulerCronExpression')
                }
              />
            )}

            {state.agentController && !agentsData && (
              <div>{_('Loading configuration...')}</div>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default AgentGroupsDialog;
