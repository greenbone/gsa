/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import Filter from 'gmp/models/filter';
import Scanner, {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  ScannerElement,
} from 'gmp/models/scanner';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import {useGetAgents} from 'web/hooks/useQuery/agents';
import useTranslation from 'web/hooks/useTranslation';
import {useGetQuery} from 'web/queries/useGetQuery';

interface AgentGroupsDialogProps {
  title?: string;
  onClose: () => void;
  onSave: (values: {
    name: string;
    comment: string;
    agentController: string;
    selectedAgents: string[];
    network: string;
    configurationMethod: string;
    manualConfiguration: string;
    filePath: string;
  }) => void;
}

const AgentGroupsDialog = ({
  title,
  onClose,
  onSave,
}: AgentGroupsDialogProps) => {
  const [_] = useTranslation();

  const [selectedAgentController, setSelectedAgentController] = useState('');

  title = title || _('New Agent Group');

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
      value: scanner.id || '',
      label: scanner.name || _('Unknown Scanner'),
    })) || [];

  const allAgentsFilter = Filter.fromString('first=1 rows=-1');
  const {data: agentsData} = useGetAgents({
    filter: selectedAgentController ? allAgentsFilter : undefined,
    enabled: Boolean(selectedAgentController),
  });

  const handleAgentControllerChange = (value, onValueChange) => {
    setSelectedAgentController(value);
    onValueChange(value, 'agentController');
    onValueChange([], 'selectedAgents');
  };

  const handleConfigurationMethodChange = (value, onValueChange) => {
    onValueChange(value, 'configurationMethod');
  };

  return (
    <SaveDialog
      defaultValues={{
        name: '',
        comment: '',
        agentController: '',
        selectedAgents: [] as string[],
        network: '',
        configurationMethod: 'manual',
        manualConfiguration: '',
        filePath: '',
      }}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        const availableAgents = agentsData
          ? (
              agentsData as {
                entities?: Array<{
                  id: string;
                  name?: string;
                  hostname?: string;
                  agentId?: string;
                }>;
              }
            )?.entities?.map(agent => ({
              value: agent.id || '',
              label: `${agent.name || agent.agentId || _('Unknown Agent')} ${
                agent.hostname ? `(${agent.hostname})` : ''
              }`.trim(),
            })) || []
          : [];

        return (
          <>
            <TextField
              name="name"
              title={_('Group Name')}
              value={state.name}
              onChange={onValueChange}
            />

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            {/* TODO: Implement agent controller selection */}
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
                value={state.selectedAgents || []}
                onChange={onValueChange}
              />
            )}

            <FormGroup title={_('Configuration Method')}>
              <Row>
                <Radio
                  checked={state.configurationMethod === 'manual'}
                  name="configurationMethod"
                  title={_('Manual Configuration')}
                  value="manual"
                  onChange={value =>
                    handleConfigurationMethodChange(value, onValueChange)
                  }
                />
                <Radio
                  checked={state.configurationMethod === 'file'}
                  name="configurationMethod"
                  title={_('From File')}
                  value="file"
                  onChange={value =>
                    handleConfigurationMethodChange(value, onValueChange)
                  }
                />
              </Row>
            </FormGroup>

            {state.configurationMethod === 'manual' && (
              <TextArea
                autosize={true}
                minRows="4"
                name="manualConfiguration"
                placeholder={_('Enter configuration details...')}
                title={_('Manual Configuration')}
                value={state.manualConfiguration}
                onChange={onValueChange}
              />
            )}

            {state.configurationMethod === 'file' && (
              <TextField
                name="filePath"
                placeholder={_('/path/to/configuration/file.conf')}
                title={_('Configuration File Path')}
                value={state.filePath}
                onChange={onValueChange}
              />
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default AgentGroupsDialog;
