/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import Button from '../../components/form/button.js';
import Datepicker from '../../components/form/datepicker.js';
import FormGroup from '../../components/form/formgroup.js';
import Spinner from '../../components/form/spinner.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

class StartTimeSelection extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      start_date: this.props.startDate,
      start_hour: this.props.startHour,
      start_minute: this.props.startMinute,
      end_date: this.props.endDate,
      end_hour: this.props.endHour,
      end_minute: this.props.endMinute,
    };

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  componentWillReceiveProps(next) {
    const {
      start_date,
      start_hour,
      start_minute,
      end_date,
      end_hour,
      end_minute,
    } = this.state;

    const state = {};

    if (!start_date.isSame(next.startDate)) {
      state.start_date = next.startDate;
    }
    if (start_hour !== next.startHour) {
      state.start_hour = next.startHour;
    }
    if (start_minute !== next.startMinute) {
      state.start_minute = next.startMinute;
    }
    if (!end_date.isSame(next.endDate)) {
      state.end_date = next.endDate;
    }
    if (end_hour !== next.endHour) {
      state.end_hour = next.endHour;
    }
    if (end_minute !== next.endMinute) {
      state.end_minute = next.endMinute;
    }

    this.setState(state);
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleUpdate() {
    const {onChanged} = this.props;
    const {
      start_date,
      start_hour,
      start_minute,
      end_date,
      end_hour,
      end_minute,
    } = this.state;

    onChanged({
      start_date,
      start_hour,
      start_minute,
      end_date,
      end_hour,
      end_minute,
    });
  }

  render() {
    const {
      start_date,
      start_hour,
      start_minute,
      end_date,
      end_hour,
      end_minute,
    } = this.state;
    return (
      <Layout flex="column">
        <FormGroup title={_('Start Time')}>
          <Divider flex="column">
            <Datepicker
              value={start_date}
              name="start_date"
              minDate={false}
              onChange={this.handleValueChange}
            />
            <Divider margin="20px">
              <Spinner
                name="start_hour"
                value={start_hour}
                min="0"
                max="23"
                type="int"
                onChange={this.handleValueChange}
              /> h
              <Spinner
                name="start_minute"
                value={start_minute}
                min="0"
                max="59"
                type="int"
                onChange={this.handleValueChange}
              /> m
            </Divider>
          </Divider>
        </FormGroup>

        <FormGroup title={_('End Time')}>
          <Divider flex="column">
            <Datepicker
              value={end_date}
              name="end_date"
              minDate={false}
              onChange={this.handleValueChange}
            />
            <Divider margin="20px">
              <Spinner
                name="end_hour"
                value={end_hour}
                min="0"
                max="23"
                type="int"
                onChange={this.handleValueChange}
              /> h
              <Spinner
                name="end_minute"
                value={end_minute}
                min="0"
                max="59"
                type="int"
                onChange={this.handleValueChange}
              /> m
            </Divider>
          </Divider>
        </FormGroup>

        <FormGroup offset="4">
          <Button onClick={this.handleUpdate}>
            {_('Update')}
          </Button>
        </FormGroup>
      </Layout>
    );
  }
}

StartTimeSelection.propTypes = {
  endDate: PropTypes.momentDate,
  endHour: PropTypes.number,
  endMinute: PropTypes.number,
  startDate: PropTypes.momentDate,
  startHour: PropTypes.number,
  startMinute: PropTypes.number,
  onChanged: PropTypes.func.isRequired,
};

export default StartTimeSelection;

// vim: set ts=2 sw=2 tw=80:
