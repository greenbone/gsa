/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {map} from 'gmp/utils/array';

import timezones from 'gmp/timezones';

import PropTypes from 'web/utils/proptypes';

import Select from './select';

const TimeZoneSelectComponent = ({value = 'UTC', ...props}) => {
  const timezoneItems = [
    {
      label: _('Coordinated Universal Time/UTC'),
      value: 'UTC',
    },
    ...map(timezones, ({name}) => ({
      label: name,
      value: name,
    })),
  ];

  return (
    <Select
      {...props}
      items={timezoneItems}
      menuPosition="adjust"
      value={value}
      width="230px"
    />
  );
};

TimeZoneSelectComponent.propTypes = {
  value: PropTypes.string,
};

export default TimeZoneSelectComponent;

// vim: set ts=2 sw=2 tw=80:
