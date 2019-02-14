/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import {_l} from 'gmp/locale/lang';

import {ReccurenceFrequency} from 'gmp/models/event';

import Select from 'web/components/form/select';

const TIME_UNIT_ITEMS = [
  {value: ReccurenceFrequency.HOURLY, label: _l('hour(s)')},
  {value: ReccurenceFrequency.DAILY, label: _l('day(s)')},
  {value: ReccurenceFrequency.WEEKLY, label: _l('week(s)')},
  {value: ReccurenceFrequency.MONTHLY, label: _l('month(s)')},
  {value: ReccurenceFrequency.YEARLY, label: _l('year(s)')},
];

const TimeUnitSelect = props => <Select {...props} items={TIME_UNIT_ITEMS} />;

export default TimeUnitSelect;

// vim: set ts=2 sw=2 tw=80:
