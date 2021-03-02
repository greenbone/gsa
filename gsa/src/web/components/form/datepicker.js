/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import React from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {getLocale} from 'gmp/locale/lang';

import date from 'gmp/models/date';

import {isDefined} from 'gmp/utils/identity';

import CalendarIcon from 'web/components/icon/calendaricon';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

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

const DatePickerComponent = props => {
  const handleChange = value => {
    const {name, onChange} = props;

    if (isDefined(onChange)) {
      onChange(value, name);
    }
  };

  const {
    disabled,
    minDate = date(),
    name,
    width,
    value = date(),
    ...restProps
  } = props;

  return (
    <DatePicker
      {...restProps}
      disabled={disabled}
      customInput={<InputField width={width} disabled={disabled} />}
      minDate={minDate === false ? undefined : minDate}
      maxDate={date().add(3, 'years')}
      selected={value}
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
  value: PropTypes.date.isRequired,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default DatePickerComponent;

// vim: set ts=2 sw=2 tw=80:
