/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React, {useMemo} from 'react';

import {map} from 'gmp/utils/array';

import timezones from 'gmp/timezones';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

import Select from './select';

const TimeZoneSelectComponent = ({value = 'UTC', ...props}) => {
  const [_] = useTranslation();
  const timezoneItems = useMemo(
    () => [
      {
        label: _('Coordinated Universal Time/UTC'),
        value: 'UTC',
      },
      ...map(timezones, ({name}) => ({
        label: name,
        value: name,
      })),
    ],
    [_],
  );

  return <Select {...props} items={timezoneItems} value={value} />;
};

TimeZoneSelectComponent.propTypes = {
  value: PropTypes.string,
};

export default TimeZoneSelectComponent;

// vim: set ts=2 sw=2 tw=80:
