/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TimePicker} from '@greenbone/opensight-ui-components-mantinev7';
import {
  esxi_credential_filter,
  smb_credential_filter,
  ssh_credential_filter,
} from 'gmp/models/credential';
import {useState} from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextField from 'web/components/form/TextField';
import TimeZoneSelect from 'web/components/form/TimeZoneSelect';
import Column from 'web/components/layout/Column';
import Layout from 'web/components/layout/Layout';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';
import {formatSplitTime} from 'web/utils/timePickerHelpers';
import {WizardContent, WizardIcon} from 'web/wizard/TaskWizard';

const IMMEDIATELY_START_VALUE = '2';
const SCHEDULE_START_VALUE = '1';
const DONT_START_VALUE = '0';

const DEFAULTS = {
  scan_configs: [],
  credentials: [],
  auto_start: '2',
  ssh_port: 22,
};

const AdvancedTaskWizard = ({
  alert_email,
  auto_start,
  config_id,
  credentials = [],
  start_date,
  esxi_credential = '',
  scan_configs,
  smb_credential = '',
  ssh_credential = '',
  ssh_port,
  start_hour,
  start_minute,
  start_timezone,
  target_hosts,
  task_name,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const configItems = renderSelectItems(scan_configs);

  const [timePickerValue, setTimePickerValue] = useState(
    formatSplitTime(start_hour, start_minute),
  );
  const sshCredentialItems = renderSelectItems(
    credentials.filter(ssh_credential_filter),
    '',
  );
  const smbCredentialItems = renderSelectItems(
    credentials.filter(smb_credential_filter),
    '',
  );
  const esxiCredentialItems = renderSelectItems(
    credentials.filter(esxi_credential_filter),
    '',
  );

  const data = {
    alert_email,
    auto_start,
    config_id,
    credentials,
    start_date,
    esxi_credential,
    scan_configs,
    smb_credential,
    ssh_credential,
    ssh_port,
    start_hour,
    start_minute,
    start_timezone,
    target_hosts,
    task_name,
    ...DEFAULTS,
  };

  const handleTimeChange = (selectedValue, onValueChange) => {
    const [start_hour, start_minute] = selectedValue.split(':');
    setTimePickerValue(selectedValue);
    onValueChange(parseInt(start_hour), 'start_hour');
    onValueChange(parseInt(start_minute), 'start_minute');
  };

  return (
    <SaveDialog
      buttonTitle={_('Create')}
      defaultValues={data}
      title={_('Advanced Task Wizard')}
      width="900px"
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout align={['start', 'start']}>
            <WizardIcon />
            <Layout basis="35%">
              <WizardContent>
                <p>
                  <b>{_('Quick start: Create a new task')}</b>
                </p>
                <p>
                  {_(
                    'This wizard can help you by creating a new scan task and ' +
                      'automatically starting it.',
                  )}
                </p>
                <p>
                  {_(
                    'All you need to do is enter a name for the new task and' +
                      ' the IP address or host name of the target, and select a' +
                      ' scan configuration.',
                  )}
                </p>
                <p>
                  {_(
                    'You can choose, whether you want to run the scan immediately',
                  )}
                  {capabilities.mayAccess('schedules') &&
                    capabilities.mayCreate('schedule') &&
                    _(', schedule the task for a later date and time,')}
                  {_(
                    ' or just create the task so you can run it manually later.',
                  )}
                </p>
                <p>
                  {_(
                    'In order to run an authenticated scan, you have to ' +
                      'select SSH and/or SMB credentials, but you can also run ' +
                      'an unauthenticated scan by not selecting any credentials.',
                  )}
                  {capabilities.mayAccess('alerts') &&
                    capabilities.mayCreate('alert') && <br />}
                  {capabilities.mayAccess('alerts') &&
                    capabilities.mayCreate('alert') &&
                    _(
                      'If you enter an email address in the "Email report to"' +
                        ' field, a report of the scan will be sent to this ' +
                        'address once it is finished.',
                    )}
                  {capabilities.mayAccess('slaves') && <br />}
                  {capabilities.mayAccess('slaves') &&
                    _(
                      'Finally, you can select a sensor which will run the ' +
                        'scan.',
                    )}
                </p>
                <p>
                  {_(
                    'For any other setting the defaults from ' +
                      '"My Settings" will be applied.',
                  )}
                </p>
              </WizardContent>
            </Layout>
            <Column>
              <FormGroup title={_('Task Name')}>
                <TextField
                  grow="1"
                  maxLength="80"
                  name="task_name"
                  value={state.task_name}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Scan Config')}>
                <Select
                  items={configItems}
                  name="config_id"
                  value={state.config_id}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Target Host(s)')}>
                <TextField
                  grow="1"
                  maxLength="2000"
                  name="target_hosts"
                  value={state.target_hosts}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Start Time')}>
                <Radio
                  checked={state.auto_start === IMMEDIATELY_START_VALUE}
                  name="auto_start"
                  title={_('Start immediately')}
                  value={IMMEDIATELY_START_VALUE}
                  onChange={onValueChange}
                />

                {capabilities.mayCreate('schedule') &&
                  capabilities.mayAccess('schedules') && (
                    <>
                      <Column>
                        <Radio
                          checked={state.auto_start === SCHEDULE_START_VALUE}
                          name="auto_start"
                          title={_('Create Schedule:')}
                          value={SCHEDULE_START_VALUE}
                          onChange={onValueChange}
                        />
                        <DatePicker
                          label={_('Start Date')}
                          name={'start_date'}
                          value={state.start_date}
                          onChange={onValueChange}
                        />
                        <TimePicker
                          label={_('Start Time')}
                          name="startTime"
                          value={timePickerValue}
                          onChange={selectedTime =>
                            handleTimeChange(selectedTime, onValueChange)
                          }
                        />
                      </Column>
                      <TimeZoneSelect
                        label={_('Timezone')}
                        name="start_timezone"
                        value={state.start_timezone}
                        onChange={onValueChange}
                      />
                    </>
                  )}

                <Radio
                  checked={state.auto_start === DONT_START_VALUE}
                  name="auto_start"
                  title={_('Do not start automatically')}
                  value={DONT_START_VALUE}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup direction="row" title={_('SSH Credential')}>
                <Select
                  items={sshCredentialItems}
                  name="ssh_credential"
                  value={state.ssh_credential}
                  onChange={onValueChange}
                />
                <span>{_(' on port ')}</span>
                <Spinner
                  max="65535"
                  min="0"
                  name="ssh_port"
                  type="int"
                  value={state.ssh_port}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('SMB Credential')}>
                <Select
                  items={smbCredentialItems}
                  name="smb_credential"
                  value={state.smb_credential}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('ESXi Credential')}>
                <Select
                  items={esxiCredentialItems}
                  name="esxi_credential"
                  value={state.esxi_credential}
                  onChange={onValueChange}
                />
              </FormGroup>

              {capabilities.mayCreate('alert') &&
                capabilities.mayAccess('alerts') && (
                  <FormGroup title={_('Email report to')}>
                    <TextField
                      grow="1"
                      maxLength="80"
                      name="alert_email"
                      value={state.alert_email}
                      onChange={onValueChange}
                    />
                  </FormGroup>
                )}
            </Column>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

AdvancedTaskWizard.propTypes = {
  alert_email: PropTypes.string,
  auto_start: PropTypes.oneOf([
    IMMEDIATELY_START_VALUE,
    SCHEDULE_START_VALUE,
    DONT_START_VALUE,
  ]),
  config_id: PropTypes.idOrZero,
  credentials: PropTypes.arrayOf(PropTypes.model),
  esxi_credential: PropTypes.idOrZero,
  scan_configs: PropTypes.arrayOf(PropTypes.model),
  smb_credential: PropTypes.idOrZero,
  ssh_credential: PropTypes.idOrZero,
  ssh_port: PropTypes.number,
  start_date: PropTypes.date,
  start_hour: PropTypes.number,
  start_minute: PropTypes.number,
  start_timezone: PropTypes.string,
  target_hosts: PropTypes.string,
  task_name: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AdvancedTaskWizard;
