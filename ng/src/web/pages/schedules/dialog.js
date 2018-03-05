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

import _ from 'gmp/locale.js';

import {NO_VALUE} from 'gmp/parser';
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import Select from '../../components/form/select.js';
import Spinner from '../../components/form/spinner.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import DatePicker from '../../components/form/datepicker.js';
import TimeZoneSelect from '../../components/form/timezoneselect.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

const DEFAULTS = {
  comment: '',
  duration: NO_VALUE,
  duration_unit: 'hour',
  name: _('Unnamed'),
  period: NO_VALUE,
  period_unit: 'hour',
  timezone: 'UTC',
  title: _('New Schedule'),
};

const TimeUnitSelect = props => {
  const unitOptions = [
    {value: 'hour', label: _('hour(s)')},
    {value: 'day', label: _('day(s)')},
    {value: 'week', label: _('week(s)')},
    {value: 'month', label: _('month(s)')},
  ];
  return (
    <Select
      {...props}
      items={unitOptions}
    />
  );
};

const ScheduleDialog = ({
    date,
    duration,
    duration_unit,
    hour,
    minute,
    period,
    period_unit,
    schedule,
    timezone,
    title = _('New Schedule'),
    visible = true,
    onClose,
    onSave,
  }) => {

  const data = {
    ...DEFAULTS,
    ...schedule,
  };
  if (is_defined(date)) {
    data.date = date;
  };
  if (is_defined(duration)) {
    data.duration = duration;
  };
  if (is_defined(duration_unit)) {
    data.duration_unit = duration_unit;
  };
  if (is_defined(hour)) {
    data.hour = hour;
  };
  if (is_defined(minute)) {
    data.minute = minute;
  };
  if (is_defined(period)) {
    data.period = period;
  };
  if (is_defined(period_unit)) {
    data.period_unit = period_unit;
  };
  if (is_defined(timezone)) {
    data.timezone = timezone;
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      initialData={data}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">

            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
                maxLength="80"/>
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                maxLength="400"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('First Time')}>
              <DatePicker
                name="date"
                value={state.date}
                onChange={onValueChange}/>
              <Divider>
                <Spinner
                  name="hour"
                  type="int"
                  min="0"
                  max="23"
                  size="2"
                  value={state.hour}
                  onChange={onValueChange}/> h
                <Spinner
                  name="minute"
                  type="int"
                  min="0"
                  max="59"
                  size="2"
                  value={state.minute}
                  onChange={onValueChange}/> m
              </Divider>
            </FormGroup>

            <FormGroup title={_('Timezone')}>
              <TimeZoneSelect
                name="timezone"
                value={state.timezone}
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Period')}>
              <Divider>
                <Spinner
                  name="period"
                  type="int"
                  min="0"
                  size="3"
                  value={state.period}
                  onChange={onValueChange}/>
                <TimeUnitSelect
                  name="period_unit"
                  value={state.period_unit}
                  onChange={onValueChange}/>
              </Divider>
            </FormGroup>

            <FormGroup title={_('Duration')}>
              <Divider>
                <Spinner
                  name="duration"
                  type="int"
                  min="0"
                  size="3"
                  value={state.duration}
                  onChange={onValueChange}/>
                <TimeUnitSelect
                  name="duration_unit"
                  value={state.duration_unit}
                  onChange={onValueChange}/>
              </Divider>
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

ScheduleDialog.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

ScheduleDialog.propTypes = {
  comment: PropTypes.string,
  date: PropTypes.momentDate,
  duration: PropTypes.number,
  duration_unit: PropTypes.timeunit,
  hour: PropTypes.number,
  minute: PropTypes.number,
  name: PropTypes.string,
  period: PropTypes.number,
  period_unit: PropTypes.timeunit,
  schedule: PropTypes.model,
  timezone: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};


export default ScheduleDialog;

// vim: set ts=2 sw=2 tw=80:
