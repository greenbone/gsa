/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {TimePicker} from '@greenbone/ui-lib';
import {Date} from 'gmp/models/date';
import Task from 'gmp/models/task';
import {parseYesNo, NO_VALUE, YES_VALUE, YesNo} from 'gmp/parser';
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
import {RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';
import {formatSplitTime} from 'web/utils/timePickerHelpers';
import {WizardContent, WizardIcon} from 'web/wizard/TaskWizard';

interface ModifyTaskWizardState {
  alertEmail: string;
  reschedule: YesNo;
  startDate: Date;
  startHour: number;
  startMinute: number;
  startTimezone: string;
  taskId: string;
}

export type ModifyTaskWizardData = ModifyTaskWizardState;

interface ModifyTaskWizardProps {
  alertEmail?: string;
  reschedule?: YesNo;
  startDate: Date;
  startHour: number;
  startMinute: number;
  startTimezone: string;
  taskId: string;
  tasks?: Task[];
  onClose?: () => void;
  onSave?: (values: ModifyTaskWizardData) => void;
}

const ModifyTaskWizard = ({
  alertEmail = '',
  reschedule = NO_VALUE,
  startDate,
  startHour,
  startMinute,
  startTimezone,
  taskId,
  tasks = [],
  onClose,
  onSave,
}: ModifyTaskWizardProps) => {
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
    <SaveDialog<{}, ModifyTaskWizardState>
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
                    capabilities.mayAccess('schedule') && (
                      <li>
                        {_(
                          'Setting a start time overwrites a possibly already ' +
                            'existing one.',
                        )}
                      </li>
                    )}
                  {capabilities.mayCreate('alert') &&
                    capabilities.mayAccess('alert') && (
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
                items={renderSelectItems(tasks as RenderSelectItemProps[])}
                name="taskId"
                value={state.taskId}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayCreate('schedule') &&
              capabilities.mayAccess('schedule') && (
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
              capabilities.mayAccess('alert') && (
                <FormGroup title={_('Email report to')}>
                  <TextField
                    grow="1"
                    maxLength={80}
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

export default ModifyTaskWizard;
