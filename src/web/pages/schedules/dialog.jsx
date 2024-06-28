/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';

import {isDefined} from 'gmp/utils/identity';

import date, {duration as createDuration} from 'gmp/models/date';
import Event, {ReccurenceFrequency, WeekDays} from 'gmp/models/event';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import Button from 'web/components/form/button';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import DatePicker from 'web/components/form/DatePicker';
import {TimePicker} from '@greenbone/opensight-ui-components';

import TimeZoneSelect from 'web/components/form/timezoneselect';
import CheckBox from 'web/components/form/checkbox';
import Radio from 'web/components/form/radio';

import Row from 'web/components/layout/row';

import useTranslation from 'web/hooks/useTranslation';

import {renderDuration} from './render';
import TimeUnitSelect from './timeunitselect';
import WeekDaySelect, {WeekDaysPropType} from './weekdayselect';
import DaySelect from './dayselect';
import MonthDaysSelect from './monthdaysselect';

const RECURRENCE_ONCE = 'once';
const RECURRENCE_HOURLY = ReccurenceFrequency.HOURLY;
const RECURRENCE_DAILY = ReccurenceFrequency.DAILY;
const RECURRENCE_WEEKLY = ReccurenceFrequency.WEEKLY;
const RECURRENCE_MONTHLY = ReccurenceFrequency.MONTHLY;
const RECURRENCE_YEARLY = ReccurenceFrequency.YEARLY;
const RECURRENCE_WORKWEEK = 'workweek';
const RECURRENCE_CUSTOM = 'custom';

const RepeatMonthly = {
  nth: 'nth',
  days: 'days',
};

const getNthWeekday = cdate => Math.ceil(cdate.date() / 7);

const ScheduleDialog = ({
  duration,
  timezone: initialTimezone = 'UTC',
  startDate: initialStartDate = date()
    .tz(initialTimezone)
    .startOf('hour')
    .add(1, 'hour'),
  freq: initialFrequency,
  interval: initialInterval = 1,
  weekdays: initialWeekdays,
  monthdays: initialMonthDays,
  comment = '',
  id,
  name,
  title,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();

  const [startDate, setStartDate] = useState(initialStartDate);

  const [startTime, setStartTime] = useState(
    `${startDate.hours().toString().padStart(2, '0')}:${startDate.minutes().toString().padStart(2, '0')}`,
  );

  const [endOpen, setEndOpen] = useState(!isDefined(duration));
  const [endDate, setEndDate] = useState(
    isDefined(duration)
      ? initialStartDate.clone().add(duration)
      : initialStartDate.clone().add(1, 'hour'),
  );

  const [endTime, setEndTime] = useState(
    `${endDate.hours().toString().padStart(2, '0')}:${endDate.minutes().toString().padStart(2, '0')}`,
  );

  const [timezone, setTimezone] = useState(initialTimezone);

  const [freq, setFreq] = useState(
    isDefined(initialFrequency) ? initialFrequency : ReccurenceFrequency.WEEKLY,
  );
  const [recurrenceType, setRecurrenceType] = useState(() => {
    if (isDefined(initialFrequency)) {
      if (
        !isDefined(initialWeekdays) &&
        !isDefined(initialMonthDays) &&
        initialInterval === 1
      ) {
        return initialFrequency;
      }
      return RECURRENCE_CUSTOM;
    }
    return RECURRENCE_ONCE;
  });
  const [interval, setInterval] = useState(initialInterval);
  const [monthly, setMonthly] = useState(
    initialFrequency === ReccurenceFrequency.MONTHLY &&
      !isDefined(initialWeekdays)
      ? RepeatMonthly.days
      : RepeatMonthly.nth,
  );
  const [weekdays, setWeekdays] = useState(() => {
    if (isDefined(initialWeekdays)) {
      return initialWeekdays;
    }
    return new WeekDays().setWeekDayFromDate(initialStartDate);
  });
  const [monthlyNth, setMonthlyNth] = useState(() => {
    const currentWeekdays = isDefined(initialWeekdays)
      ? initialWeekdays
      : new WeekDays().setWeekDayFromDate(initialStartDate);
    const currentMonthlyDay = currentWeekdays.getSelectedWeekDay();
    const currentMonthlyNth = currentWeekdays.get(currentMonthlyDay);
    return currentMonthlyNth === true
      ? '' + getNthWeekday(initialStartDate)
      : currentMonthlyDay;
  });
  const [monthdays, setMonthdays] = useState(
    isDefined(initialMonthDays) ? initialMonthDays : [initialStartDate.date()],
  );
  const [monthlyDay, setMonthlyDay] = useState(() => {
    const currentWeekdays = isDefined(initialWeekdays)
      ? initialWeekdays
      : new WeekDays().setWeekDayFromDate(initialStartDate);
    return currentWeekdays.getSelectedWeekDay();
  });

  name = name || _('Unnamed');
  title = title || _('New Schedule');

  const RECURRENCE_TYPE_ITEMS = [
    {
      label: _('Once'),
      value: RECURRENCE_ONCE,
    },
    {
      label: _('Hourly'),
      value: RECURRENCE_HOURLY,
    },
    {
      label: _('Daily'),
      value: RECURRENCE_DAILY,
    },
    {
      label: _('Weekly'),
      value: RECURRENCE_WEEKLY,
    },
    {
      label: _('Monthly'),
      value: RECURRENCE_MONTHLY,
    },
    {
      label: _('Yearly'),
      value: RECURRENCE_YEARLY,
    },
    {
      label: _('Workweek (Monday till Friday)'),
      value: RECURRENCE_WORKWEEK,
    },
    {
      label: _('Custom...'),
      value: RECURRENCE_CUSTOM,
    },
  ];

  const NTH_DAY_ITEMS = [
    {
      label: _('The First'),
      value: '1',
    },
    {
      label: _('The Second'),
      value: '2',
    },
    {
      label: _('The Third'),
      value: '3',
    },
    {
      label: _('The Fourth'),
      value: '4',
    },
    {
      label: _('The Last'),
      value: '-1',
    },
  ];

  duration = endOpen
    ? undefined
    : isDefined(endDate) && createDuration(endDate.diff(startDate));

  const handleNowButtonClick = () => {
    setStartDate(date().tz(timezone));
  };

  const handleTimezoneChange = value => {
    setEndDate(endDate => endDate.tz(value));
    setStartDate(startDate => startDate.tz(value));
    setTimezone(value);
  };

  const handleTimeChange = (selectedTime, type) => {
    const [hour, minute] = selectedTime.split(':').map(Number);

    if (type === 'startTime') {
      const newStartDate = startDate.clone().hours(hour).minutes(minute);
      setStartDate(newStartDate);
      setStartTime(selectedTime);
    } else if (type === 'endTime') {
      const newEndDate = endDate.clone().hours(hour).minutes(minute);
      setEndDate(newEndDate);
      setEndTime(selectedTime);
    }
  };

  const handleSave = ({
    comment,
    endDate,
    endOpen = false,
    freq,
    id,
    interval,
    monthdays,
    monthly,
    monthlyDay,
    monthlyNth,
    name,
    recurrenceType,
    startDate,
    timezone,
    weekdays,
  }) => {
    if (!isDefined(onSave)) {
      return Promise.resolve();
    }

    startDate = date(startDate).seconds(0);

    if (!endOpen) {
      endDate = date(endDate).seconds(0);

      if (endDate.isSameOrBefore(startDate)) {
        return Promise.reject(
          new Error(
            _(
              'End date is same or before start date. Please adjust you start ' +
                'and/or end date.',
            ),
          ),
        );
      }
    }

    if (recurrenceType === RECURRENCE_WORKWEEK) {
      weekdays = new WeekDays({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      });
      freq = ReccurenceFrequency.WEEKLY;
    } else if (
      recurrenceType === RECURRENCE_CUSTOM &&
      freq === ReccurenceFrequency.MONTHLY &&
      monthly === RepeatMonthly.nth
    ) {
      weekdays = new WeekDays({
        [monthlyDay]: monthlyNth,
      });
    } else if (recurrenceType !== RECURRENCE_CUSTOM) {
      freq = recurrenceType;
    }

    const weekdaysSet =
      recurrenceType === RECURRENCE_WORKWEEK ||
      (recurrenceType === RECURRENCE_CUSTOM &&
        freq === ReccurenceFrequency.WEEKLY) ||
      (recurrenceType === RECURRENCE_CUSTOM &&
        freq === ReccurenceFrequency.MONTHLY &&
        monthly === RepeatMonthly.nth);

    const monthDaysSet =
      recurrenceType === RECURRENCE_CUSTOM &&
      freq === ReccurenceFrequency.MONTHLY &&
      monthly === RepeatMonthly.days;

    const isPreDefined =
      recurrenceType === RECURRENCE_HOURLY ||
      recurrenceType === RECURRENCE_DAILY ||
      recurrenceType === RECURRENCE_WEEKLY ||
      recurrenceType === RECURRENCE_MONTHLY ||
      recurrenceType === RECURRENCE_YEARLY ||
      recurrenceType === RECURRENCE_WORKWEEK;

    const event = Event.fromData(
      {
        duration: endOpen ? undefined : createDuration(endDate.diff(startDate)),
        description: comment,
        freq: recurrenceType === RECURRENCE_ONCE ? undefined : freq,
        interval: isPreDefined ? 1 : interval,
        monthdays: monthDaysSet ? monthdays : undefined,
        weekdays: weekdaysSet ? weekdays : undefined,
        // convert name to string explicitly to not run into:
        // `TypeError: e.replace is not a function`
        // when name is just numbers.
        summary: `${name}`,
        startDate,
      },
      timezone,
    );

    return onSave({
      id,
      name,
      comment,
      icalendar: event.toIcalString(),
      timezone,
    });
  };

  const defaultValues = {
    comment,
    id,
    name,
  };

  const values = {
    endDate,
    endOpen,
    freq,
    interval,
    monthdays,
    monthly,
    monthlyDay,
    monthlyNth,
    recurrenceType,
    startDate,
    timezone,
    weekdays,
  };

  return (
    <SaveDialog
      title={title}
      defaultValues={defaultValues}
      values={values}
      onClose={onClose}
      onSave={handleSave}
    >
      {({values: state, onValueChange}) => (
        <>
          <FormGroup title={_('Name')}>
            <TextField
              name="name"
              value={state.name}
              onChange={onValueChange}
            />
          </FormGroup>

          <FormGroup title={_('Comment')}>
            <TextField
              name="comment"
              value={state.comment}
              onChange={onValueChange}
            />
          </FormGroup>
          <DatePicker
            timezone={timezone}
            name="startDate"
            value={startDate}
            onChange={setStartDate}
            label={_('Start Date')}
          />
          <TimePicker
            label={_('Start Time')}
            name="startDate"
            value={startTime}
            onChange={newStartTime =>
              handleTimeChange(newStartTime, 'startTime')
            }
          />

          <FormGroup title={_('Timezone')}>
            <TimeZoneSelect
              name="timezone"
              value={timezone}
              onChange={handleTimezoneChange}
            />
          </FormGroup>

          <Button title={_('Now')} onClick={handleNowButtonClick} />

          <FormGroup title={_('Run Until')}>
            <CheckBox
              title={_('Open End')}
              name="endOpen"
              checked={state.endOpen}
              onChange={setEndOpen}
            />

            <DatePicker
              disabled={state.endOpen}
              name="endDate"
              value={state.endDate}
              onChange={setEndDate}
              label={_('End Date')}
            />

            <TimePicker
              disabled={state.endOpen}
              label={_('End Time')}
              name="endTime"
              value={endTime}
              onChange={newEndTime => handleTimeChange(newEndTime, 'endTime')}
            />
          </FormGroup>

          <FormGroup title={_('Duration')}>
            <span>{renderDuration(duration)}</span>
          </FormGroup>

          <FormGroup title={_('Recurrence')}>
            <Select
              name="recurrenceType"
              items={RECURRENCE_TYPE_ITEMS}
              value={state.recurrenceType}
              onChange={setRecurrenceType}
            />
          </FormGroup>

          {state.recurrenceType === RECURRENCE_CUSTOM && (
            <>
              <FormGroup title={_('Repeat')} direction="row">
                <span>{_('Every')}</span>
                <Spinner
                  name="interval"
                  type="int"
                  min="1"
                  value={state.interval}
                  onChange={setInterval}
                />
                <TimeUnitSelect
                  name="freq"
                  value={state.freq}
                  onChange={setFreq}
                />
              </FormGroup>

              {state.freq === RECURRENCE_WEEKLY && (
                <FormGroup title={_('Repeat at')}>
                  <WeekDaySelect
                    name="weekdays"
                    value={weekdays}
                    onChange={setWeekdays}
                  />
                </FormGroup>
              )}

              {state.freq === RECURRENCE_MONTHLY && (
                <FormGroup title={_('Repeat at')}>
                  <Row>
                    <Radio
                      name="monthly"
                      checked={state.monthly === RepeatMonthly.nth}
                      value={RepeatMonthly.nth}
                      onChange={setMonthly}
                    />
                    <Select
                      items={NTH_DAY_ITEMS}
                      disabled={state.monthly !== RepeatMonthly.nth}
                      name="monthlyNth"
                      value={state.monthlyNth}
                      onChange={setMonthlyNth}
                    />
                    <DaySelect
                      name="monthlyDay"
                      disabled={state.monthly !== RepeatMonthly.nth}
                      value={state.monthlyDay}
                      onChange={setMonthlyDay}
                    />
                  </Row>
                  <Row>
                    <Radio
                      title={_('Recur on day(s)')}
                      name="monthly"
                      checked={state.monthly === RepeatMonthly.days}
                      value={RepeatMonthly.days}
                      onChange={setMonthly}
                    />
                    <MonthDaysSelect
                      name="monthdays"
                      disabled={state.monthly !== RepeatMonthly.days}
                      value={state.monthdays}
                      onChange={setMonthdays}
                    />
                  </Row>
                </FormGroup>
              )}
            </>
          )}
        </>
      )}
    </SaveDialog>
  );
};

ScheduleDialog.propTypes = {
  comment: PropTypes.string,
  date: PropTypes.date,
  duration: PropTypes.duration,
  freq: PropTypes.oneOf([
    ReccurenceFrequency.HOURLY,
    ReccurenceFrequency.DAILY,
    ReccurenceFrequency.WEEKLY,
    ReccurenceFrequency.MONTHLY,
    ReccurenceFrequency.YEARLY,
  ]),
  id: PropTypes.string,
  interval: PropTypes.number,
  monthdays: PropTypes.arrayOf(PropTypes.number),
  name: PropTypes.string,
  startDate: PropTypes.date,
  timezone: PropTypes.string,
  title: PropTypes.string,
  weekdays: WeekDaysPropType,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ScheduleDialog;
