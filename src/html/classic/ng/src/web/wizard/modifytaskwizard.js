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

import _ from '../../locale.js';

import Layout from '../components/layout/layout.js';

import Img from '../img.js';
import PropTypes from '../proptypes.js';

import {withDialog} from '../dialog/dialog.js';

import Select2 from '../components/form/select2.js';
import Spinner from '../components/form/spinner.js';
import FormGroup from '../components/form/formgroup.js';
import Radio from '../components/form/radio.js';
import Text from '../components/form/text.js';
import TextField from '../components/form/textfield.js';
import TimeZoneSelect from '../components/form/timezoneselect.js';
import Datepicker from '../components/form/datepicker.js';

import {render_options} from '../render.js';

const ModifyTaskWizard = ({
    alert_email,
    date,
    reschedule,
    start_hour,
    start_minute,
    start_timezone,
    task_id,
    tasks,
    onValueChange,
  }, {capabilities}) => {
  let task_opts = render_options(tasks);
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
      <Layout
        basis="0"
        grow="1"
        flex="column">
        <h1>{_('Quick edit: Modify a task')}</h1>
        <FormGroup title={_('Task')} titleSize="3">
          <Select2
            name="task_id"
            value={task_id}
            onChange={onValueChange}>
            {task_opts}
          </Select2>
        </FormGroup>

        <FormGroup
          title={_('Start Time')}
          titleSize="3"
          flex="column">
          <Radio
            title={_('Do not change')}
            value="0"
            checked={reschedule === '0'}
            name="reschedule"
            onChange={onValueChange}>
          </Radio>

          <Radio
            title={_('Create Schedule')}
            value="1"
            checked={reschedule === '1'}
            name="reschedule"
            onChange={onValueChange}>
          </Radio>
          <FormGroup offset="1">
            <Datepicker
              name="date"
              value={date}
              onChange={onValueChange}/>
          </FormGroup>
          <FormGroup offset="1">
            <Text>{_('at')}</Text>
            <Spinner
              type="int"
              min="0"
              max="23"
              size="2"
              name="start_hour"
              value={start_hour}
              onChange={onValueChange}/>
            <Text>{_('h')}</Text>
            <Spinner
              type="int"
              min="0"
              max="59"
              size="2"
              name="start_minute"
              value={start_minute}
              onChange={onValueChange}/>
            <Text>{_('m')}</Text>
          </FormGroup>
          <FormGroup offset="1">
            <TimeZoneSelect
              name="start_timezone"
              value={start_timezone}
              onChange={onValueChange}/>
          </FormGroup>
        </FormGroup>

        {capabilities.mayCreate('alert') &&
          capabilities.mayAccess('alerts') &&
          <FormGroup title={_('Email report to')} titleSize="3">
            <TextField
              grow="1"
              name="alert_email"
              value={alert_email}
              size="30"
              maxLength="80"
              onChange={onValueChange}/>
          </FormGroup>
        }
      </Layout>
    </Layout>
  );
};

ModifyTaskWizard.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ModifyTaskWizard.propTypes = {
  alert_email: PropTypes.string,
  date: PropTypes.momentDate,
  reschedule: PropTypes.oneOf([
    '0', '1',
  ]),
  start_hour: PropTypes.number,
  start_minute: PropTypes.number,
  start_timezone: PropTypes.string,
  task_id: PropTypes.id,
  tasks: PropTypes.arrayLike,
  onValueChange: PropTypes.func,
};


export default withDialog(ModifyTaskWizard, {
  title: _('Modify Task Wizard'),
  footer: _('Modify'),
  defaultState: {
    tasks: [],
  },
});

// vim: set ts=2 sw=2 tw=80:
