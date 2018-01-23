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

import PropTypes from '../../utils/proptypes.js';

import withDialog from '../../components/dialog/withDialog.js';

import Select from '../../components/form/select.js';
import Spinner from '../../components/form/spinner.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import DatePicker from '../../components/form/datepicker.js';
import TimeZoneSelect from '../../components/form/timezoneselect.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

const TimeUnitSelect = props => {
  return (
    <Select {...props} defaultValue="hour">
      <option value="hour">{_('hour(s)')}</option>
      <option value="day">{_('day(s)')}</option>
      <option value="week">{_('week(s)')}</option>
      <option value="month">{_('month(s)')}</option>
    </Select>
  );
};

const ScheduleDialog = ({
    comment,
    date,
    duration,
    duration_unit,
    hour,
    minute,
    name,
    period,
    period_unit,
    timezone,
    onValueChange,
  }) => {
  return (
    <Layout flex="column">

      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          grow="1"
          value={name}
          size="30"
          onChange={onValueChange}
          maxLength="80"/>
      </FormGroup>

      <FormGroup title={_('Comment')}>
        <TextField
          name="comment"
          value={comment}
          grow="1"
          size="30" maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('First Time')}>
        <DatePicker
          name="date"
          value={date}
          onChange={onValueChange}/>
        <Divider>
          <Spinner
            name="hour"
            type="int"
            min="0"
            max="23"
            size="2"
            value={hour}
            onChange={onValueChange}/> h
          <Spinner
            name="minute"
            type="int"
            min="0"
            max="59"
            size="2"
            value={minute}
            onChange={onValueChange}/> m
        </Divider>
      </FormGroup>

      <FormGroup title={_('Timezone')}>
        <TimeZoneSelect
          name="timezone"
          value={timezone}
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Period')}>
        <Divider>
          <Spinner
            name="period"
            type="int"
            min="0"
            size="3"
            value={period}
            onChange={onValueChange}/>
          <TimeUnitSelect
            name="period_unit"
            value={period_unit}
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
            value={duration}
            onChange={onValueChange}/>
          <TimeUnitSelect
            name="duration_unit"
            value={duration_unit}
            onChange={onValueChange}/>
        </Divider>
      </FormGroup>
    </Layout>
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
  timezone: PropTypes.string,
  onValueChange: PropTypes.func,
};


export default withDialog({
  title: _('New Schedule'),
  footer: _('Save'),
  defaultState: {
    comment: '',
    duration: 0,
    duration_unit: 'hour',
    name: _('Unnamed'),
    period: 0,
    period_unit: 'hour',
    timezone: 'UTC',
  },
})(ScheduleDialog);

// vim: set ts=2 sw=2 tw=80:
