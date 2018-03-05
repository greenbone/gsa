/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import moment from 'moment';

import {storiesOf} from '@storybook/react';

import ScheduleChart from 'web/components/chart/schedule';

const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = 60 * 60 * 24 * 7;
const TWO_DAYS = 60 * 60 * 24 * 2;
const SEVEN_HOURS = 60 * 60 * 7;

const data = [{
  label: 'Foo',
  start: moment().add(1, 'day'),
  duration: ONE_DAY,
}, {
  label: 'Bar',
  start: moment().add(2, 'day'),
  period: ONE_WEEK,
}, {
  label: 'Lorem',
  start: moment().add(4, 'hours'),
  period: TWO_DAYS,
  periods: 4,
  duration: ONE_DAY,
}, {
  label: 'Ipsum',
  start: moment().add(2, 'day').add(4, 'hours'),
  period: SEVEN_HOURS,
}, {
  label: 'Dolor',
  start: moment().add(3, 'day').add(4, 'hours'),
  period: ONE_WEEK,
  periods: 2,
}, {
  label: 'Sit',
  start: moment().add(1, 'day').add(4, 'hours'),
  period: 0,
  periods: 0,
  periodMonth: 2,
}];

storiesOf('Chart/Schedule', module)
  .add('default', () => {
    return (
      <ScheduleChart
        width={500}
        height={300}
        data={data}
      />
    );
  });

// vim: set ts=2 sw=2 tw=80:
