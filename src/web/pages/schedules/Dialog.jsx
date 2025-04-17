/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TimePicker} from '@greenbone/opensight-ui-components-mantinev7';
import date, {duration as createDuration} from 'gmp/models/date';
import Event, {ReccurenceFrequency, WeekDays} from 'gmp/models/event';
import {isDefined} from 'gmp/utils/identity';
import React, {useState} from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Button from 'web/components/form/Button';
import CheckBox from 'web/components/form/Checkbox';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextField from 'web/components/form/TextField';
import TimeZoneSelect from 'web/components/form/TimeZoneSelect';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import DaySelect from 'web/pages/schedules/DaySelect';
import MonthDaysSelect from 'web/pages/schedules/MonthDaysSelect';
import {renderDuration} from 'web/pages/schedules/Render';
import TimeUnitSelect from 'web/pages/schedules/TimeUnitSelect';
import WeekDaySelect, {
  WeekDaysPropType,
} from 'web/pages/schedules/WeekdaySelect';
import PropTypes from 'web/utils/PropTypes';
import {formatTimeForTimePicker} from 'web/utils/timePickerHelpers';

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
    formatTimeForTimePicker(startDate),
  );

  const [endOpen, setEndOpen] = useState(!isDefined(duration));
  const [endDate, setEndDate] = useState(
    isDefined(duration)
      ? initialStartDate.clone().add(duration)
      : initialStartDate.clone().add(1, 'hour'),
  );

  const [endTime, setEndTime] = useState(formatTimeForTimePicker(endDate));

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
    setStartTime(formatTimeForTimePicker(date().tz(timezone)));
  };

  const handleTimezoneChange = value => {
    setEndDate(endDate => endDate.tz(value));
    setStartDate(startDate => startDate.tz(value));
    setStartTime(formatTimeForTimePicker(startDate));
    setEndTime(formatTimeForTimePicker(endDate));
    setTimezone(value);
  };

  const handleTimeChange = (selectedTime, type) => {
    const [hour, minute] = selectedTime.split(':').map(Number);

    if (type === 'startTime') {
      const newStartDate = date(selectedTime, 'HH:mm');
      if (newStartDate.isValid && newStartDate.isValid()) {
        setStartDate(newStartDate);
        setStartTime(selectedTime);
      }
    } else if (type === 'endTime') {
      const newEndDate = date(selectedTime, 'HH:mm');
      if (newEndDate.isValid && newEndDate.isValid()) {
        setEndDate(newEndDate);
        setEndTime(selectedTime);
      }
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

    startDate = date(startDate).set('seconds', 0);

    if (!endOpen) {
      endDate = date(endDate).set('seconds', 0);

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
      defaultValues={defaultValues}
      title={title}
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

          <Row align={'end'} flex="row" gap={'lg'}>
            <DatePicker
              label={_('Start Date')}
              name="startDate"
              timezone={timezone}
              value={startDate}
              onChange={setStartDate}
            />
            <TimePicker
              label={_('Start Time')}
              name="startDate"
              value={startTime}
              onChange={newStartTime =>
                handleTimeChange(newStartTime, 'startTime')
              }
            />
            <Button title={_('Now')} onClick={handleNowButtonClick} />
          </Row>
          <FormGroup title={_('Timezone')}>
            <TimeZoneSelect
              name="timezone"
              value={timezone}
              onChange={handleTimezoneChange}
            />
          </FormGroup>
          <FormGroup title={_('Run Until')}>
            <CheckBox
              checked={state.endOpen}
              name="endOpen"
              title={_('Open End')}
              onChange={setEndOpen}
            />

            <DatePicker
              disabled={state.endOpen}
              label={_('End Date')}
              name="endDate"
              value={state.endDate}
              onChange={setEndDate}
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
              items={RECURRENCE_TYPE_ITEMS}
              name="recurrenceType"
              value={state.recurrenceType}
              onChange={setRecurrenceType}
            />
          </FormGroup>

          {state.recurrenceType === RECURRENCE_CUSTOM && (
            <>
              <FormGroup direction="row" title={_('Repeat')}>
                <span>{_('Every')}</span>
                <Spinner
                  min="1"
                  name="interval"
                  type="int"
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
                      checked={state.monthly === RepeatMonthly.nth}
                      name="monthly"
                      value={RepeatMonthly.nth}
                      onChange={setMonthly}
                    />
                    <Select
                      disabled={state.monthly !== RepeatMonthly.nth}
                      items={NTH_DAY_ITEMS}
                      name="monthlyNth"
                      value={state.monthlyNth}
                      onChange={setMonthlyNth}
                    />
                    <DaySelect
                      disabled={state.monthly !== RepeatMonthly.nth}
                      name="monthlyDay"
                      value={state.monthlyDay}
                      onChange={setMonthlyDay}
                    />
                  </Row>
                  <Row>
                    <Radio
                      checked={state.monthly === RepeatMonthly.days}
                      name="monthly"
                      title={_('Recur on day(s)')}
                      value={RepeatMonthly.days}
                      onChange={setMonthly}
                    />
                    <MonthDaysSelect
                      disabled={state.monthly !== RepeatMonthly.days}
                      name="monthdays"
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
