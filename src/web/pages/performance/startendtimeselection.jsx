/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Button from 'web/components/form/button';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/formgroup';
import {TimePicker} from '@greenbone/opensight-ui-components';

import Column from 'web/components/layout/column';
import Row from 'web/components/layout/row';
import {formatTimeForTimePicker} from 'web/utils/timePickerHelpers';

const StartTimeSelection = props => {
  const {
    startDate: initialStartDate,
    endDate: initialEndDate,
    timezone,
    onChanged,
  } = props;
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
  }, [initialStartDate, initialEndDate]);

  const handleTimeChange = (selectedTime, type) => {
    const [hour, minute] = selectedTime.split(':').map(Number);

    if (type === 'startTime') {
      const newStartDate = startDate.clone().hours(hour).minutes(minute);
      setStartDate(newStartDate);
      setStartTime(selectedTime);
    } else if (type === 'endTime') {
      const newEndDate = endDate.clone().hours(hour).minutes(minute);
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
        {timezone}
      </FormGroup>
      <FormGroup direction="row">
        <DatePicker
          value={startDate}
          name="startDate"
          onChange={setStartDate}
          label={_('Start Date')}
          maxDate={endDate}
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
          value={endDate}
          name="endDate"
          minDate={startDate}
          onChange={setEndDate}
          label={_('End Date')}
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
          disabled={
            startDate.isSameOrAfter(endDate) || startDate.isSame(endDate)
          }
          data-testid="update-button"
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
