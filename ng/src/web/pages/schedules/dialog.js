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

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';

import date, {duration as createDuration} from 'gmp/models/date';
import Event, {ReccurenceFrequency, WeekDays} from 'gmp/models/event';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import DatePicker from 'web/components/form/datepicker';
import TimeZoneSelect from 'web/components/form/timezoneselect';
import CheckBox from 'web/components/form/checkbox';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import TimeUnitSelect from './timeunitselect';
import WeekDaySelect, {WeekDaysPropType} from './weekdayselect';
import {renderDuration} from './render';

const RECURRENCE_ONCE = 'once';
const RECURRENCE_HOURLY = ReccurenceFrequency.HOURLY;
const RECURRENCE_DAILY = ReccurenceFrequency.DAILY;
const RECURRENCE_WEEKLY = ReccurenceFrequency.WEEKLY;
const RECURRENCE_MONTHLY = ReccurenceFrequency.MONTHLY;
const RECURRENCE_YEARLY = ReccurenceFrequency.YEARLY;
const RECURRENCE_WORKWEEK = 'workweek';
const RECURRENCE_CUSTOM = 'custom';

const RECURRENCE_TYPE_ITEMS = [{
  label: _('Once'),
  value: RECURRENCE_ONCE,
}, {
  label: _('Hourly'),
  value: RECURRENCE_HOURLY,
}, {
  label: _('Daily'),
  value: RECURRENCE_DAILY,
}, {
  label: _('Weekly'),
  value: RECURRENCE_WEEKLY,
}, {
  label: _('Monthly'),
  value: RECURRENCE_MONTHLY,
}, {
  label: _('Yearly'),
  value: RECURRENCE_YEARLY,
}, {
  label: _('Workweek (Monday till Friday)'),
  value: RECURRENCE_WORKWEEK,
}, {
  label: _('Custom...'),
  value: RECURRENCE_CUSTOM,
}];

class ScheduleDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = this.initialState(this.props);

    this.handleSave = this.handleSave.bind(this);
    this.handleRecurrenceTypeChange =
      this.handleRecurrenceTypeChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  initialState(props) {
    const {
      duration,
      timezone,
      startDate = date().tz(timezone).startOf('hour').add(1, 'hour'),
    } = props;
    let {
      freq,
      interval = 1,
      weekdays = new WeekDays(),
    } = this.props;

    let recurrenceType;

    if (is_defined(freq)) {
      if (weekdays.isDefault() && interval === 1) {
        recurrenceType = freq;
      }
      else {
        recurrenceType = RECURRENCE_CUSTOM;
        if (weekdays.isDefault()) {
          weekdays = weekdays.setWeekDayFromDate(startDate);
        }
      }
    }
    else {
      recurrenceType = RECURRENCE_ONCE;
    }

    const endDate = is_defined(duration) ?
      startDate.clone().add(duration) :
      startDate.clone().add(1, 'hour');

    return {
      endDate,
      endHour: endDate.hours(),
      endMinute: endDate.minutes(),
      endOpen: !is_defined(duration),
      interval,
      freq,
      recurrenceType,
      startDate,
      startHour: startDate.hours(),
      startMinute: startDate.minutes(),
      weekdays,
      initialWeekdays: weekdays,
    };
  }

  handleRecurrenceTypeChange(recurrenceType) {
    if (recurrenceType === RECURRENCE_CUSTOM) {
      const {startDate, initialWeekdays} = this.state;

      this.setState({
        interval: 1,
        freq: RECURRENCE_WEEKLY,
        recurrenceType,
        weekdays: initialWeekdays.setWeekDayFromDate(startDate),
      });
    }
    else if (recurrenceType === RECURRENCE_HOURLY ||
      recurrenceType === RECURRENCE_DAILY ||
      recurrenceType === RECURRENCE_WEEKLY ||
      recurrenceType === RECURRENCE_MONTHLY ||
      recurrenceType === RECURRENCE_YEARLY) {

      this.setState({
        interval: 1,
        freq: recurrenceType,
        recurrenceType,
        weekdays: new WeekDays(),
      });
    }
    else if (recurrenceType === RECURRENCE_WORKWEEK) {
      this.setState({
        interval: 1,
        freq: RECURRENCE_WEEKLY,
        recurrenceType,
        weekdays: new WeekDays({
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
        }),
      });
    }
    else if (recurrenceType === RECURRENCE_ONCE) {
      this.setState({
        freq: undefined,
        interval: undefined,
        recurrenceType,
      });
    }
    else {
      this.setState({
        recurrenceType,
      });
    }
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleSave({
    comment,
    endDate,
    endHour,
    endMinute,
    endOpen = false,
    id,
    name,
    interval,
    freq,
    startDate,
    startHour,
    startMinute,
    timezone,
    weekdays,
  }) {
    const {onSave} = this.props;

    if (!is_defined(onSave)) {
      return Promise.resolve();
    }

    startDate = date(startDate)
      .tz(timezone)
      .seconds(0)
      .hours(startHour)
      .minutes(startMinute);

    if (!endOpen) {
      endDate = date(endDate)
        .tz(timezone)
        .seconds(0)
        .hours(endHour)
        .minutes(endMinute);
    }

    const event = Event.fromData({
      duration: endOpen ? undefined : createDuration(endDate.diff(startDate)),
      description: comment,
      interval,
      freq,
      weekdays,
      summary: name,
      startDate,
    }, timezone);

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
      id,
      name = _('Unnamed'),
      timezone = 'UTC',
      title = _('New Schedule'),
      onClose,
    } = this.props;

    const {
      endDate,
      endHour,
      endMinute,
      endOpen,
      freq,
      interval,
      recurrenceType,
      startDate,
      startHour,
      startMinute,
      weekdays,
    } = this.state;

    const defaultValues = {
      comment,
      id,
      name,
      timezone,
    };

    const duration = endOpen ?
      undefined :
      createDuration(endDate.diff(startDate));

    const values = {
      endDate,
      endHour,
      endMinute,
      endOpen,
      freq,
      interval,
      recurrenceType,
      startDate,
      startHour,
      startMinute,
      weekdays,
    };

    return (
      <SaveDialog
        title={title}
        defaultValues={defaultValues}
        values={values}
        onClose={onClose}
        onSave={this.handleSave}
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
                onChange={this.handleValueChange}
              />
              <Divider>
                <Spinner
                  name="startHour"
                  type="int"
                  min="0"
                  max="23"
                  size="2"
                  value={state.startHour}
                  onChange={this.handleValueChange}
                /> h
                <Spinner
                  name="startMinute"
                  type="int"
                  min="0"
                  max="59"
                  size="2"
                  value={state.startMinute}
                  onChange={this.handleValueChange}
                /> m
              </Divider>
            </FormGroup>

            <FormGroup title={_('End')}>
              <DatePicker
                disabled={state.endOpen}
                name="endDate"
                value={state.endDate}
                onChange={this.handleValueChange}
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
                  onChange={this.handleValueChange}
                /> h
                <Spinner
                  disabled={state.endOpen}
                  name="endMinute"
                  type="int"
                  min="0"
                  max="59"
                  size="2"
                  value={state.endMinute}
                  onChange={this.handleValueChange}
                /> m
                <CheckBox
                  title={_('Open End')}
                  name="endOpen"
                  checked={state.endOpen}
                  onChange={this.handleValueChange}
                />
              </Divider>
            </FormGroup>

            <FormGroup title={_('Duration')}>
              <span>
                {renderDuration(duration)}
              </span>
            </FormGroup>

            <FormGroup title={_('Recurrence')}>
              <Select
                name="recurrenceType"
                items={RECURRENCE_TYPE_ITEMS}
                value={state.recurrenceType}
                onChange={this.handleRecurrenceTypeChange}
              />
            </FormGroup>

            {state.recurrenceType === RECURRENCE_CUSTOM &&
              <React.Fragment>
                <FormGroup title={_('Repeat')}>
                  <Divider>
                    <span>{_('Every')}</span>
                    <Spinner
                      name="interval"
                      type="int"
                      min="1"
                      size="3"
                      value={state.interval}
                      onChange={this.handleValueChange}
                    />
                    <TimeUnitSelect
                      name="freq"
                      value={state.freq}
                      onChange={this.handleValueChange}
                    />
                  </Divider>
                </FormGroup>

                {state.freq === RECURRENCE_WEEKLY &&
                  <FormGroup title={_('Repeat at')}>
                    <WeekDaySelect
                      name="weekdays"
                      value={weekdays}
                      onChange={this.handleValueChange}
                    />
                  </FormGroup>
                }
              </React.Fragment>
            }
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
  freq: PropTypes.oneOf([
    ReccurenceFrequency.HOURLY,
    ReccurenceFrequency.DAILY,
    ReccurenceFrequency.WEEKLY,
    ReccurenceFrequency.MONTHLY,
    ReccurenceFrequency.YEARLY,
  ]),
  id: PropTypes.string,
  interval: PropTypes.number,
  name: PropTypes.string,
  startDate: PropTypes.date,
  timezone: PropTypes.string,
  title: PropTypes.string,
  weekdays: WeekDaysPropType,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ScheduleDialog;

// vim: set ts=2 sw=2 tw=80:
