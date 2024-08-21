/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
