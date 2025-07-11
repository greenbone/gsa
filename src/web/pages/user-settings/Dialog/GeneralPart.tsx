/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  SYSTEM_DEFAULT,
  DATE_TIME_CATEGORY,
  DATE_TIME_FORMAT_OPTIONS,
  type DateTimeCategory as DateTimeCategoryType,
  type DateTimeFormatOptions,
  type DateTimeKey,
} from 'gmp/locale/date';
import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isEmpty} from 'gmp/utils/string';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import PasswordField from 'web/components/form/PasswordField';
import Select, {SelectItem} from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import TimeZoneSelect from 'web/components/form/TimeZoneSelect';
import useTranslation from 'web/hooks/useTranslation';
import UserSettingsPasswordNotification from 'web/pages/user-settings/UserSettingsPasswordNotification';
import Languages from 'web/utils/Languages';

export const renderLanguageItems = (): SelectItem[] =>
  Object.entries(Languages).map(([code, language]) => {
    const {name, native_name: nativeName} = language;
    return {
      value: code,
      label: !isEmpty(nativeName) ? `${name} | ${nativeName}` : `${name}`,
    };
  });

export const getSelectItems = (
  category: DateTimeCategoryType,
  _: (key: string) => string,
): SelectItem[] => {
  if (category === DATE_TIME_CATEGORY.TIME) {
    return [
      {
        value: DATE_TIME_FORMAT_OPTIONS.TIME_12,
        label: _('12h'),
      },
      {
        value: DATE_TIME_FORMAT_OPTIONS.TIME_24,
        label: _('24h'),
      },
    ];
  }
  if (category === DATE_TIME_CATEGORY.LONG_DATE) {
    return [
      {
        value: DATE_TIME_FORMAT_OPTIONS.WMDY,
        label: _('Weekday, Month, Day, Year'),
      },
      {
        value: DATE_TIME_FORMAT_OPTIONS.WDMY,
        label: _('Weekday, Day, Month, Year'),
      },
    ];
  }
  return [];
};

interface GeneralPartProps {
  timezone: string;
  userInterfaceDateFormat: DateTimeKey;
  userInterfaceTimeFormat: DateTimeKey;
  isUserInterfaceTimeDateDefault: number;
  oldPassword: string;
  newPassword: string;
  confPassword: string;
  userInterfaceLanguage: string;
  rowsPerPage: number;
  detailsExportFileName: string;
  listExportFileName: string;
  reportExportFileName: string;
  autoCacheRebuild: number;
  shouldWarn: boolean;
  errors: Record<string, string>;
  onChange: (value: string | number, name?: string) => void;
}

const GeneralPart = ({
  timezone,
  userInterfaceDateFormat,
  userInterfaceTimeFormat,
  isUserInterfaceTimeDateDefault,
  oldPassword,
  newPassword,
  confPassword,
  userInterfaceLanguage,
  rowsPerPage,
  detailsExportFileName,
  listExportFileName,
  reportExportFileName,
  autoCacheRebuild,
  shouldWarn,
  errors,
  onChange,
}: GeneralPartProps) => {
  const [_] = useTranslation();
  const [prevUserInterfaceTimeFormat, setPrevUserInterfaceTimeFormat] =
    useState<DateTimeKey | undefined>(undefined);
  const [prevUserInterfaceDateFormat, setPrevUserInterfaceDateFormat] =
    useState<DateTimeKey | undefined>(undefined);

  const handleSysDefaultChange = event => {
    const isSystemDefault = parseYesNo(event);

    const defaultTimeFormat: DateTimeFormatOptions =
      DATE_TIME_FORMAT_OPTIONS.TIME_24;
    const defaultDateFormat: DateTimeFormatOptions =
      DATE_TIME_FORMAT_OPTIONS.WMDY;

    const currentUserInterfaceTimeFormat =
      userInterfaceTimeFormat ?? defaultTimeFormat;
    const currentUserInterfaceDateFormat =
      userInterfaceDateFormat ?? defaultDateFormat;

    if (!isSystemDefault) {
      onChange(
        prevUserInterfaceTimeFormat ?? defaultTimeFormat,
        'userInterfaceTimeFormat',
      );
      onChange(
        prevUserInterfaceDateFormat ?? defaultDateFormat,
        'userInterfaceDateFormat',
      );
    } else {
      setPrevUserInterfaceTimeFormat(currentUserInterfaceTimeFormat);
      setPrevUserInterfaceDateFormat(currentUserInterfaceDateFormat);

      onChange(SYSTEM_DEFAULT, 'userInterfaceTimeFormat');
      onChange(SYSTEM_DEFAULT, 'userInterfaceDateFormat');
    }

    onChange(isSystemDefault, 'isUserInterfaceTimeDateDefault');
  };

  return (
    <>
      <FormGroup title={_('Timezone')}>
        <TimeZoneSelect name="timezone" value={timezone} onChange={onChange} />
      </FormGroup>

      <Checkbox
        checked={parseYesNo(isUserInterfaceTimeDateDefault) === YES_VALUE}
        checkedValue={YES_VALUE}
        name="isUserInterfaceTimeDateDefault"
        title={_('Use System Default for Time and Date Format')}
        unCheckedValue={NO_VALUE}
        onChange={handleSysDefaultChange}
      />

      <Select
        disabled={parseYesNo(isUserInterfaceTimeDateDefault) === YES_VALUE}
        items={getSelectItems(DATE_TIME_CATEGORY.TIME, _)}
        label={_('Time Format')}
        name="userInterfaceTimeFormat"
        value={userInterfaceTimeFormat}
        onChange={onChange}
      />
      <Select
        disabled={parseYesNo(isUserInterfaceTimeDateDefault) === YES_VALUE}
        items={getSelectItems(DATE_TIME_CATEGORY.LONG_DATE, _)}
        label={_('Date Format')}
        name="userInterfaceDateFormat"
        value={userInterfaceDateFormat}
        onChange={onChange}
      />
      <FormGroup title={_('Change Password')}>
        <PasswordField
          autoComplete="off"
          grow="1"
          name="oldPassword"
          title={_('Old')}
          value={oldPassword}
          onChange={onChange}
        />
        <PasswordField
          autoComplete="off"
          grow="1"
          name="newPassword"
          title={_('New')}
          value={newPassword}
          onChange={onChange}
        />
        <PasswordField
          autoComplete="off"
          name="confPassword"
          title={_('Confirm')}
          value={confPassword}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title=" ">
        <UserSettingsPasswordNotification
          confPassword={confPassword}
          newPassword={newPassword}
          oldPassword={oldPassword}
        />
      </FormGroup>
      <FormGroup title={_('User Interface Language')}>
        <Select
          items={renderLanguageItems()}
          name="userInterfaceLanguage"
          value={userInterfaceLanguage}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Rows Per Page')}>
        <TextField
          name="rowsPerPage"
          value={rowsPerPage}
          onChange={onChange}
          {...(shouldWarn && !!errors.rowsPerPage
            ? {className: 'has-error'}
            : {})}
        />
      </FormGroup>
      <FormGroup title={_('Details Export File Name')}>
        <TextField
          name="detailsExportFileName"
          value={detailsExportFileName}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('List Export File Name')}>
        <TextField
          name="listExportFileName"
          value={listExportFileName}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Report Export File Name')}>
        <TextField
          name="reportExportFileName"
          value={reportExportFileName}
          onChange={onChange}
        />
      </FormGroup>
      <Checkbox
        checked={parseYesNo(autoCacheRebuild) === YES_VALUE}
        checkedValue={YES_VALUE}
        name="autoCacheRebuild"
        title={_('Auto Cache Rebuild')}
        unCheckedValue={NO_VALUE}
        onChange={onChange}
      />
    </>
  );
};

export default GeneralPart;
