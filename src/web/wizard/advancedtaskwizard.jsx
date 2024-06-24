/* Copyright (C) 2016-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {useState} from 'react';

import {
  esxi_credential_filter,
  smb_credential_filter,
  ssh_credential_filter,
} from 'gmp/models/credential';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import Radio from 'web/components/form/radio';
import DatePicker from 'web/components/form/DatePicker';
import TimeZoneSelect from 'web/components/form/timezoneselect';

import Layout from 'web/components/layout/layout';
import Column from 'web/components/layout/column';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/utils/useCapabilities';

import {WizardContent, WizardIcon} from './taskwizard';
import date from 'gmp/models/date';
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
  const [datePickerValue, setDatePickerValue] = useState(start_date);
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

  const handleDateChange = (selectedDate, onValueChange) => {
    const properties = [
      {name: 'start_date', value: selectedDate},
      {name: 'start_hour', value: selectedDate.hours()},
      {name: 'start_minute', value: selectedDate.minutes()},
    ];

    properties.forEach(({name, value}) => {
      onValueChange(value, name);
    });

    setDatePickerValue(selectedDate);
  };

  return (
    <SaveDialog
      buttonTitle={_('Create')}
      title={_('Advanced Task Wizard')}
      width="900px"
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
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
                  name="task_name"
                  grow="1"
                  onChange={onValueChange}
                  value={state.task_name}
                  maxLength="80"
                />
              </FormGroup>

              <FormGroup title={_('Scan Config')}>
                <Select
                  name="config_id"
                  value={state.config_id}
                  items={configItems}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Target Host(s)')}>
                <TextField
                  name="target_hosts"
                  grow="1"
                  onChange={onValueChange}
                  value={state.target_hosts}
                  maxLength="2000"
                />
              </FormGroup>

              <FormGroup title={_('Start Time')}>
                <Radio
                  title={_('Start immediately')}
                  value={IMMEDIATELY_START_VALUE}
                  checked={state.auto_start === IMMEDIATELY_START_VALUE}
                  name="auto_start"
                  onChange={onValueChange}
                />

                {capabilities.mayCreate('schedule') &&
                  capabilities.mayAccess('schedules') && (
                    <>
                      <Column>
                        <Radio
                          title={_('Create Schedule:')}
                          value={SCHEDULE_START_VALUE}
                          checked={state.auto_start === SCHEDULE_START_VALUE}
                          name="auto_start"
                          onChange={onValueChange}
                        />
                        <DatePicker
                          name={'start_date'}
                          value={datePickerValue}
                          onChange={selectedDate =>
                            handleDateChange(selectedDate, onValueChange)
                          }
                          label={_('Start Date')}
                        />
                      </Column>
                      <TimeZoneSelect
                        name="start_timezone"
                        value={state.start_timezone}
                        onChange={onValueChange}
                      />
                    </>
                  )}

                <Radio
                  title={_('Do not start automatically')}
                  value={DONT_START_VALUE}
                  checked={state.auto_start === DONT_START_VALUE}
                  name="auto_start"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('SSH Credential')} direction="row">
                <Select
                  value={state.ssh_credential}
                  name="ssh_credential"
                  items={sshCredentialItems}
                  onChange={onValueChange}
                />
                <span>{_(' on port ')}</span>
                <Spinner
                  min="0"
                  max="65535"
                  type="int"
                  value={state.ssh_port}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('SMB Credential')}>
                <Select
                  value={state.smb_credential}
                  name="smb_credential"
                  items={smbCredentialItems}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('ESXi Credential')}>
                <Select
                  value={state.esxi_credential}
                  name="esxi_credential"
                  items={esxiCredentialItems}
                  onChange={onValueChange}
                />
              </FormGroup>

              {capabilities.mayCreate('alert') &&
                capabilities.mayAccess('alerts') && (
                  <FormGroup title={_('Email report to')}>
                    <TextField
                      name="alert_email"
                      grow="1"
                      value={state.alert_email}
                      maxLength="80"
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
