/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import timezones, {DEFAULT_TIMEZONE} from 'gmp/timezones';
import {useMemo} from 'react';
import Select, {SelectProps} from 'web/components/form/Select';

interface TimeZoneSelectProps extends Omit<SelectProps, 'items' | 'value'> {
  value?: string;
}

const TimeZoneSelectComponent = ({
  value = DEFAULT_TIMEZONE,
  ...props
}: TimeZoneSelectProps) => {
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

export default TimeZoneSelectComponent;
