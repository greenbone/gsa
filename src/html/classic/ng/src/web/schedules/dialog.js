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

import moment from 'moment-timezone';

import {autobind} from '../../utils.js';
import _ from '../../locale.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';

import Select2 from '../form/select2.js';
import Spinner from '../form/spinner.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import DatePicker from '../form/datepicker.js';
import TimeZoneSelect from '../form/timezoneselect.js';

const TimeUnitSelect = props => {
  return (
    <Select2 {...props} defaultValue="hour">
      <option value="hour">{_('hour(s)')}</option>
      <option value="day">{_('day(s)')}</option>
      <option value="week">{_('week(s)')}</option>
      <option value="month">{_('month(s)')}</option>
    </Select2>
  );
};

export class ScheduleDialog extends Dialog {

  constructor(...args) {
    super(...args);

    autobind(this, 'on');
  }

  show() {
    this.loadData();
  }

  loadData() {
    let {gmp} = this.context;
    let timezone = gmp.globals.timezone;
    let now = moment().tz(timezone);
    this.setState({
      error: undefined,
      name: _('unnamed'),
      comment: '',
      minute: now.minutes(),
      hour: now.hours(),
      date: now,
      width: 800,
      visible: true,
      timezone,
      period: 0,
      duration: 0,
      period_unit: 'hour',
      duration_unit: 'hour',
    });
  }

  save() {
    let {gmp} = this.context;
    return gmp.schedule.create(this.state).then(schedule => {
      this.close();
      return schedule;
    }, xhr => {
      this.showErrorMessage(xhr.action_result.message);
      throw new Error('Schedule creation failed. Reason: ' +
        xhr.action_result.message);
    });
  }

  onCommentChange(comment) {
    this.setState({comment});
  }

  onNameChange(name) {
    this.setState({name});
  }

  onHourChange(hour) {
    this.setState({hour});
  }

  onMinuteChange(minute) {
    this.setState({minute});
  }

  onTimezoneChange(timezone) {
    this.setState({timezone});
  }

  onDateChange(date) {
    this.setState({date});
  }

  onPeriodChange(period) {
    this.setState({period});
  }

  onPeriodUnitChange(period_unit) {
    this.setState({period_unit});
  }

  onDurationChange(duration) {
    this.setState({duration});
  }

  onDurationUnitChange(duration_unit) {
    this.setState({duration_unit});
  }

  renderContent() {
    let {comment, name, hour, minute, date, duration, period, duration_unit,
      period_unit, timezone} = this.state;
    return (
      <Layout flex="column">

        <FormGroup title={_('Name')}>
          <TextField name="name"
            grow="1"
            value={name} size="30"
            onChange={this.onNameChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')}>
          <TextField name="comment" value={comment}
            grow="1"
            size="30" maxLength="400"
            onChange={this.onCommentChange}/>
        </FormGroup>

        <FormGroup title={_('First Time')}>
          <DatePicker value={date} onChange={this.onDateChange}/>
          <Spinner type="int" min="0" max="23" size="2"
            value={hour} onChange={this.onHourChange}/> h
          <Spinner type="int" min="0" max="59" size="2"
            value={minute} onChange={this.onMinuteChange}/> m
        </FormGroup>

        <FormGroup title={_('Timezone')}>
          <TimeZoneSelect value={timezone} onChange={this.onTimezoneChange}/>
        </FormGroup>

        <FormGroup title={_('Period')}>
          <Spinner type="int" min="0" size="3"
            value={period} onChange={this.onPeriodChange}/>
          <TimeUnitSelect value={period_unit}
            onChange={this.onPeriodUnitChange}/>
        </FormGroup>

        <FormGroup title={_('Duration')}>
          <Spinner type="int" min="0" size="3"
            value={duration} onChange={this.onDurationChange}/>
          <TimeUnitSelect value={duration_unit}
            onChange={this.onDurationUnitChange}/>
        </FormGroup>
      </Layout>
    );
  }
}

ScheduleDialog.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default ScheduleDialog;

// vim: set ts=2 sw=2 tw=80:

