/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@reenbone.net>
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
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import PropTypes from '../utils/proptypes.js';

import SaveDialog from '../components/dialog/savedialog.js';

import Select from '../components/form/select.js';
import Spinner from '../components/form/spinner.js';
import FormGroup from '../components/form/formgroup.js';
import Radio from '../components/form/radio.js';
import TextField from '../components/form/textfield.js';
import TimeZoneSelect from '../components/form/timezoneselect.js';
import Datepicker from '../components/form/datepicker.js';

import Img from '../components/img/img.js';

import Divider from '../components/layout/divider.js';
import Layout from '../components/layout/layout.js';

import {render_select_items} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

import {Wizardess, WizardContent} from './taskwizard';

const ModifyTaskWizard = ({
  alert_email,
  capabilities,
  reschedule,
  start_date,
  start_hour,
  start_minute,
  start_timezone,
  task_id,
  tasks = [],
  onClose,
  onSave,
}) => {
  const data = {
    alert_email,
    start_date,
    reschedule,
    start_hour,
    start_minute,
    start_timezone,
    task_id,
    tasks,
  };

  return (
    <SaveDialog
      buttonTitle={_('Modify')}
      defaultValues={data}
      title={_('Modify Task Wizard')}
      width="900px"
      onClose={onClose}
      onSave={onSave}
    >
      {({
        values: state,
        onValueChange,
      }) => (
        <Layout flex align={['start', 'start']}>
          <Layout basis="40%">
            <Wizardess>
              <Img src="enchantress.svg"/>
            </Wizardess>
            <WizardContent>
              <div>
                {_('I will modify an existing task for you. The difference ' +
                  ' to the Edit Task dialog is that here you can enter ' +
                  'values for associated objects directly. I will then ' +
                  'create them for you automatically and assign them to the' +
                  ' selected task.')}
              </div>
              <div>
                {_('Please be aware that')}
                <ul>
                  <li>
                    {_('setting a start time overwrites a possibly already ' +
                      'existing one,')}
                  </li>
                  <li>
                    {_('setting an Email Address means adding an additional' +
                      ' Alert, not replacing an existing one.')}
                  </li>
                </ul>
              </div>
            </WizardContent>
          </Layout>
          <Layout
            basis="0"
            grow="1"
            flex="column"
          >
            <h1>{_('Quick edit: Modify a task')}</h1>
            <FormGroup title={_('Task')} titleSize="3">
              <Select
                name="task_id"
                value={state.task_id}
                items={render_select_items(tasks)}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup
              title={_('Start Time')}
              titleSize="3"
              flex="column"
            >
              <FormGroup>
                <Radio
                  title={_('Do not change')}
                  value={NO_VALUE}
                  checked={state.reschedule === NO_VALUE}
                  name="reschedule"
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup>
                <Radio
                  title={_('Create Schedule')}
                  value={YES_VALUE}
                  checked={state.reschedule === YES_VALUE}
                  name="reschedule"
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup offset="1">
                <Datepicker
                  name="start_date"
                  value={state.start_date}
                  onChange={onValueChange}
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
                    name="start_hour"
                    value={state.start_hour}
                    onChange={onValueChange}
                  />
                  <span>{_('h')}</span>
                  <Spinner
                    type="int"
                    min="0"
                    max="59"
                    size="2"
                    name="start_minute"
                    value={state.start_minute}
                    onChange={onValueChange}i
                  />
                  <span>{_('m')}</span>
                </Divider>
              </FormGroup>
              <FormGroup offset="1">
                <TimeZoneSelect
                  name="start_timezone"
                  value={state.start_timezone}
                  onChange={onValueChange}
                />
              </FormGroup>
            </FormGroup>

            {capabilities.mayCreate('alert') &&
              capabilities.mayAccess('alerts') &&
              <FormGroup title={_('Email report to')} titleSize="3">
                <TextField
                  grow="1"
                  name="alert_email"
                  value={state.alert_email}
                  size="30"
                  maxLength="80"
                  onChange={onValueChange}
                />
              </FormGroup>
            }
          </Layout>
        </Layout>
      )}
    </SaveDialog>
  );
};

ModifyTaskWizard.propTypes = {
  alert_email: PropTypes.string,
  capabilities: PropTypes.capabilities.isRequired,
  reschedule: PropTypes.oneOf([
    NO_VALUE, YES_VALUE,
  ]),
  start_date: PropTypes.date,
  start_hour: PropTypes.number,
  start_minute: PropTypes.number,
  start_timezone: PropTypes.string,
  task_id: PropTypes.id,
  tasks: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};


export default withCapabilities(ModifyTaskWizard);

// vim: set ts=2 sw=2 tw=80:
