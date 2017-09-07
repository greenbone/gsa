/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import $ from 'jquery';
import moment from 'moment';

import 'jquery-ui';
import 'jquery-ui/ui/widgets/datepicker.js';

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import Layout from '../layout/layout.js';

import './css/datepicker.css';
import '../../css/jquery-ui.theme.css';
import '../../css/jquery-ui.structure.css';

/* FIXME: the datepicker should be replaced with a native react datepicker in future */

class DatePicker extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.destroy();
  }

  init() {
    const {value} = this.props;
    const date = value.toDate();

    const button = $(this.button);
    button.datepicker({
      showOn: 'button',
      buttonImage: '/img/calendar.svg',
      buttonImageOnly: true,
      buttonText: _('Select date'),
      dateFormat: 'DD, d MM, yy',
      minDate: date,
      maxDate: '+3Y',
      onClose: this.handleChange,
    });

    button.datepicker('setDate', date);

    /* don't allow to change value_field by user */
    button.prop('readonly', true);
    button.attr('title', _('Select date') + '');
  }

  destroy() {
    $(this.button).datepicker('destroy');
  }

  handleChange() {
    const {onChange, name} = this.props;
    const date = $(this.button).datepicker('getDate');
    if (date && onChange) {
      onChange(moment(date), name);
    }
  }

  handleClick() {
    $(this.button).datepicker('show');
  }

  render() {
    const {onChange, name, value, ...other} = this.props; // eslint-disable-line no-unused-vars
    return (
      <Layout {...other}>
        <input
          className="datepicker-button"
          size="26"
          ref={ref => this.button = ref}
          onClick={this.handleClick}
        />
      </Layout>
    );
  }
}

DatePicker.propTypes = {
  name: PropTypes.string,
  value: PropTypes.momentDate.isRequired,
  onChange: PropTypes.func,
};

export default DatePicker;

// vim: set ts=2 sw=2 tw=80:
