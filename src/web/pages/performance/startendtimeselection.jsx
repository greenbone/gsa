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

  useEffect(() => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [initialStartDate, initialEndDate]);

  const handleValueChange = (value, name) => {
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
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
          minDate={false}
          onChange={handleValueChange}
          label={_('Start Time')}
        />
      </FormGroup>

      <FormGroup direction="row">
        <DatePicker
          value={endDate}
          name="endDate"
          minDate={false}
          onChange={handleValueChange}
          label={_('End Time')}
        />
      </FormGroup>

      <Row>
        <Button data-testid="update-button" onClick={handleUpdate}>
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
