/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {RecurrenceFrequency} from 'gmp/models/event';
import Select, {type SelectProps} from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';

type RecurrenceFrequencyValue =
  (typeof RecurrenceFrequency)[keyof typeof RecurrenceFrequency];

type TimeUnitSelectProps = Omit<SelectProps<RecurrenceFrequencyValue>, 'items'>;

const TimeUnitSelect = (props: TimeUnitSelectProps) => {
  const [_] = useTranslation();
  const TIME_UNIT_ITEMS = [
    {value: RecurrenceFrequency.HOURLY, label: _('hour(s)')},
    {value: RecurrenceFrequency.DAILY, label: _('day(s)')},
    {value: RecurrenceFrequency.WEEKLY, label: _('week(s)')},
    {value: RecurrenceFrequency.MONTHLY, label: _('month(s)')},
    {value: RecurrenceFrequency.YEARLY, label: _('year(s)')},
  ];

  return <Select {...props} items={TIME_UNIT_ITEMS} />;
};

export default TimeUnitSelect;
