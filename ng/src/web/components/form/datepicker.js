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

import moment from 'moment';

import _, {get_language} from 'gmp/locale';
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import Icon from '../icon/icon.js';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const StyledIcon = glamorous(Icon)({
  marginLeft: '5px',
  ':hover': {
    cursor: 'pointer',
  },
});

const StyledDiv = glamorous.div({
  display: 'flex',
  marginRight: '5px',
},
  ({width}) => ({width}),
);

class InputField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      onClick,
      value,
      width = 'auto',
      ...props
    } = this.props;

    return (
      <StyledDiv
        onClick={onClick}
        width={width}
        {...props}
      >
        {value}
        <StyledIcon img="calendar.svg"/>
      </StyledDiv>
    );
  }
}

InputField.propTypes = {
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
      minDate = moment(),
      name,
      width,
      value = moment(),
      ...props
    } = this.props;

    return (
      <DatePicker
        {...props}
        customInput={<InputField width={width}/>}
        minDate={minDate === false ? undefined : minDate}
        maxDate={moment().add(3, 'years')}
        selected={value}
        todayButton={_('Today')}
        locale={get_language()}
        onChange={this.handleChange}
      />
    );
  }
}

DatePickerComponent.propTypes = {
  minDate: PropTypes.oneOfType([
    PropTypes.momentDate,
    PropTypes.oneOf([false]),
  ]),
  name: PropTypes.string,
  value: PropTypes.momentDate.isRequired,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default DatePickerComponent;

// vim: set ts=2 sw=2 tw=80:
