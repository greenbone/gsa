/* Copyright (C) 2017-2022 Greenbone AG
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
import {useState, useEffect} from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Button from 'web/components/form/button';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/formgroup';
import {TimePicker} from '@greenbone/opensight-ui-components';

import Column from 'web/components/layout/column';
import Row from 'web/components/layout/row';

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
    `${startDate.hours().toString().padStart(2, '0')}:${startDate.minutes().toString().padStart(2, '0')}`,
  );

  const [endTime, setEndTime] = useState(
    `${endDate.hours().toString().padStart(2, '0')}:${endDate.minutes().toString().padStart(2, '0')}`,
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
