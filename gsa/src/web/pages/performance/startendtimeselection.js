/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

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

    const {
      startDate,
      startHour,
      startMinute,
      endDate,
      endHour,
      endMinute,
    } = this.props;

    this.state = {
      startDate,
      startHour,
      startMinute,
      endDate,
      endHour,
      endMinute,
    };

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  componentWillReceiveProps(next) {
    const {
      startDate,
      startHour,
      startMinute,
      endDate,
      endHour,
      endMinute,
    } = this.state;

    const state = {};

    if (!startDate.isSame(next.startDate)) {
      state.startDate = next.startDate;
    }
    if (startHour !== next.startHour) {
      state.startHour = next.startHour;
    }
    if (startMinute !== next.startMinute) {
      state.startMinute = next.startMinute;
    }
    if (!endDate.isSame(next.endDate)) {
      state.endDate = next.endDate;
    }
    if (endHour !== next.endHour) {
      state.endHour = next.endHour;
    }
    if (endMinute !== next.endMinute) {
      state.endMinute = next.endMinute;
    }

    this.setState(state);
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleUpdate() {
    const {onChanged} = this.props;
    const {
      startDate,
      startHour,
      startMinute,
      endDate,
      endHour,
      endMinute,
    } = this.state;

    onChanged({
      startDate,
      startHour,
      startMinute,
      endDate,
      endHour,
      endMinute,
    });
  }

  render() {
    const {
      startDate,
      startHour,
      startMinute,
      endDate,
      endHour,
      endMinute,
    } = this.state;
    return (
      <Layout flex="column">
        <FormGroup title={_('Start Time')}>
          <Divider flex="column">
            <Datepicker
              value={startDate}
              name="startDate"
              minDate={false}
              onChange={this.handleValueChange}
            />
            <Divider margin="20px">
              <Spinner
                name="startHour"
                value={startHour}
                min="0"
                max="23"
                type="int"
                onChange={this.handleValueChange}
              /> h
              <Spinner
                name="startMinute"
                value={startMinute}
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
              value={endDate}
              name="endDate"
              minDate={false}
              onChange={this.handleValueChange}
            />
            <Divider margin="20px">
              <Spinner
                name="endHour"
                value={endHour}
                min="0"
                max="23"
                type="int"
                onChange={this.handleValueChange}
              /> h
              <Spinner
                name="endMinute"
                value={endMinute}
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
  endDate: PropTypes.date,
  endHour: PropTypes.number,
  endMinute: PropTypes.number,
  startDate: PropTypes.date,
  startHour: PropTypes.number,
  startMinute: PropTypes.number,
  onChanged: PropTypes.func.isRequired,
};

export default StartTimeSelection;

// vim: set ts=2 sw=2 tw=80:
