/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import withDialog from '../components/dialog/withDialog.js';

import Select from '../components/form/select.js';
import Spinner from '../components/form/spinner.js';
import FormGroup from '../components/form/formgroup.js';
import Radio from '../components/form/radio.js';
import Text from '../components/form/text.js';
import TextField from '../components/form/textfield.js';
import TimeZoneSelect from '../components/form/timezoneselect.js';
import Datepicker from '../components/form/datepicker.js';

import Img from '../components/img/img.js';

import Divider from '../components/layout/divider.js';
import Layout from '../components/layout/layout.js';

import {render_options} from '../utils/render.js';

import {Wizardess, WizardContent} from './taskwizard';

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
  const task_opts = render_options(tasks);
  return (
    <Layout flex align={['start', 'start']}>
      <Layout basis="40%">
        <Wizardess>
          <Img src="enchantress.svg"/>
        </Wizardess>
        <WizardContent>
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
        </WizardContent>
      </Layout>
      <Layout
        basis="0"
        grow="1"
        flex="column">
        <h1>{_('Quick edit: Modify a task')}</h1>
        <FormGroup title={_('Task')} titleSize="3">
          <Select
            name="task_id"
            value={task_id}
            onChange={onValueChange}>
            {task_opts}
          </Select>
        </FormGroup>

        <FormGroup
          title={_('Start Time')}
          titleSize="3"
          flex="column">
          <FormGroup>
            <Radio
              title={_('Do not change')}
              value="0"
              checked={reschedule === '0'}
              name="reschedule"
              onChange={onValueChange}>
            </Radio>
          </FormGroup>
          <FormGroup>
            <Radio
              title={_('Create Schedule')}
              value="1"
              checked={reschedule === '1'}
              name="reschedule"
              onChange={onValueChange}>
            </Radio>
          </FormGroup>
          <FormGroup offset="1">
            <Datepicker
              name="date"
              value={date}
              onChange={onValueChange}/>
          </FormGroup>
          <FormGroup offset="1">
            <Divider>
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
            </Divider>
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
  tasks: PropTypes.array,
  onValueChange: PropTypes.func,
};


export default withDialog({
  width: '900px',
  title: _('Modify Task Wizard'),
  footer: _('Modify'),
  defaultState: {
    tasks: [],
  },
})(ModifyTaskWizard);

// vim: set ts=2 sw=2 tw=80:
