/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import {NO_VALUE} from 'gmp/parser';

import {is_defined} from 'gmp/utils/identity';

import Event from 'gmp/models/event';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import Select from '../../components/form/select.js';
import Spinner from '../../components/form/spinner.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import DatePicker from '../../components/form/datepicker.js';
import TimeZoneSelect from '../../components/form/timezoneselect.js';
import CheckBox from '../../components/form/checkbox.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

const TimeUnitSelect = ({
  month = false,
  ...props
 }) => {
  const unitOptions = [
    {value: 'hour', label: _('hour(s)')},
    {value: 'day', label: _('day(s)')},
    {value: 'week', label: _('week(s)')},
  ];

  if (month) {
    unitOptions.push({value: 'month', label: _('month(s)')});
  }

  return (
    <Select
      {...props}
      items={unitOptions}
    />
  );
};

TimeUnitSelect.propTypes = {
  month: PropTypes.bool,
};

class ScheduleDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSave = this.handleSave.bind(this);
  }

  handleSave({
    comment,
    endDate,
    endHour,
    endMinute,
    endOpen = false,
    id,
    name,
    period_unit,
    period,
    startDate,
    startHour,
    startMinute,
    timezone,
  }) {
    const {onSave} = this.props;

    if (!is_defined(onSave)) {
      return Promise.resolve();
    }

    startDate = moment(startDate)
      .tz(timezone)
      .seconds(0)
      .hours(startHour)
      .minutes(startMinute);

    if (!endOpen) {
      endDate = moment(endDate)
        .tz(timezone)
        .seconds(0)
        .hours(endHour)
        .minutes(endMinute);
    }

    const event = Event.fromData({
      duration: endOpen ? undefined : moment.duration(endDate.diff(startDate)),
      description: comment,
      period,
      periodUnit: period_unit,
      summary: name,
      startDate,
    }, timezone);

    console.log(event.toIcalString());

    return onSave({
      id,
      name,
      comment,
      icalendar: event.toIcalString(),
      timezone,
    });
  }

  render() {
    const {
      comment = '',
      duration,
      id,
      name = _('Unnamed'),
      period = NO_VALUE,
      period_unit = 'hour',
      timezone = 'UTC',
      startDate = moment().tz(timezone).startOf('hour').add(1, 'hour'),
      title = _('New Schedule'),
      visible = true,
      onClose,
    } = this.props;

    const endDate = is_defined(duration) ?
      startDate.clone().add(duration) :
      startDate.clone().add(1, 'hour');

    const data = {
      comment,
      endDate,
      endHour: endDate.hours(),
      endMinute: endDate.minutes(),
      endOpen: !is_defined(duration),
      id,
      name,
      period,
      period_unit,
      startDate,
      startHour: startDate.hours(),
      startMinute: startDate.minutes(),
      timezone,
    };
    return (
      <SaveDialog
        visible={visible}
        title={title}
        onClose={onClose}
        onSave={this.handleSave}
        defaultValues={data}
      >
        {({
          values: state,
          onValueChange,
        }) => (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
                maxLength="80"
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                maxLength="400"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Timezone')}>
              <TimeZoneSelect
                name="timezone"
                value={state.timezone}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Start')}>
              <DatePicker
                name="startDate"
                value={state.startDate}
                onChange={onValueChange}
              />
              <Divider>
                <Spinner
                  name="startHour"
                  type="int"
                  min="0"
                  max="23"
                  size="2"
                  value={state.startHour}
                  onChange={onValueChange}
                /> h
                <Spinner
                  name="startMinute"
                  type="int"
                  min="0"
                  max="59"
                  size="2"
                  value={state.startMinute}
                  onChange={onValueChange}
                /> m
              </Divider>
            </FormGroup>

            <FormGroup title={_('End')}>
              <DatePicker
                disabled={state.endOpen}
                name="endDate"
                value={state.endDate}
                onChange={onValueChange}
              />
              <Divider>
                <Spinner
                  disabled={state.endOpen}
                  name="endHour"
                  type="int"
                  min="0"
                  max="23"
                  size="2"
                  value={state.endHour}
                  onChange={onValueChange}
                /> h
                <Spinner
                  disabled={state.endOpen}
                  name="endMinute"
                  type="int"
                  min="0"
                  max="59"
                  size="2"
                  value={state.endMinute}
                  onChange={onValueChange}
                /> m
                <CheckBox
                  title={_('Open End')}
                  name="endOpen"
                  checked={state.endOpen}
                  onChange={onValueChange}
                />
              </Divider>
            </FormGroup>

            <FormGroup title={_('Period')}>
              <Divider>
                <Spinner
                  name="period"
                  type="int"
                  min="0"
                  size="3"
                  value={state.period}
                  onChange={onValueChange}
                />
                <TimeUnitSelect
                  month
                  name="period_unit"
                  value={state.period_unit}
                  onChange={onValueChange}
                />
              </Divider>
            </FormGroup>
          </Layout>
        )}
      </SaveDialog>
    );
  }
}

ScheduleDialog.propTypes = {
  comment: PropTypes.string,
  date: PropTypes.date,
  duration: PropTypes.duration,
  id: PropTypes.string,
  name: PropTypes.string,
  period: PropTypes.number,
  period_unit: PropTypes.timeunit,
  startDate: PropTypes.momentDate,
  timezone: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ScheduleDialog;

// vim: set ts=2 sw=2 tw=80:
