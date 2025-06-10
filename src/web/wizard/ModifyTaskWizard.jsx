/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {TimePicker} from '@greenbone/opensight-ui-components-mantinev7';
import {parseYesNo, NO_VALUE, YES_VALUE} from 'gmp/parser';
import SaveDialog from 'web/components/dialog/SaveDialog';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import TimeZoneSelect from 'web/components/form/TimeZoneSelect';
import Column from 'web/components/layout/Column';
import Layout from 'web/components/layout/Layout';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';
import {formatSplitTime} from 'web/utils/timePickerHelpers';
import {WizardContent, WizardIcon} from 'web/wizard/TaskWizard';

const ModifyTaskWizard = ({
  alertEmail = '',
  reschedule,
  startDate,
  startHour,
  startMinute,
  startTimezone,
  taskId,
  tasks = [],
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const data = {
    alertEmail,
    startDate,
    reschedule,
    startHour,
    startMinute,
    startTimezone,
    taskId,
  };

  const [timePickerValue, setTimePickerValue] = useState(
    formatSplitTime(startHour, startMinute),
  );

  const handleTimeChange = (selectedValue, onValueChange) => {
    const [startHour, startMinute] = selectedValue.split(':');
    setTimePickerValue(selectedValue);
    onValueChange(parseInt(startHour), 'startHour');
    onValueChange(parseInt(startMinute), 'startMinute');
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
                items={renderSelectItems(tasks)}
                name="taskId"
                value={state.taskId}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayCreate('schedule') &&
              capabilities.mayAccess('schedules') && (
                <FormGroup title={_('Start Time')}>
                  <Radio
                    checked={state.reschedule === NO_VALUE}
                    convert={parseYesNo}
                    name="reschedule"
                    title={_('Do not change')}
                    value={NO_VALUE}
                    onChange={onValueChange}
                  />
                  <Radio
                    checked={state.reschedule === YES_VALUE}
                    convert={parseYesNo}
                    name="reschedule"
                    title={_('Create Schedule')}
                    value={YES_VALUE}
                    onChange={onValueChange}
                  />
                  <DatePicker
                    label={_('Start Date')}
                    name="startDate"
                    timezone={state.startTimezone}
                    value={state.startDate}
                    onChange={onValueChange}
                  />
                  <TimePicker
                    label={_('Start Time')}
                    value={timePickerValue}
                    onChange={selectedTime =>
                      handleTimeChange(selectedTime, onValueChange)
                    }
                  />

                  <TimeZoneSelect
                    label={_('Timezone')}
                    name="startTimezone"
                    value={state.startTimezone}
                    onChange={onValueChange}
                  />
                </FormGroup>
              )}

            {capabilities.mayCreate('alert') &&
              capabilities.mayAccess('alerts') && (
                <FormGroup title={_('Email report to')}>
                  <TextField
                    grow="1"
                    maxLength="80"
                    name="alertEmail"
                    value={state.alertEmail}
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
  alertEmail: PropTypes.string,
  reschedule: PropTypes.oneOf([NO_VALUE, YES_VALUE]),
  startDate: PropTypes.date,
  startHour: PropTypes.number,
  startMinute: PropTypes.number,
  startTimezone: PropTypes.string,
  taskId: PropTypes.id,
  tasks: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ModifyTaskWizard;
