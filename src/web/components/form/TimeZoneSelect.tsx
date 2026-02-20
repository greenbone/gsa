/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo} from 'react';
import timezones, {DEFAULT_TIMEZONE} from 'gmp/time-zones';
import Select, {type SelectProps} from 'web/components/form/Select';
import {useGetTimezones} from 'web/hooks/use-query/timezones';

interface TimeZoneSelectProps extends Omit<
  SelectProps<string>,
  'items' | 'value'
> {
  value?: string;
}

const TimeZoneSelectComponent = ({
  value = DEFAULT_TIMEZONE,
  ...props
}: TimeZoneSelectProps) => {
  const {data: fetchedTimezones} = useGetTimezones();

  // Use fetched timezones if available, otherwise fall back to hardcoded list
  const timezoneList = fetchedTimezones ?? timezones;

  const timezoneItems = useMemo(
    () =>
      timezoneList.map(name => ({
        label: name,
        value: name,
      })),
    [timezoneList],
  );

  return <Select {...props} items={timezoneItems} value={value} />;
};

export default TimeZoneSelectComponent;
