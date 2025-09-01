/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import {TimePicker} from '@greenbone/ui-lib';
import {Date} from 'gmp/models/date';
import Button from 'web/components/form/Button';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/FormGroup';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import {formatTimeForTimePicker} from 'web/utils/timePickerHelpers';

interface StartTimeSelectionProps {
  startDate: Date;
  endDate: Date;
  timezone: string;
  onChanged: (dates: {startDate: Date; endDate: Date}) => void;
}

const StartTimeSelection = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  timezone = '',
  onChanged,
}: StartTimeSelectionProps) => {
  const [_] = useTranslation();
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [startTime, setStartTime] = useState(
    formatTimeForTimePicker(initialStartDate),
  );

  const [endTime, setEndTime] = useState(
    formatTimeForTimePicker(initialEndDate),
  );

  useEffect(() => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setStartTime(formatTimeForTimePicker(initialStartDate));
    setEndTime(formatTimeForTimePicker(initialEndDate));
  }, [initialStartDate, initialEndDate]);

  const handleStartTimeChange = (selectedTime: string) => {
    const [hour, minute] = selectedTime.split(':').map(Number);
    const newStartDate = startDate.clone().hour(hour).minute(minute);
    setStartDate(newStartDate);
    setStartTime(selectedTime);
  };

  const handleEndTimeChange = (selectedTime: string) => {
    const [hour, minute] = selectedTime.split(':').map(Number);
    const newEndDate = endDate.clone().hour(hour).minute(minute);
    setEndDate(newEndDate);
    setEndTime(selectedTime);
  };

  const handleUpdate = () => {
    onChanged({
      startDate: startDate.clone(),
      endDate: endDate.clone(),
    });
  };
  return (
    <Column>
      <FormGroup data-testid="timezone" title={_('Timezone')}>
        {timezone.replace('_', ' ')}
      </FormGroup>
      <FormGroup direction="row">
        <DatePicker
          label={_('Start Date')}
          maxDate={endDate}
          minDate={false}
          name="startDate"
          value={startDate}
          onChange={setStartDate}
        />
        <TimePicker
          label={_('Start Time')}
          name="startTime"
          value={startTime}
          onChange={handleStartTimeChange}
        />
      </FormGroup>

      <FormGroup direction="row">
        <DatePicker
          label={_('End Date')}
          minDate={false}
          name="endDate"
          value={endDate}
          onChange={setEndDate}
        />
        <TimePicker
          label={_('End Time')}
          name="endTime"
          value={endTime}
          onChange={handleEndTimeChange}
        />
      </FormGroup>

      <Row>
        <Button
          data-testid="update-button"
          disabled={
            startDate.isSameOrAfter(endDate) || startDate.isSame(endDate)
          }
          onClick={handleUpdate}
        >
          {_('Update')}
        </Button>
      </Row>
    </Column>
  );
};

export default StartTimeSelection;
