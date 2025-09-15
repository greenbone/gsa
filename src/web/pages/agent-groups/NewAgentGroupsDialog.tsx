/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

interface NewAgentGroupsDialogProps {
  title?: string;
  onClose: () => void;
  onSave: (values: {
    name: string;
    agentController: string;
    selectedAgents: string[];
    network: string;
    configurationMethod: string;
    manualConfiguration: string;
    filePath: string;
  }) => void;
}
interface AgentOption {
  value: string;
  label: string;
}

const NewAgentGroupsDialog = ({
  title,
  onClose,
  onSave,
}: NewAgentGroupsDialogProps) => {
  const [_] = useTranslation();

  const [selectedAgentController, setSelectedAgentController] = useState('');
  const [availableAgents, setAvailableAgents] = useState<AgentOption[]>([]);

  title = title || _('New Agent Group');

  /* TODO: Replace with API call */
  const agentControllers = [
    {value: 'controller_1', label: _('Agent Controller 1')},
    {value: 'controller_2', label: _('Agent Controller 2')},
    {value: 'controller_3', label: _('Agent Controller 3')},
  ];

  useEffect(() => {
    if (selectedAgentController) {
      /* TODO: Replace with API call */
      const mockAgents = [
        {value: 'agent_1', label: _('Agent 1 (192.168.1.10)')},
        {value: 'agent_2', label: _('Agent 2 (192.168.1.11)')},
        {value: 'agent_3', label: _('Agent 3 (192.168.1.12)')},
        {value: 'agent_4', label: _('Agent 4 (192.168.1.13)')},
      ];
      setAvailableAgents(mockAgents);
    } else {
      setAvailableAgents([]);
    }
  }, [selectedAgentController, _]);

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
        return (
          <>
            <TextField
              name="name"
              title={_('Group Name')}
              value={state.name}
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

            {selectedAgentController && (
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

export default NewAgentGroupsDialog;
