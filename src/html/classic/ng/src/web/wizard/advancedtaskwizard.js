/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import moment from 'moment-timezone';

import _ from '../../locale.js';
import {is_defined, select_save_id, extend} from '../../utils.js';

import Img from '../img.js';
import Dialog from '../dialog.js';
import Layout from '../layout.js';
import {render_options} from '../render.js';

import Select2 from '../form/select2.js';
import Spinner from '../form/spinner.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import Radio from '../form/radio.js';
import Datepicker from '../form/datepicker.js';
import Text from '../form/text.js';
import TimeZoneSelect from '../form/timezoneselect.js';

import {ssh_credential_filter, smb_credential_filter, esxi_credential_filter
} from '../../gmp/models/credential.js';

import {OPENVAS_CONFIG_FULL_AND_FAST_ID} from '../../gmp/commands/scanners.js';

export class AdvancedTaskWizard extends Dialog {

  defaultState() {
    return extend(super.defaultState(), {
      width: 800,
      title: _('Advanced Task Wizard'),
      footer: _('Create'),
      scan_configs: [],
      credentials: [],
      auto_start: '2',
      ssh_port: 22,
    });
  }

  save() {
    let {gmp} = this.context;
    return gmp.wizard.runQuickTask(this.state).then(() => this.close(),
      xhr => {
        this.showErrorMessageFromResponse(xhr);
        throw new Error('Running advanced task wizard failed.');
      });
  }

  show() {
    let {gmp} = this.context;
    gmp.wizard.quickTask().then(settings => {
      let config_id = settings.settings
        .get('Default OpenVAS Scan Config').value;

      if (!is_defined(config_id) || config_id.length === 0) {
        config_id = OPENVAS_CONFIG_FULL_AND_FAST_ID;
      }

      let credentials = settings.credentials;

      let ssh_credential = select_save_id(credentials,
        settings.settings.get('Default SSH Credential').value, '');
      let smb_credential = select_save_id(credentials,
        settings.settings.get('Default SMB Credential').value, '');
      let esxi_credential = select_save_id(credentials,
        settings.settings.get('Default ESXi Credential').value, '');

      let now = moment().tz(settings.timezone);

      this.setState({
        visible: true,
        credentials,
        scan_configs: settings.scan_configs,
        date: now,
        task_name: _('New Quick Task'),
        target_hosts: settings.client_address,
        port_list_id: settings.settings.get('Default Port List').value,
        alert_id: settings.settings.get('Default Alert').value,
        config_id,
        ssh_credential,
        smb_credential,
        esxi_credential,
        scanner_id: settings.settings.get('Default OpenVAS Scanner').value,
        slave_id: settings.settings.get('Default Slave').value,
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: settings.timezone,
      });
    });
  }

  renderContent() {
    let {scan_configs, credentials = [], date, task_name, config_id, auto_start,
      target_hosts, start_hour, start_minute, start_timezone, ssh_credential,
      ssh_port, smb_credential, esxi_credential, alert_email,
    } = this.state;

    let {capabilities} = this.context;
    let config_opts = render_options(scan_configs);
    let ssh_credential_opts = render_options(
      credentials.filter(ssh_credential_filter), '');
    let smb_credential_opts = render_options(
      credentials.filter(smb_credential_filter), '');
    let esxi_credential_opts = render_options(
      credentials.filter(esxi_credential_filter), '');
    return (
      <Layout flex align={['start', 'start']}>
        <Layout basis="40%">
          <div className="wizardess pull-right">
            <Img src="enchantress.svg"/>
          </div>
          <div className="wizard-content">
            <p>
              {_('I can help you by creating a new scan task and ' +
                'automatically starting it.')}
            </p>
            <p>
              {_('All you need to do is enter a name for the new task and ' +
                'the IP address or host name of the target, and select a ' +
                'scan configuration.')}
            </p>
            <p>
              {_('You can choose if you want me to run the scan immediately, ' +
                'schedule the task for a later date and time, or just create ' +
                'the task so you can run it manually later.')}
            </p>
            <p>
              {_('In order to run an authenticated scan, you have to select ' +
                'SSH and/or SMB credentials, but you can also run an ' +
                'unauthenticated scan by not selecting any credentials.')}
              {capabilities.mayOp('get_alerts') &&
                capabilities.mayOp('create_alert') &&
                <br/>
              }
              {capabilities.mayOp('get_alerts') &&
                capabilities.mayOp('create_alert') &&
                _('If you enter an email address in the "Email report to" ' +
                  'field, a report of the scan will be sent to this ' +
                  'address once it is finished.')
              }
              {capabilities.mayOp('get_slaves') &&
                <br/>
              }
              {capabilities.mayOp('get_slaves') &&
                _('Finally, you can select a slave which will run the scan.')
              }
            </p>
            <p>
              {_('For any other setting I will apply the defaults from ' +
                '"My Settings".')}
            </p>
          </div>
        </Layout>
        <Layout grow="1" basis="0" flex="column">
          <FormGroup>
            <h3>{_('Quick start: Create a new task')}</h3>
          </FormGroup>

          <FormGroup title={_('Task Name')} titleSize="3">
            <TextField name="task_name"
              grow="1"
              onChange={this.onValueChange}
              value={task_name} size="30" maxLength="80"/>
          </FormGroup>

          <FormGroup title={_('Scan Config')} titleSize="3">
            <Select2
              name="config_id"
              value={config_id}
              onChange={this.onValueChange}>
              {config_opts}
            </Select2>
          </FormGroup>

          <FormGroup title={_('Target Host(s)')} titleSize="3">
            <TextField name="target_hosts"
              grow="1"
              onChange={this.onValueChange}
              value={target_hosts} maxLength="2000"/>
          </FormGroup>

          <FormGroup title={_('Start Time')} titleSize="3" flex="column">
            <Radio
              title={_('Start immediately')}
              value="2"
              checked={auto_start === '2'}
              name="auto_start"
              onChange={this.onValueChange}>
            </Radio>

            <Radio
              title={_('Create Schedule')}
              value="1"
              checked={auto_start === '1'}
              name="auto_start"
              onChange={this.onValueChange}>
            </Radio>
            <FormGroup offset="1" box>
              <Datepicker
                name="date"
                value={date}
                onChange={this.onValueChange}/>
            </FormGroup>
            <FormGroup offset="1">
              <Text>{_('at')}</Text>
              <Spinner type="int" min="0" max="23" size="2"
                name="start_hour"
                value={start_hour}
                onChange={this.onValueChange}/>
              <Text>{_('h')}</Text>
              <Spinner type="int" min="0" max="59" size="2"
                name="start_minute"
                value={start_minute}
                onChange={this.onValueChange}/>
              <Text>{_('m')}</Text>
            </FormGroup>
            <FormGroup offset="1">
              <TimeZoneSelect
                name="start_timezone"
                value={start_timezone}
                onChange={this.onValueChange}/>
            </FormGroup>

            <Radio
              title={_('Do not start automatically')}
              value="0"
              checked={auto_start === '0'}
              name="auto_start"
              onChange={this.onValueChange}>
            </Radio>
          </FormGroup>

          <FormGroup title={_('SSH Credential')} titleSize="3">
            <Select2 value={ssh_credential}
              name="ssh_credential"
              onChange={this.onValueChange}>
              {ssh_credential_opts}
            </Select2>
            <Text>
              {_(' on port ')}
            </Text>
            <Spinner min="0" max="65535" size="5"
              value={ssh_port}
              onChange={this.onValueChange}/>
          </FormGroup>

          <FormGroup title={_('SMB Credential')} titleSize="3">
            <Select2 value={smb_credential}
              name="smb_credential"
              onChange={this.onValueChange}>
              {smb_credential_opts}
            </Select2>
          </FormGroup>

          <FormGroup title={_('ESXi Credential')} titleSize="3">
            <Select2 value={esxi_credential}
              name="esxi_credential"
              onChange={this.onValueChange}>
              {esxi_credential_opts}
            </Select2>
          </FormGroup>

          {capabilities.mayOp('create_alert') &&
            capabilities.mayOp('get_alerts') &&
            <FormGroup title={_('Email report to')} titleSize="3">
              <TextField
                name="alert_email"
                grow="1"
                value={alert_email}
                size="30" maxLength="80"
                onChange={this.onValueChange}/>
            </FormGroup>
          }
        </Layout>
      </Layout>
    );
  }
}

AdvancedTaskWizard.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default AdvancedTaskWizard;

// vim: set ts=2 sw=2 tw=80:
