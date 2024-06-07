/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_l} from 'gmp/locale/lang';

import PropTyes from 'web/utils/proptypes';

import Select from 'web/components/form/select';

const DAY_SELECT_ITEMS = [
  {
    label: _l('Monday'),
    value: 'monday',
  },
  {
    label: _l('Tuesday'),
    value: 'tuesday',
  },
  {
    label: _l('Wednesday'),
    value: 'wednesday',
  },
  {
    label: _l('Thursday'),
    value: 'thursday',
  },
  {
    label: _l('Friday'),
    value: 'friday',
  },
  {
    label: _l('Saturday'),
    value: 'saturday',
  },
  {
    label: _l('Sunday'),
    value: 'sunday',
  },
];

const DaySelect = ({value, ...props}) => (
  <Select {...props} value={value} items={DAY_SELECT_ITEMS} />
);

DaySelect.propTypes = {
  value: PropTyes.oneOf([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
};

export default DaySelect;

// vim: set ts=2 sw=2 tw=80:
