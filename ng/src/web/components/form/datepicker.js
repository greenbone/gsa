/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import glamorous from 'glamorous';

import DatePicker from 'react-datepicker';

import _ from 'gmp/locale';
import {get_language} from 'gmp/locale/lang';

import {is_defined} from 'gmp/utils';

import date from 'gmp/models/date';

import PropTypes from '../../utils/proptypes.js';

import Theme from '../../utils/theme.js';

import Icon from '../icon/icon.js';

import 'react-datepicker/dist/react-datepicker.css';

const StyledIcon = glamorous(Icon)({
  marginLeft: '5px',
}, ({disabled}) => ({
  ':hover': {
    cursor: disabled ? 'not-allowed ' : 'pointer',
  },
}));

const StyledDiv = glamorous.div({
  display: 'flex',
  marginRight: '5px',
},
  ({width, disabled}) => ({
    width,
    color: disabled ? Theme.lightGray : undefined,
  }),
);

// InputField must be a Class to work correctly with Datepicker :-/
class InputField extends React.Component { // eslint-disable-line react/prefer-stateless-function

  render() {
    const {
      disabled,
      onClick,
      value,
      width = 'auto',
      ...props
    } = this.props;

    return (
      <StyledDiv
        {...props}
        disabled={disabled}
        width={width}
        onClick={onClick}
      >
        {value}
        <StyledIcon
          disabled={disabled}
          img="calendar.svg"
        />
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

class DatePickerComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    const {name, onChange} = this.props;

    if (is_defined(onChange)) {
      onChange(value, name);
    }
  }

  render() {
    const {
      disabled,
      minDate = date(),
      name,
      width,
      value = date(),
      ...props
    } = this.props;

    return (
      <DatePicker
        {...props}
        disabled={disabled}
        customInput={
          <InputField
            width={width}
            disabled={disabled}
          />
        }
        minDate={minDate === false ? undefined : minDate}
        maxDate={date().add(3, 'years')}
        selected={value}
        todayButton={_('Today')}
        locale={get_language()}
        onChange={this.handleChange}
      />
    );
  }
}

DatePickerComponent.propTypes = {
  disabled: PropTypes.bool,
  minDate: PropTypes.oneOfType([
    PropTypes.date,
    PropTypes.oneOf([false]),
  ]),
  name: PropTypes.string,
  value: PropTypes.date.isRequired,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default DatePickerComponent;

// vim: set ts=2 sw=2 tw=80:
