/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {parseYesNo, NO_VALUE, YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import TimeZoneSelect from 'web/components/form/timezoneselect';
import Datepicker from 'web/components/form/datepicker';

import Layout from 'web/components/layout/layout';
import Column from 'web/components/layout/column';
import Row from 'web/components/layout/row';

import {renderSelectItems} from 'web/utils/render';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/utils/useCapabilities';

import {WizardContent, WizardIcon} from './taskwizard';

const ModifyTaskWizard = ({
  alert_email = '',
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
  const [_] = useTranslation();
  const capabilities = useCapabilities();
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
          <Column>
            <FormGroup title={_('Task')}>
              <Select
                name="task_id"
                value={state.task_id}
                items={renderSelectItems(tasks)}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayCreate('schedule') &&
              capabilities.mayAccess('schedules') && (
                <FormGroup title={_('Start Time')}>
                  <Radio
                    title={_('Do not change')}
                    value={NO_VALUE}
                    checked={state.reschedule === NO_VALUE}
                    convert={parseYesNo}
                    name="reschedule"
                    onChange={onValueChange}
                  />
                  <Radio
                    title={_('Create Schedule')}
                    value={YES_VALUE}
                    checked={state.reschedule === YES_VALUE}
                    convert={parseYesNo}
                    name="reschedule"
                    onChange={onValueChange}
                  />
                  <Datepicker
                    name="start_date"
                    timezone={state.start_timezone}
                    value={state.start_date}
                    onChange={onValueChange}
                  />
                  <Row>
                    <span>{_('at')}</span>
                    <Spinner
                      type="int"
                      min="0"
                      max="23"
                      name="start_hour"
                      value={state.start_hour}
                      onChange={onValueChange}
                    />
                    <span>{_('h')}</span>
                    <Spinner
                      type="int"
                      min="0"
                      max="59"
                      name="start_minute"
                      value={state.start_minute}
                      onChange={onValueChange}
                    />
                    <span>{_('m')}</span>
                  </Row>
                  <TimeZoneSelect
                    name="start_timezone"
                    value={state.start_timezone}
                    onChange={onValueChange}
                  />
                </FormGroup>
              )}

            {capabilities.mayCreate('alert') &&
              capabilities.mayAccess('alerts') && (
                <FormGroup title={_('Email report to')}>
                  <TextField
                    grow="1"
                    name="alert_email"
                    value={state.alert_email}
                    maxLength="80"
                    onChange={onValueChange}
                  />
                </FormGroup>
              )}
          </Column>
        </Layout>
      )}
    </SaveDialog>
  );
};

ModifyTaskWizard.propTypes = {
  alert_email: PropTypes.string,
  reschedule: PropTypes.oneOf([NO_VALUE, YES_VALUE]),
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

export default ModifyTaskWizard;

// vim: set ts=2 sw=2 tw=80:
