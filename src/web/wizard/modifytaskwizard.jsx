/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';

import {parseYesNo, NO_VALUE, YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import TimeZoneSelect from 'web/components/form/timezoneselect';
import DatePicker from 'web/components/form/DatePicker';
import {TimePicker} from '@greenbone/opensight-ui-components-mantinev7';

import Layout from 'web/components/layout/layout';
import Column from 'web/components/layout/column';

import {renderSelectItems} from 'web/utils/render';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/hooks/useCapabilities';

import {WizardContent, WizardIcon} from './taskwizard';
import {formatSplitTime} from 'web/utils/timePickerHelpers';

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

  const [timePickerValue, setTimePickerValue] = useState(
    formatSplitTime(start_hour, start_minute),
  );

  const handleTimeChange = (selectedValue, onValueChange) => {
    const [start_hour, start_minute] = selectedValue.split(':');
    setTimePickerValue(selectedValue);
    onValueChange(parseInt(start_hour), 'start_hour');
    onValueChange(parseInt(start_minute), 'start_minute');
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
                  <DatePicker
                    name="start_date"
                    timezone={state.start_timezone}
                    value={state.start_date}
                    onChange={onValueChange}
                    label={_('Start Date')}
                  />
                  <TimePicker
                    label={_('Start Time')}
                    value={timePickerValue}
                    onChange={selectedTime =>
                      handleTimeChange(selectedTime, onValueChange)
                    }
                  />

                  <TimeZoneSelect
                    name="start_timezone"
                    label={_('Timezone')}
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
