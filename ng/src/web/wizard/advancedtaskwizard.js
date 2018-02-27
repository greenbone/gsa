/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';

import PropTypes from '../utils/proptypes.js';
import {render_options} from '../utils/render.js';

import SaveDialog from '../components/dialog/savedialog.js';

import Divider from '../components/layout/divider.js';

import Select from '../components/form/select.js';
import Spinner from '../components/form/spinner.js';
import FormGroup from '../components/form/formgroup.js';
import TextField from '../components/form/textfield.js';
import Radio from '../components/form/radio.js';
import Datepicker from '../components/form/datepicker.js';
import Text from '../components/form/text.js';
import TimeZoneSelect from '../components/form/timezoneselect.js';

import Img from '../components/img/img.js';

import Layout from '../components/layout/layout.js';

import {
  esxi_credential_filter,
  smb_credential_filter,
  ssh_credential_filter,
} from 'gmp/models/credential.js';

import {Wizardess, WizardContent} from './taskwizard';

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
    date,
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
    visible,
    onClose,
    onSave,
  }, {capabilities}) => {

  const config_opts = render_options(scan_configs);
  const ssh_credential_opts = render_options(
    credentials.filter(ssh_credential_filter), '');
  const smb_credential_opts = render_options(
    credentials.filter(smb_credential_filter), '');
  const esxi_credential_opts = render_options(
    credentials.filter(esxi_credential_filter), '');

  const data = {
    alert_email,
    auto_start,
    config_id,
    credentials,
    date,
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

  return (
    <SaveDialog
      buttonTitle={_('Create')}
      visible={visible}
      title={_('Advanced Task Wizard')}
      width="900px"
      onClose={onClose}
      onSave={onSave}
      initialData={data}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        return (
          <Layout flex align={['start', 'start']}>
            <Layout basis="40%">
              <Wizardess>
                <Img src="enchantress.svg"/>
              </Wizardess>
              <WizardContent>
                <p>
                  {_('I can help you by creating a new scan task and ' +
                    'automatically starting it.')}
                </p>
                <p>
                  {_('All you need to do is enter a name for the new task and' +
                    ' the IP address or host name of the target, and select a' +
                    ' scan configuration.')}
                </p>
                <p>
                  {_('You can choose if you want me to run the scan ' +
                    'immediately, schedule the task for a later date and ' +
                    'time, or just create the task so you can run it manually' +
                    ' later.')}
                </p>
                <p>
                  {_('In order to run an authenticated scan, you have to ' +
                    'select SSH and/or SMB credentials, but you can also run ' +
                    'an unauthenticated scan by not selecting any credentials.'
                  )}
                  {capabilities.mayAccess('alerts') &&
                    capabilities.mayCreate('alert') &&
                    <br/>
                  }
                  {capabilities.mayAccess('alerts') &&
                    capabilities.mayCreate('alert') &&
                    _('If you enter an email address in the "Email report to"' +
                      ' field, a report of the scan will be sent to this ' +
                      'address once it is finished.')
                  }
                  {capabilities.mayAccess('slaves') &&
                    <br/>
                  }
                  {capabilities.mayAccess('slaves') &&
                    _('Finally, you can select a slave which will run the ' +
                      'scan.')
                  }
                </p>
                <p>
                  {_('For any other setting I will apply the defaults from ' +
                    '"My Settings".')}
                </p>
              </WizardContent>
            </Layout>
            <Layout
              grow="1"
              basis="0"
              flex="column">
              <FormGroup>
                <h3>{_('Quick start: Create a new task')}</h3>
              </FormGroup>

              <FormGroup title={_('Task Name')} titleSize="3">
                <TextField
                  name="task_name"
                  grow="1"
                  onChange={onValueChange}
                  value={state.task_name}
                  size="30"
                  maxLength="80"/>
              </FormGroup>

              <FormGroup title={_('Scan Config')} titleSize="3">
                <Select
                  name="config_id"
                  value={state.config_id}
                  onChange={onValueChange}>
                  {config_opts}
                </Select>
              </FormGroup>

              <FormGroup title={_('Target Host(s)')} titleSize="3">
                <TextField
                  name="target_hosts"
                  grow="1"
                  onChange={onValueChange}
                  value={state.target_hosts} maxLength="2000"/>
              </FormGroup>

              <FormGroup
                title={_('Start Time')}
                titleSize="3"
                flex="column">
                <FormGroup>
                  <Radio
                    title={_('Start immediately')}
                    value="2"
                    checked={state.auto_start === '2'}
                    name="auto_start"
                    onChange={onValueChange}>
                  </Radio>
                </FormGroup>
                <FormGroup>
                  <Radio
                    title={_('Create Schedule:')}
                    value="1"
                    checked={state.auto_start === '1'}
                    name="auto_start"
                    onChange={onValueChange}>
                  </Radio>
                </FormGroup>
                <FormGroup offset="2" box>
                  <Datepicker
                    name="date"
                    value={state.date}
                    onChange={onValueChange}/>
                </FormGroup>
                <FormGroup offset="2">
                  <Divider>
                    <Text>{_('at')}</Text>
                    <Spinner
                      type="int"
                      min="0"
                      max="23"
                      size="2"
                      name="start_hour"
                      value={state.start_hour}
                      onChange={onValueChange}/>
                    <Text>{_('h')}</Text>
                    <Spinner
                      type="int"
                      min="0"
                      max="59"
                      size="2"
                      name="start_minute"
                      value={state.start_minute}
                      onChange={onValueChange}/>
                    <Text>{_('m')}</Text>
                  </Divider>
                </FormGroup>
                <FormGroup offset="2">
                  <TimeZoneSelect
                    name="start_timezone"
                    value={state.start_timezone}
                    onChange={onValueChange}/>
                </FormGroup>

                <Radio
                  title={_('Do not start automatically')}
                  value="0"
                  checked={state.auto_start === '0'}
                  name="auto_start"
                  onChange={onValueChange}>
                </Radio>
              </FormGroup>

              <FormGroup title={_('SSH Credential')} titleSize="3">
                <Divider>
                  <Select
                    value={state.ssh_credential}
                    name="ssh_credential"
                    onChange={onValueChange}>
                    {ssh_credential_opts}
                  </Select>
                  <Text>
                    {_(' on port ')}
                  </Text>
                  <Spinner
                    min="0"
                    max="65535"
                    size="5"
                    value={state.ssh_port}
                    onChange={onValueChange}/>
                </Divider>
              </FormGroup>

              <FormGroup title={_('SMB Credential')} titleSize="3">
                <Select
                  value={state.smb_credential}
                  name="smb_credential"
                  onChange={onValueChange}>
                  {smb_credential_opts}
                </Select>
              </FormGroup>

              <FormGroup title={_('ESXi Credential')} titleSize="3">
                <Select
                  value={state.esxi_credential}
                  name="esxi_credential"
                  onChange={onValueChange}>
                  {esxi_credential_opts}
                </Select>
              </FormGroup>

              {capabilities.mayCreate('alert') &&
                capabilities.mayAccess('alerts') &&
                <FormGroup title={_('Email report to')} titleSize="3">
                  <TextField
                    name="alert_email"
                    grow="1"
                    value={state.alert_email}
                    size="30"
                    maxLength="80"
                    onChange={onValueChange}/>
                </FormGroup>
              }
            </Layout>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

AdvancedTaskWizard.propTypes = {
  alert_email: PropTypes.string,
  auto_start: PropTypes.oneOf([
    '0', '1', '2',
  ]),
  config_id: PropTypes.idOrZero,
  credentials: PropTypes.array,
  date: PropTypes.momentDate,
  esxi_credential: PropTypes.idOrZero,
  scan_configs: PropTypes.array,
  smb_credential: PropTypes.idOrZero,
  ssh_credential: PropTypes.idOrZero,
  ssh_port: PropTypes.number,
  start_hour: PropTypes.number,
  start_minute: PropTypes.number,
  start_timezone: PropTypes.string,
  target_hosts: PropTypes.string,
  task_name: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

AdvancedTaskWizard.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default AdvancedTaskWizard;

// vim: set ts=2 sw=2 tw=80:
