/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import timezones from 'gmp/timezones';
import React, {useMemo} from 'react';
import Select from 'web/components/form/Select';
import PropTypes from 'web/utils/PropTypes';


const TimeZoneSelectComponent = ({value = 'UTC', ...props}) => {
  const timezoneItems = useMemo(
    () =>
      timezones.map(name => ({
        label: name,
        value: name,
      })),
    [],
  );

  return <Select {...props} items={timezoneItems} value={value} />;
};

TimeZoneSelectComponent.propTypes = {
  value: PropTypes.string,
};

export default TimeZoneSelectComponent;
