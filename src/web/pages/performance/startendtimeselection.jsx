/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Button from 'web/components/form/button';
import Datepicker from 'web/components/form/datepicker';
import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';

import Column from 'web/components/layout/column';
import Row from 'web/components/layout/row';

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
        startDate,
        endDate,
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
    const {onChanged} = this.props;
    const {startDate, endDate, startHour, startMinute, endHour, endMinute} =
      this.state;

    onChanged({
      startDate: startDate.clone().hour(startHour).minute(startMinute),
      endDate: endDate.clone().hour(endHour).minute(endMinute),
    });
  }

  render() {
    const {timezone} = this.props;
    const {endDate, startDate, startHour, startMinute, endHour, endMinute} =
      this.state;
    return (
      <Column>
        <FormGroup data-testid="timezone" title={_('Timezone')}>
          {timezone}
        </FormGroup>
        <FormGroup title={_('Start Time')} direction="row">
          <Datepicker
            value={startDate}
            name="startDate"
            timezone={timezone}
            minDate={false}
            onChange={this.handleValueChange}
          />
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
        </FormGroup>

        <FormGroup title={_('End Time')} direction="row">
          <Datepicker
            value={endDate}
            name="endDate"
            timezone={timezone}
            minDate={false}
            onChange={this.handleValueChange}
          />
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
        </FormGroup>

        <Row>
          <Button data-testid="update-button" onClick={this.handleUpdate}>
            {_('Update')}
          </Button>
        </Row>
      </Column>
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
