/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TimePicker} from '@greenbone/opensight-ui-components-mantinev7';
import {useState, useEffect} from 'react';
import Button from 'web/components/form/Button';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/FormGroup';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {formatTimeForTimePicker} from 'web/utils/timePickerHelpers';

const StartTimeSelection = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  timezone = '',
  onChanged,
}) => {
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

  const handleTimeChange = (selectedTime, type) => {
    const [hour, minute] = selectedTime.split(':').map(Number);

    if (type === 'startTime') {
      const newStartDate = startDate.clone().hour(hour).minute(minute);
      setStartDate(newStartDate);
      setStartTime(selectedTime);
    } else if (type === 'endTime') {
      const newEndDate = endDate.clone().hour(hour).minute(minute);
      setEndDate(newEndDate);
      setEndTime(selectedTime);
    }
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
          onChange={newStartTime => handleTimeChange(newStartTime, 'startTime')}
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
          onChange={newEndTime => handleTimeChange(newEndTime, 'endTime')}
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

StartTimeSelection.propTypes = {
  endDate: PropTypes.date.isRequired,
  startDate: PropTypes.date.isRequired,
  timezone: PropTypes.string.isRequired,
  onChanged: PropTypes.func.isRequired,
};

export default StartTimeSelection;
