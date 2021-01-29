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

import {parseYesNo, NO_VALUE, YES_VALUE} from 'gmp/parser';

import SaveDialog from 'web/components/dialog/savedialog';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import TimeZoneSelect from 'web/components/form/timezoneselect';
import Datepicker from 'web/components/form/datepicker';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import reducer, {updateState} from 'web/utils/stateReducer';
import withCapabilities from 'web/utils/withCapabilities';

import {WizardContent, WizardIcon} from './taskwizard';

const ModifyTaskWizard = ({
  alertEmail = '',
  capabilities,
  reschedule,
  startDate,
  startTimezone,
  taskId,
  tasks = [],
  onClose,
  onSave,
}) => {
  const [timeState, dispatch] = useReducer(reducer, {
    startDate,
    startTimezone,
  });

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
    reschedule,
    taskId,
    tasks,
    ...timeState,
  };

  return (
    <SaveDialog
      buttonTitle={_('Modify Task')}
      defaultValues={data}
      title={_('Modify Task Wizard')}
      width="900px"
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => (
        <Layout align={['start', 'start']}>
          <WizardIcon />
          <Layout basis="40%">
            <WizardContent>
              <p>
                <b>{_('Quick edit: Modify a task')}</b>
              </p>
              <div>
                {_(
                  'This wizard will modify an existing task for you. The difference ' +
                    'to the Edit Task dialog is that you can enter ' +
                    'values for associated objects directly here. The objects will then' +
                    ' be created for you automatically and assigned to the' +
                    ' selected task.',
                )}
              </div>
              <div>
                {_('Please be aware that:')}
                <ul>
                  {capabilities.mayCreate('schedule') &&
                    capabilities.mayAccess('schedules') && (
                      <li>
                        {_(
                          'Setting a start time overwrites a possibly already ' +
                            'existing one.',
                        )}
                      </li>
                    )}
                  {capabilities.mayCreate('alert') &&
                    capabilities.mayAccess('alerts') && (
                      <li>
                        {_(
                          'Setting an email Address means adding an additional' +
                            ' Alert, not replacing an existing one.',
                        )}
                      </li>
                    )}
                </ul>
              </div>
            </WizardContent>
          </Layout>
          <Layout basis="0" grow="1" flex="column">
            <FormGroup title={_('Task')} titleSize="3">
              <Select
                name="taskId"
                value={state.taskId}
                items={renderSelectItems(tasks)}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayCreate('schedule') &&
              capabilities.mayAccess('schedules') && (
                <FormGroup title={_('Start Time')} titleSize="3" flex="column">
                  <FormGroup>
                    <Radio
                      title={_('Do not change')}
                      value={NO_VALUE}
                      checked={state.reschedule === NO_VALUE}
                      convert={parseYesNo}
                      name="reschedule"
                      onChange={onValueChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Radio
                      title={_('Create Schedule')}
                      value={YES_VALUE}
                      checked={state.reschedule === YES_VALUE}
                      convert={parseYesNo}
                      name="reschedule"
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
                        min={0}
                        max={23}
                        size="2"
                        step={1}
                        name="startHour"
                        value={timeState.startDate.hours()}
                        onChange={handleTimeChange}
                      />
                      <span>{_('h')}</span>
                      <Spinner
                        type="int"
                        min={0}
                        max={59}
                        step={1}
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
                </FormGroup>
              )}

            {capabilities.mayCreate('alert') &&
              capabilities.mayAccess('alerts') && (
                <FormGroup title={_('Email report to')} titleSize="3">
                  <TextField
                    grow="1"
                    name="alertEmail"
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

ModifyTaskWizard.propTypes = {
  alertEmail: PropTypes.string,
  capabilities: PropTypes.capabilities.isRequired,
  reschedule: PropTypes.oneOf([NO_VALUE, YES_VALUE]),
  startDate: PropTypes.date,
  startTimezone: PropTypes.string,
  taskId: PropTypes.id,
  tasks: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default withCapabilities(ModifyTaskWizard);

// vim: set ts=2 sw=2 tw=80:
