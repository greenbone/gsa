/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import React, {useReducer} from 'react';

import _ from 'gmp/locale';

import {
  esxi_credential_filter,
  smb_credential_filter,
  ssh_credential_filter,
} from 'gmp/models/credential';

import SaveDialog from 'web/components/dialog/savedialog';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import Radio from 'web/components/form/radio';
import Datepicker from 'web/components/form/datepicker';
import TimeZoneSelect from 'web/components/form/timezoneselect';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import reducer, {updateState} from 'web/utils/stateReducer';
import withCapabilities from 'web/utils/withCapabilities';

import {WizardContent, WizardIcon} from './taskwizard';

const IMMEDIATELY_START_VALUE = '2';
const SCHEDULE_START_VALUE = '1';
const DONT_START_VALUE = '0';

const DEFAULTS = {
  scanConfigs: [],
  credentials: [],
  autoStart: '2',
  sshPort: 22,
};

const AdvancedTaskWizard = ({
  alertEmail,
  autoStart,
  capabilities,
  configId,
  credentials = [],
  startDate,
  esxiCredential = '',
  scanConfigs,
  smbCredential = '',
  sshCredential = '',
  sshPort,
  startTimezone,
  targetHosts,
  taskName,
  onClose,
  onSave,
}) => {
  const [timeState, dispatch] = useReducer(reducer, {
    startDate,
    startTimezone,
  });

  const configItems = renderSelectItems(scanConfigs);
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

  const handleTimeChange = (value, name) => {
    if (name === 'startDate') {
      dispatch(
        updateState({
          startDate: value,
        }),
      );
    } else if (name === 'startHour') {
      dispatch(
        updateState({
          startDate: timeState.startDate.hours(value),
        }),
      );
    } else if (name === 'startMinute') {
      dispatch(
        updateState({
          startDate: timeState.startDate.minutes(value),
        }),
      );
    } else if (name === 'startTimezone') {
      dispatch(
        updateState({
          startDate: timeState.startDate.tz(value),
          startTimezone: value,
        }),
      );
    }
  };

  const data = {
    alertEmail,
    autoStart,
    configId,
    credentials,
    esxiCredential,
    scanConfigs,
    smbCredential,
    sshCredential,
    sshPort,
    targetHosts,
    taskName,
    ...timeState,
    ...DEFAULTS,
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
      {({values: state, onValueChange}) => (
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
          <Layout grow="1" basis="0" flex="column">
            <FormGroup title={_('Task Name')} titleSize="3">
              <TextField
                name="taskName"
                grow="1"
                onChange={onValueChange}
                value={state.taskName}
                size="30"
                maxLength="80"
              />
            </FormGroup>

            <FormGroup title={_('Scan Config')} titleSize="3">
              <Select
                name="configId"
                value={state.configId}
                items={configItems}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Target Host(s)')} titleSize="3">
              <TextField
                name="targetHosts"
                grow="1"
                onChange={onValueChange}
                value={state.targetHosts}
                maxLength="2000"
              />
            </FormGroup>

            <FormGroup title={_('Start Time')} titleSize="3" flex="column">
              <FormGroup>
                <Radio
                  title={_('Start immediately')}
                  value={IMMEDIATELY_START_VALUE}
                  checked={state.autoStart === IMMEDIATELY_START_VALUE}
                  name="autoStart"
                  onChange={onValueChange}
                />
              </FormGroup>

              {capabilities.mayCreate('schedule') &&
                capabilities.mayAccess('schedules') && (
                  <span>
                    <FormGroup>
                      <Radio
                        title={_('Create Schedule:')}
                        value={SCHEDULE_START_VALUE}
                        checked={state.autoStart === SCHEDULE_START_VALUE}
                        name="autoStart"
                        onChange={onValueChange}
                      />
                    </FormGroup>
                    <FormGroup offset="1">
                      <Datepicker
                        name="startDate"
                        value={timeState.startDate}
                        onChange={handleTimeChange}
                      />
                    </FormGroup>
                    <FormGroup offset="1">
                      <Divider>
                        <span>{_('at')}</span>
                        <Spinner
                          type="int"
                          min="0"
                          max="23"
                          size="2"
                          name="startHour"
                          value={timeState.startDate.hours()}
                          onChange={handleTimeChange}
                        />
                        <span>{_('h')}</span>
                        <Spinner
                          type="int"
                          min="0"
                          max="59"
                          size="2"
                          name="startMinute"
                          value={timeState.startDate.minutes()}
                          onChange={handleTimeChange}
                        />
                        <span>{_('m')}</span>
                      </Divider>
                    </FormGroup>
                    <FormGroup offset="1">
                      <TimeZoneSelect
                        name="startTimezone"
                        value={timeState.startTimezone}
                        onChange={handleTimeChange}
                      />
                    </FormGroup>
                  </span>
                )}

              <Radio
                title={_('Do not start automatically')}
                value={DONT_START_VALUE}
                checked={state.autoStart === DONT_START_VALUE}
                name="autoStart"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('SSH Credential')} titleSize="3">
              <Divider>
                <Select
                  value={state.sshCredential}
                  name="sshCredential"
                  items={sshCredentialItems}
                  onChange={onValueChange}
                />
                <span>{_(' on port ')}</span>
                <Spinner
                  min="0"
                  max="65535"
                  size="5"
                  value={state.sshPort}
                  onChange={onValueChange}
                />
              </Divider>
            </FormGroup>

            <FormGroup title={_('SMB Credential')} titleSize="3">
              <Select
                value={state.smbCredential}
                name="smbCredential"
                items={smbCredentialItems}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('ESXi Credential')} titleSize="3">
              <Select
                value={state.esxiCredential}
                name="esxiCredential"
                items={esxiCredentialItems}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayCreate('alert') &&
              capabilities.mayAccess('alerts') && (
                <FormGroup title={_('Email report to')} titleSize="3">
                  <TextField
                    name="alertEmail"
                    grow="1"
                    value={state.alertEmail}
                    size="30"
                    maxLength="80"
                    onChange={onValueChange}
                  />
                </FormGroup>
              )}
          </Layout>
        </Layout>
      )}
    </SaveDialog>
  );
};

AdvancedTaskWizard.propTypes = {
  alertEmail: PropTypes.string,
  autoStart: PropTypes.oneOf([
    IMMEDIATELY_START_VALUE,
    SCHEDULE_START_VALUE,
    DONT_START_VALUE,
  ]),
  capabilities: PropTypes.capabilities.isRequired,
  configId: PropTypes.idOrZero,
  credentials: PropTypes.arrayOf(PropTypes.model),
  esxiCredential: PropTypes.idOrZero,
  scanConfigs: PropTypes.arrayOf(PropTypes.model),
  smbCredential: PropTypes.idOrZero,
  sshCredential: PropTypes.idOrZero,
  sshPort: PropTypes.number,
  startDate: PropTypes.date,
  startTimezone: PropTypes.string,
  targetHosts: PropTypes.string,
  taskName: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default withCapabilities(AdvancedTaskWizard);

// vim: set ts=2 sw=2 tw=80:
