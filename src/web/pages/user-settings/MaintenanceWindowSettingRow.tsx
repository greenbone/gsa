/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {TimePicker} from '@greenbone/ui-lib';
import styled from 'styled-components';
import date, {duration as createDuration, type Date} from 'gmp/models/date';
import Event, {RecurrenceFrequency} from 'gmp/models/event';
import Checkbox from 'web/components/form/Checkbox';
import DatePicker from 'web/components/form/DatePicker';
import Select from 'web/components/form/Select';
import TimeZoneSelect from 'web/components/form/TimeZoneSelect';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import useUserTimezone from 'web/hooks/useUserTimezone';
import EditableSettingRow from 'web/pages/user-settings/EditableSettingRow';
import useSettingSave from 'web/pages/user-settings/useSettingSave';
import Theme from 'web/utils/Theme';

interface MaintenanceWindowSetting {
  id?: string;
  value?: string;
  comment?: string;
}

interface MaintenanceWindowSettingRowProps {
  disableEditIcon?: boolean;
  maintenanceWindow: MaintenanceWindowSetting;
}

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${Theme.lightGray};
  }
`;

const SectionLabel = styled.span`
  font-size: 0.75em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${Theme.mediumGray};
`;

const toTimeString = (d: {hour: () => number; minute: () => number}): string =>
  `${String(d.hour()).padStart(2, '0')}:${String(d.minute()).padStart(2, '0')}`;

const MaintenanceWindowSettingRow = ({
  disableEditIcon = false,
  maintenanceWindow,
}: MaintenanceWindowSettingRowProps) => {
  const [_] = useTranslation();
  const [userTimezone] = useUserTimezone();
  const {getErrorMessage, saveSetting, setErrorMessage, clearErrorMessage} =
    useSettingSave();

  const [editMode, setEditMode] = useState(false);
  const [timezone, setTimezone] = useState(userTimezone as string);
  const [startTime, setStartTime] = useState<string>('22:00');
  const [endTime, setEndTime] = useState<string>('06:00');
  const [freq, setFreq] = useState<
    keyof typeof RecurrenceFrequency | undefined
  >('DAILY');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [endOpen, setEndOpen] = useState(true);

  const applyIcal = (icalValue: string, tz: string): void => {
    const event = Event.fromIcal(icalValue, tz);
    const start = event.startDate;
    setStartDate(start.clone());
    setStartTime(toTimeString(start));
    if (event.durationInSeconds > 0) {
      const end = start.clone().add(event.duration);
      setEndTime(toTimeString(end));
      setEndDate(end.clone());
      setEndOpen(false);
    } else {
      setEndTime('06:00');
      setEndDate(undefined);
      setEndOpen(true);
    }
    setFreq(event.recurrence.freq);
  };

  const resetToDefaults = (): void => {
    setStartDate(undefined);
    setStartTime('22:00');
    setEndTime('06:00');
    setEndDate(undefined);
    setFreq('DAILY');
    setEndOpen(true);
  };

  useEffect(() => {
    const tz = userTimezone as string;
    setTimezone(tz);
    if (maintenanceWindow.value) {
      try {
        applyIcal(maintenanceWindow.value, tz);
      } catch {
        resetToDefaults();
      }
    } else {
      resetToDefaults();
    }
  }, [maintenanceWindow.value, userTimezone]);

  const buildIcal = (): string => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const now = startDate
      ? startDate.clone().tz(timezone, true)
      : date().tz(timezone, true);
    const builtStart = now
      .clone()
      .hour(startHour)
      .minute(startMin)
      .second(0)
      .millisecond(0);

    let duration;
    if (!endOpen) {
      const [endHour, endMin] = endTime.split(':').map(Number);
      const endBase = endDate
        ? endDate.clone().tz(timezone, true)
        : builtStart.clone();
      let builtEnd = endBase
        .hour(endHour)
        .minute(endMin)
        .second(0)
        .millisecond(0);
      if (builtEnd.isSameOrBefore(builtStart)) {
        builtEnd = builtEnd.add(1, 'day');
      }
      duration = createDuration(builtEnd.diff(builtStart));
    }

    const event = Event.fromData(
      {
        startDate: builtStart,
        duration,
        freq,
        interval: 1,
        summary: 'Maintenance Window',
      },
      timezone,
    );

    return event.toIcalString();
  };

  const handleClear = async (): Promise<void> => {
    if (!maintenanceWindow?.id) {
      setErrorMessage(
        'maintenanceWindow',
        _('Cannot clear maintenance window: missing setting ID.'),
      );
      return;
    }
    await saveSetting(maintenanceWindow.id, 'maintenanceWindow', '', () =>
      setEditMode(false),
    );
  };

  const handleSave = async (): Promise<void> => {
    if (!maintenanceWindow?.id) {
      setErrorMessage(
        'maintenanceWindow',
        _('Cannot save maintenance window: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      maintenanceWindow.id,
      'maintenanceWindow',
      buildIcal(),
      setEditMode,
    );
  };

  const handleCancel = (): void => {
    const tz = userTimezone as string;
    if (maintenanceWindow.value) {
      try {
        applyIcal(maintenanceWindow.value, tz);
      } catch {
        resetToDefaults();
      }
    } else {
      resetToDefaults();
    }
    setTimezone(tz);
    setEditMode(false);
    clearErrorMessage('maintenanceWindow');
  };

  const handleEndOpenChange = (value: boolean): void => {
    setEndOpen(value);
    if (!value && !endDate) {
      const [endHour, endMin] = endTime.split(':').map(Number);
      const base = startDate ? startDate.clone() : date().tz(timezone, true);
      setEndDate(base.hour(endHour).minute(endMin).second(0).millisecond(0));
    }
  };

  const handleEndTimeChange = (value: string): void => {
    setEndTime(value);
    if (endDate) {
      const [hour, min] = value.split(':').map(Number);
      setEndDate(
        endDate.clone().hour(hour).minute(min).second(0).millisecond(0),
      );
    }
  };

  const handleEndDateChange = (value: Date, _name: string): void => {
    if (value) {
      const [hour, min] = endTime.split(':').map(Number);
      setEndDate(value.clone().hour(hour).minute(min).second(0).millisecond(0));
    }
  };

  const handleFrequencyChange = (value: string): void => {
    if (value === 'NONE') {
      setFreq(undefined);
      return;
    }
    setFreq(value as keyof typeof RecurrenceFrequency);
  };

  const handleTimezoneChange = (value: string): void => {
    if (startDate) {
      const converted = startDate.clone().tz(value, true);
      setStartDate(converted);
      setStartTime(toTimeString(converted));
    }
    if (endDate) {
      const converted = endDate.clone().tz(value, true);
      setEndDate(converted);
      setEndTime(toTimeString(converted));
    }
    setTimezone(value);
  };

  const formatForView = (): string => {
    if (!maintenanceWindow.value) {
      return _('No');
    }
    try {
      const event = Event.fromIcal(
        maintenanceWindow.value,
        userTimezone as string,
      );
      const start = event.startDate;
      const startTimeStr = `${String(start.hour()).padStart(2, '0')}:${String(start.minute()).padStart(2, '0')}`;
      const recurrFreq = event.recurrence.freq;

      const endDisplay =
        event.durationInSeconds > 0
          ? toTimeString(start.clone().add(event.duration))
          : _('Open End');

      const today = date().tz(userTimezone as string, true);
      const datePrefix =
        start.date() !== today.date() ||
        start.month() !== today.month() ||
        start.year() !== today.year()
          ? `${start.year()}-${String(start.month() + 1).padStart(2, '0')}-${String(start.date()).padStart(2, '0')} `
          : '';

      if (recurrFreq) {
        return _('{{startDate}}{{start}} - {{end}} ({{freq}})', {
          startDate: datePrefix,
          start: startTimeStr,
          end: endDisplay,
          freq: recurrFreq.toLowerCase(),
        });
      }
      return _('{{startDate}}{{start}} - {{end}}', {
        startDate: datePrefix,
        start: startTimeStr,
        end: endDisplay,
      });
    } catch {
      return _('No');
    }
  };

  const editComponent = (
    <Column gap="0" style={{minWidth: 320}}>
      <Section>
        <Row align="center" gap="4px">
          <SectionLabel>{_('Start')}</SectionLabel>
        </Row>
        <Row align="flex-end" gap="12px" wrap="wrap">
          <DatePicker
            label={_('Date')}
            name="maintenanceWindowStartDate"
            value={startDate}
            onChange={(value: Date, _name: string) => setStartDate(value)}
          />
          <TimePicker
            label={_('Time')}
            name="maintenanceWindowStart"
            value={startTime}
            onChange={setStartTime}
          />
        </Row>
      </Section>

      <Section>
        <SectionLabel>{_('End')}</SectionLabel>
        <Checkbox
          checked={endOpen}
          name="maintenanceWindowEndOpen"
          title={_('Open End')}
          onChange={handleEndOpenChange}
        />
        <Row align="flex-end" gap="12px" wrap="wrap">
          <DatePicker
            disabled={endOpen}
            label={_('Date')}
            name="maintenanceWindowEndDate"
            value={endDate}
            onChange={handleEndDateChange}
          />
          <TimePicker
            disabled={endOpen}
            label={_('Time')}
            name="maintenanceWindowEnd"
            value={endTime}
            onChange={handleEndTimeChange}
          />
        </Row>
      </Section>

      <Section>
        <SectionLabel>{_('Timezone')}</SectionLabel>
        <TimeZoneSelect
          name="maintenanceWindowTimezone"
          value={timezone}
          onChange={handleTimezoneChange}
        />
      </Section>

      <Section>
        <SectionLabel>{_('Repeat')}</SectionLabel>
        <Select
          data-testid="repeat-select"
          items={[
            {label: _('Once'), value: 'NONE'},
            {label: _('Daily'), value: RecurrenceFrequency.DAILY},
            {label: _('Weekly'), value: RecurrenceFrequency.WEEKLY},
            {label: _('Monthly'), value: RecurrenceFrequency.MONTHLY},
          ]}
          name="maintenanceWindowFreq"
          value={freq ?? 'NONE'}
          onChange={handleFrequencyChange}
        />
      </Section>
    </Column>
  );

  return (
    <EditableSettingRow
      disableEditIcon={disableEditIcon}
      editComponent={editComponent}
      errorMessage={getErrorMessage('maintenanceWindow')}
      infoMessage={_(
        'During the maintenance window, scan scheduling is suspended to prevent scans from running.',
      )}
      isEditMode={editMode}
      label={_('Maintenance Window')}
      title={maintenanceWindow.comment}
      viewComponent={<span>{formatForView()}</span>}
      onCancel={handleCancel}
      onClear={handleClear}
      onEdit={() => setEditMode(!editMode)}
      onSave={handleSave}
    />
  );
};

export default MaintenanceWindowSettingRow;
