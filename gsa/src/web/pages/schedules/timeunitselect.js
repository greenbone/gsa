/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
