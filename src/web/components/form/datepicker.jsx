/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';

import styled from 'styled-components';

import DatePicker from 'react-datepicker';

import _ from 'gmp/locale';

import {getLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import date from 'gmp/models/date';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import CalendarIcon from 'web/components/icon/calendaricon';

import 'react-datepicker/dist/react-datepicker.css';

const StyledCalendarIcon = styled(CalendarIcon)`
  margin-left: 5px;
  :hover {
    cursor: ${props => (props.disabled ? 'not-allowed ' : 'pointer')};
  }
`;

const StyledDiv = styled.div`
  display: flex;
  margin-right: 5px;
  width: ${props => props.width};
  color: ${props => (props.disabled ? Theme.lightGray : undefined)};
`;

// InputField must be a Class to work correctly with Datepicker :-/
// eslint-disable-next-line react/prefer-stateless-function
class InputField extends React.Component {
  render() {
    const {disabled, onClick, value, width = 'auto', ...props} = this.props;

    return (
      <StyledDiv {...props} disabled={disabled} width={width} onClick={onClick}>
        {value}
        <StyledCalendarIcon disabled={disabled} />
      </StyledDiv>
    );
  }
}

InputField.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.string,
  width: PropTypes.string,
  onClick: PropTypes.func,
};

const DatePickerComponent = ({
  disabled,
  timezone,
  minDate = date().tz(timezone),
  name,
  width,
  value = date().tz(timezone),
  onChange,
  ...restProps
}) => {
  const handleChange = useCallback(
    newValue => {
      if (isDefined(onChange)) {
        onChange(date(newValue).tz(timezone), name);
      }
    },
    [name, onChange, timezone],
  );
  return (
    <DatePicker
      data-testid="datepicker"
      {...restProps}
      disabled={disabled}
      customInput={<InputField width={width} disabled={disabled} />}
      minDate={
        minDate === false || !isDefined(minDate) ? undefined : minDate.toDate()
      }
      maxDate={date().add(3, 'years').toDate()}
      selected={value.toDate()}
      todayButton={_('Today')}
      locale={getLocale()}
      onChange={handleChange}
    />
  );
};

DatePickerComponent.propTypes = {
  disabled: PropTypes.bool,
  minDate: PropTypes.oneOfType([PropTypes.date, PropTypes.oneOf([false])]),
  name: PropTypes.string,
  timezone: PropTypes.string.isRequired,
  value: PropTypes.date.isRequired,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default DatePickerComponent;

// vim: set ts=2 sw=2 tw=80:
