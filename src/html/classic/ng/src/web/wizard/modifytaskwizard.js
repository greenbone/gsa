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

import {select_save_id, extend} from '../../utils.js';
import _ from '../../locale.js';

import Img from '../img.js';
import Layout from '../layout.js';

import Dialog from '../dialog/dialog.js';

import Select2 from '../form/select2.js';
import Spinner from '../form/spinner.js';
import FormGroup from '../form/formgroup.js';
import Radio from '../form/radio.js';
import Text from '../form/text.js';
import TextField from '../form/textfield.js';
import TimeZoneSelect from '../form/timezoneselect.js';
import Datepicker from '../form/datepicker.js';

import {render_options} from '../render.js';

export class ModifyTaskWizard extends Dialog {

  defaultState() {
    return extend(super.defaultState(), {
      width: 800,
      title: _('Modify Task Wizard'),
      footer: _('Modify'),
      tasks: [],
    });
  }

  show() {
    let {gmp} = this.context;
    gmp.wizard.modifyTask().then(settings => {
      let now = moment().tz(settings.timezone);

      this.setState({
        visible: true,
        date: now,
        tasks: settings.tasks,
        reschedule: '0',
        task_id: select_save_id(settings.tasks),
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: settings.timezone,
      });
    });
  }

  save() {
    let {gmp} = this.context;
    return gmp.wizard.runModifyTask(this.state).then(() => this.close(),
      rej => {
        this.showErrorMessageFromRejection(rej);
        throw rej;
      });
  }

  renderContent() {
    let {tasks, date, task_id, start_minute, start_hour, start_timezone,
      reschedule, alert_email,
    } = this.state;
    let task_opts = render_options(tasks);
    let {capabilities} = this.context;
    return (
      <Layout flex align={['start', 'start']}>
        <Layout basis="40%">
          <div className="wizardess pull-right">
            <Img src="enchantress.svg"/>
          </div>
          <div className="wizard-content">
            <div>
              {_('I will modify an existing task for you. The difference to ' +
                'the Edit Task dialog is that here you can enter values for ' +
                'associated objects directly. I will then create them for ' +
                'you automatically and assign them to the selected task.')}
            </div>
            <div>
              {_('Please be aware that')}
              <ul>
                <li>
                  {_('setting a start time overwrites a possibly already ' +
                    'existing one,')}
                </li>
                <li>
                  {_('setting an Email Address means adding an additional ' +
                    'Alert, not replacing an existing one.')}
                </li>
              </ul>
            </div>
          </div>
        </Layout>
        <Layout basis="0" grow="1" flex="column">
          <h1>{_('Quick edit: Modify a task')}</h1>
          <FormGroup title={_('Task')} titleSize="3">
            <Select2 name="task_id"
              value={task_id}
              onChange={this.onValueChange}>
              {task_opts}
            </Select2>
          </FormGroup>

          <FormGroup title={_('Start Time')} titleSize="3" flex="column">
            <Radio
              title={_('Do not change')}
              value="0"
              checked={reschedule === '0'}
              name="reschedule"
              onChange={this.onValueChange}>
            </Radio>

            <Radio
              title={_('Create Schedule')}
              value="1"
              checked={reschedule === '1'}
              name="reschedule"
              onChange={this.onValueChange}>
            </Radio>
            <FormGroup offset="1">
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
          </FormGroup>

          {capabilities.mayOp('create_alert') &&
            capabilities.mayOp('get_alerts') &&
            <FormGroup title={_('Email report to')} titleSize="3">
              <TextField
                grow="1"
                name="alert_email"
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

ModifyTaskWizard.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default ModifyTaskWizard;

// vim: set ts=2 sw=2 tw=80:
