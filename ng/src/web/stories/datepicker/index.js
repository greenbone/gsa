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

import {storiesOf} from '@storybook/react';

import PropTypes from '../../utils/proptypes.js';

import DatePicker from 'web/components/form/datepicker.js';

const today = moment();
const testdate = moment('2018-10-10');

class ControlledDatePicker extends React.Component {

  constructor(...args) {
    super(...args);

    const {value} = this.props;

    this.state = {value};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    this.setState({value});
  }

  render() {
    const {value} = this.state;
    const {...props} = this.props;
    return (
      <DatePicker
        {...props}
        value={value}
        onChange={this.handleChange}
      />
    );
  }
}

ControlledDatePicker.propTypes = {
  value: PropTypes.momentDate,
};

const StyledDatePicker = glamorous(ControlledDatePicker)({
  border: '1px solid darkgreen',
  background: 'lightgreen',
  boxShadow: '5px 5px 10px black',
  fontFamily: 'Trebuchet MS,Tahoma,Verdana,Arial,sans-serif',
  fontSize: '14px',
});

storiesOf('Form/Datepicker', module)
  .add('default', () => {
    return (
      <ControlledDatePicker value={testdate}/>
    );
  })
  .add('custom width and style', () => {
    return (
      <StyledDatePicker
        value={testdate}
        width="300px"
      />
    );
  })
  .add('custom minDate', () => {
    const minDate = today.clone().subtract(5, 'days');
    return (
      <ControlledDatePicker
        value={today}
        minDate={minDate}
      />
    );
  })
  .add('minDate is false', () => {
    return (
      <ControlledDatePicker
        value={today}
        minDate={false}
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
