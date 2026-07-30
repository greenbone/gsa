/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import {Popover} from '@mantine/core';
import {DatePicker} from '@mantine/dates';
import date, {type Date} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import {CalendarIcon} from 'web/components/icon';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

interface DaysDatePickerProps {
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  name?: string;
  title?: string;
  value?: Date;
  onChange?: (value: Date, name?: string) => void;
}

/**
 * A calendar icon that unfolds a calendar.
 *
 * Sits next to a field that holds a number of days and exists so that the
 * number does not have to be worked out by hand: pick the day the override
 * should stop being active on and the caller turns that into the number of
 * days from today.
 */
const DaysDatePicker = ({
  disabled = false,
  maxDate = date().add(3, 'years'),
  minDate = date(),
  name,
  title,
  value = date(),
  onChange,
}: DaysDatePickerProps) => {
  const [_] = useTranslation();
  const [language] = useLanguage();
  const [opened, setOpened] = useState(false);

  const handleChange = useCallback(
    (newValue: string | Date | null) => {
      if (isDefined(onChange) && newValue !== null) {
        onChange(date(newValue), name);
      }
      setOpened(false);
    },
    [name, onChange],
  );

  return (
    <Popover
      withArrow
      opened={opened}
      position="bottom-end"
      shadow="md"
      /* No fade: the dropdown should be there as soon as it is opened, which
       * also keeps it testable without waiting for a transition. */
      transitionProps={{duration: 0}}
      onChange={setOpened}
    >
      {/* Popover.Target needs a child it can attach a ref to for positioning.
       * CalendarIcon is a plain function component, so it is wrapped. */}
      <Popover.Target>
        <span data-testid="days-datepicker-target">
          <CalendarIcon
            data-testid="days-datepicker-icon"
            disabled={disabled}
            title={title ?? _('Select an end date to fill in the days')}
            onClick={() => {
              if (!disabled) {
                setOpened(current => !current);
              }
            }}
          />
        </span>
      </Popover.Target>
      <Popover.Dropdown data-testid="days-datepicker-dropdown">
        <DatePicker
          locale={language}
          maxDate={isDefined(maxDate) ? maxDate.toDate() : undefined}
          minDate={isDefined(minDate) ? minDate.toDate() : undefined}
          value={value.toDate()}
          onChange={handleChange}
        />
      </Popover.Dropdown>
    </Popover>
  );
};

export default DaysDatePicker;
