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

import {isDefined} from 'gmp/utils/identity';

import Button from 'web/components/form/button';
import Datepicker from 'web/components/form/datepicker';
import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

class StartTimeSelection extends React.Component {
  constructor(...args) {
    super(...args);

    const {startDate, endDate} = this.props;

    this.state = {
      startDate,
      startHour: startDate.hour(),
      startMinute: startDate.minute(),
      endDate,
      endHour: endDate.hour(),
      endMinute: endDate.minute(),
    };

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const {startDate, endDate} = props;

    if (
      (isDefined(startDate) && startDate !== state.prevStartDate) ||
      (isDefined(endDate) && props.endDate !== state.prevEndDate)
    ) {
      return {
        endHour: endDate.hour(),
        endMinute: endDate.minute(),
        prevStartDate: startDate,
        prevEndDate: endDate,
        startHour: startDate.hour(),
        startMinute: startDate.minute(),
      };
    }
    return null;
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleUpdate() {
    const {startDate, endDate, onChanged} = this.props;
    const {startHour, startMinute, endHour, endMinute} = this.state;

    onChanged({
      startDate: startDate
        .clone()
        .hour(startHour)
        .minute(startMinute),
      endDate: endDate
        .clone()
        .hour(endHour)
        .minute(endMinute),
    });
  }

  render() {
    const {endDate, startDate, timezone} = this.props;
    const {startHour, startMinute, endHour, endMinute} = this.state;
    return (
      <Layout flex="column">
        <FormGroup data-testid="timezone" title={_('Timezone')}>
          {timezone}
        </FormGroup>
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
              />{' '}
              h
              <Spinner
                name="startMinute"
                value={startMinute}
                min="0"
                max="59"
                type="int"
                onChange={this.handleValueChange}
              />{' '}
              m
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
              />{' '}
              h
              <Spinner
                name="endMinute"
                value={endMinute}
                min="0"
                max="59"
                type="int"
                onChange={this.handleValueChange}
              />{' '}
              m
            </Divider>
          </Divider>
        </FormGroup>

        <FormGroup offset="4">
          <Button data-testid="update-button" onClick={this.handleUpdate}>
            {_('Update')}
          </Button>
        </FormGroup>
      </Layout>
    );
  }
}

StartTimeSelection.propTypes = {
  endDate: PropTypes.date.isRequired,
  startDate: PropTypes.date.isRequired,
  timezone: PropTypes.string.isRequired,
  onChanged: PropTypes.func.isRequired,
};

export default StartTimeSelection;

// vim: set ts=2 sw=2 tw=80:
