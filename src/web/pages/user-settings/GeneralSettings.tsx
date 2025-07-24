/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {
  DATE_TIME_CATEGORY,
  DATE_TIME_FORMAT_OPTIONS,
  SYSTEM_DEFAULT,
} from 'gmp/locale/date';
import {NO_VALUE, parseYesNo, YES_VALUE, YesNo} from 'gmp/parser';
import {isEmpty} from 'gmp/utils/string';

import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import PasswordField from 'web/components/form/PasswordField';
import Select, {SelectItem} from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import TimeZoneSelect from 'web/components/form/TimeZoneSelect';

import StripedTable from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useGmp from 'web/hooks/useGmp';
import useLanguage from 'web/hooks/useLanguage';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';

import useTranslation from 'web/hooks/useTranslation';
import EditableSettingRow from 'web/pages/user-settings/EditableSettingRow';

import {getLangNameByCode} from 'web/pages/user-settings/helperFunctions';
import UserSettingsPasswordNotification from 'web/pages/user-settings/UserSettingsPasswordNotification';
import useSettingSave from 'web/pages/user-settings/useSettingSave';
import {updateTimezone} from 'web/store/usersettings/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getTimezone} from 'web/store/usersettings/selectors';
import Languages from 'web/utils/Languages';

interface GeneralSettingsProps {
  disableEditIcon?: boolean;
}

export const renderLanguageItems = (): SelectItem[] =>
  Object.entries(Languages).map(([code, language]) => {
    const {name, native_name: nativeName} = language;
    return {
      value: code,
      label: !isEmpty(nativeName) ? `${name} | ${nativeName}` : `${name}`,
    };
  });

export const getSelectItems = (
  category: (typeof DATE_TIME_CATEGORY)[keyof typeof DATE_TIME_CATEGORY],
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

const GeneralSettings = ({disableEditIcon = false}: GeneralSettingsProps) => {
  const [_] = useTranslation();
  const [, setLanguage] = useLanguage();
  const gmp = useGmp();
  const dispatch = useDispatch();

  const {getErrorMessage, saveSetting, setErrorMessage, clearErrorMessage} =
    useSettingSave();

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);
  const storeTimezone = useShallowEqualSelector(getTimezone) ?? '';

  const userInterfaceTimeFormat = useMemo(
    () => userDefaultsSelector.getByName('userinterfacetimeformat') ?? {},
    [userDefaultsSelector],
  );
  const userInterfaceDateFormat = useMemo(
    () => userDefaultsSelector.getByName('userinterfacedateformat') ?? {},
    [userDefaultsSelector],
  );
  const userInterfaceLanguage = useMemo(
    () => userDefaultsSelector.getByName('userinterfacelanguage') ?? {},
    [userDefaultsSelector],
  );
  const rowsPerPage = useMemo(
    () => userDefaultsSelector.getByName('rowsperpage') ?? {},
    [userDefaultsSelector],
  );
  const detailsExportFileName = useMemo(
    () => userDefaultsSelector.getByName('detailsexportfilename') ?? {},
    [userDefaultsSelector],
  );
  const listExportFileName = useMemo(
    () => userDefaultsSelector.getByName('listexportfilename') ?? {},
    [userDefaultsSelector],
  );
  const reportExportFileName = useMemo(
    () => userDefaultsSelector.getByName('reportexportfilename') ?? {},
    [userDefaultsSelector],
  );

  const maxRowsPerPage = userDefaultsSelector.getByName('maxrowsperpage') ?? {};

  const autoCacheRebuild = useMemo(
    () => userDefaultsSelector.getByName('autocacherebuild') ?? {},
    [userDefaultsSelector],
  );

  const [timezoneEditMode, setTimezoneEditMode] = useState(false);
  const [dateTimeFormatEditMode, setDateTimeFormatEditMode] = useState(false);
  const [languageEditMode, setLanguageEditMode] = useState(false);
  const [rowsPerPageEditMode, setRowsPerPageEditMode] = useState(false);
  const [detailsExportFileNameEditMode, setDetailsExportFileNameEditMode] =
    useState(false);
  const [listExportFileNameEditMode, setListExportFileNameEditMode] =
    useState(false);
  const [reportExportFileNameEditMode, setReportExportFileNameEditMode] =
    useState(false);
  const [autoCacheRebuildEditMode, setAutoCacheRebuildEditMode] =
    useState(false);
  const [passwordEditMode, setPasswordEditMode] = useState(false);

  const [timezoneState, setTimezoneState] = useState(storeTimezone);
  const [timeFormatState, setTimeFormatState] = useState(
    userInterfaceTimeFormat.value,
  );
  const [dateFormatState, setDateFormatState] = useState(
    userInterfaceDateFormat.value,
  );
  const [
    isUserInterfaceTimeDateDefaultState,
    setIsUserInterfaceTimeDateDefaultState,
  ] = useState(
    userInterfaceTimeFormat.value === SYSTEM_DEFAULT &&
      userInterfaceDateFormat.value === SYSTEM_DEFAULT
      ? YES_VALUE
      : NO_VALUE,
  );
  const [languageState, setLanguageState] = useState(
    userInterfaceLanguage.value,
  );
  const [rowsPerPageState, setRowsPerPageState] = useState(rowsPerPage.value);
  const [detailsExportFileNameState, setDetailsExportFileNameState] = useState(
    detailsExportFileName.value,
  );

  const [listExportFileNameState, setListExportFileNameState] = useState(
    listExportFileName.value,
  );
  const [reportExportFileNameState, setReportExportFileNameState] = useState(
    reportExportFileName.value,
  );
  const [autoCacheRebuildState, setAutoCacheRebuildState] = useState(
    autoCacheRebuild.value,
  );
  const [oldPasswordState, setOldPasswordState] = useState('');
  const [newPasswordState, setNewPasswordState] = useState('');
  const [confPasswordState, setConfPasswordState] = useState('');

  useEffect(() => {
    setTimezoneState(storeTimezone);
    setTimeFormatState(userInterfaceTimeFormat.value);
    setDateFormatState(userInterfaceDateFormat.value);
    setIsUserInterfaceTimeDateDefaultState(
      userInterfaceTimeFormat.value === SYSTEM_DEFAULT &&
        userInterfaceDateFormat.value === SYSTEM_DEFAULT
        ? YES_VALUE
        : NO_VALUE,
    );
    setLanguageState(userInterfaceLanguage.value);
    setRowsPerPageState(rowsPerPage.value);
    setDetailsExportFileNameState(detailsExportFileName.value);
    setListExportFileNameState(listExportFileName.value);
    setReportExportFileNameState(reportExportFileName.value);
    setAutoCacheRebuildState(autoCacheRebuild.value);
  }, [
    storeTimezone,
    userInterfaceTimeFormat.value,
    userInterfaceDateFormat.value,
    userInterfaceLanguage.value,
    rowsPerPage.value,
    detailsExportFileName.value,
    listExportFileName.value,
    reportExportFileName.value,
    autoCacheRebuild.value,
  ]);

  const toggleTimezoneEditMode = (): void => {
    setTimezoneEditMode(!timezoneEditMode);
  };

  const saveTimezone = async (): Promise<void> => {
    // @ts-expect-error
    dispatch(updateTimezone(gmp)(timezoneState as string));

    await saveSetting(
      'Timezone',
      'Timezone',
      timezoneState as string,
      (value: boolean) => {
        if (value === false) setTimezoneEditMode(false);
      },
      value => gmp.user.saveTimezone(value),
    );
  };

  const cancelTimezoneEdit = (): void => {
    setTimezoneState(storeTimezone);
    setTimezoneEditMode(false);
    clearErrorMessage('Timezone');
  };

  const handleTimezoneChange = (value: string): void => {
    setTimezoneState(value);
  };

  const toggleDateTimeFormatEditMode = (): void => {
    setDateTimeFormatEditMode(!dateTimeFormatEditMode);
  };

  const saveDateTimeFormat = async (): Promise<void> => {
    try {
      if (!userInterfaceTimeFormat?.id || !userInterfaceDateFormat?.id) {
        setErrorMessage(
          'dateTimeFormat',
          _('Cannot save date/time format: missing setting IDs.'),
        );
        return;
      }

      if (isUserInterfaceTimeDateDefaultState === YES_VALUE) {
        await saveSetting(
          userInterfaceTimeFormat.id,
          'userInterfaceTimeFormat',
          SYSTEM_DEFAULT,
          () => {},
        );
        await saveSetting(
          userInterfaceDateFormat.id,
          'userInterfaceDateFormat',
          SYSTEM_DEFAULT,
          () => {},
        );
      } else {
        await saveSetting(
          userInterfaceTimeFormat.id,
          'userInterfaceTimeFormat',
          timeFormatState as string,
          () => {},
        );
        await saveSetting(
          userInterfaceDateFormat.id,
          'userInterfaceDateFormat',
          dateFormatState as string,
          () => {},
        );
      }

      setDateTimeFormatEditMode(false);
    } catch (error) {
      setErrorMessage(
        'dateTimeFormat',
        // @ts-expect-error
        error.message ??
          _('An error occurred while saving the setting, please try again.'),
      );
      console.error(error);
    }
  };

  const cancelDateTimeFormatEdit = (): void => {
    setTimeFormatState(userInterfaceTimeFormat.value);
    setDateFormatState(userInterfaceDateFormat.value);
    setIsUserInterfaceTimeDateDefaultState(
      userInterfaceTimeFormat.value === SYSTEM_DEFAULT &&
        userInterfaceDateFormat.value === SYSTEM_DEFAULT
        ? YES_VALUE
        : NO_VALUE,
    );
    setDateTimeFormatEditMode(false);
    clearErrorMessage('dateTimeFormat');
  };

  const handleTimeFormatChange = (value: string): void => {
    setTimeFormatState(value);
  };

  const handleDateFormatChange = (value: string): void => {
    setDateFormatState(value);
  };

  const handleSysDefaultChange = (value: string): void => {
    const isSystemDefault = parseYesNo(value);
    setIsUserInterfaceTimeDateDefaultState(value as unknown as YesNo);

    if (isSystemDefault === YES_VALUE) {
      setTimeFormatState(SYSTEM_DEFAULT);
      setDateFormatState(SYSTEM_DEFAULT);
    }
  };

  const toggleLanguageEditMode = (): void => {
    setLanguageEditMode(!languageEditMode);
  };

  const saveLanguage = async (): Promise<void> => {
    void setLanguage(languageState as string);
    if (!userInterfaceLanguage?.id) {
      setErrorMessage(
        'userInterfaceLanguage',
        _('Cannot save language: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      userInterfaceLanguage.id,
      'userInterfaceLanguage',
      languageState as string,
      setLanguageEditMode,
    );
  };

  const cancelLanguageEdit = (): void => {
    setLanguageState(userInterfaceLanguage.value);
    setLanguageEditMode(false);
    clearErrorMessage('userInterfaceLanguage');
  };

  const handleLanguageChange = (value: string): void => {
    setLanguageState(value);
  };

  const toggleRowsPerPageEditMode = (): void => {
    setRowsPerPageEditMode(!rowsPerPageEditMode);
  };

  const saveRowsPerPage = async (): Promise<void> => {
    if (!rowsPerPage?.id) {
      setErrorMessage(
        'rowsPerPage',
        _('Cannot save rows per page: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      rowsPerPage.id,
      'rowsPerPage',
      rowsPerPageState as string,
      setRowsPerPageEditMode,
    );
  };

  const cancelRowsPerPageEdit = (): void => {
    setRowsPerPageState(rowsPerPage.value);
    setRowsPerPageEditMode(false);
    clearErrorMessage('rowsPerPage');
  };

  const handleRowsPerPageChange = (value: string | number): void => {
    setRowsPerPageState(value);
  };

  const toggleDetailsExportFileNameEditMode = (): void => {
    setDetailsExportFileNameEditMode(!detailsExportFileNameEditMode);
  };

  const saveDetailsExportFileName = async (): Promise<void> => {
    if (!detailsExportFileName?.id) {
      setErrorMessage(
        'detailsExportFileName',
        _('Cannot save details export filename: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      detailsExportFileName.id,
      'detailsExportFileName',
      detailsExportFileNameState as string,
      setDetailsExportFileNameEditMode,
    );
  };

  const cancelDetailsExportFileNameEdit = (): void => {
    setDetailsExportFileNameState(detailsExportFileName.value);
    setDetailsExportFileNameEditMode(false);
    clearErrorMessage('detailsExportFileName');
  };

  const handleDetailsExportFileNameChange = (value: string): void => {
    setDetailsExportFileNameState(value);
  };

  const toggleListExportFileNameEditMode = (): void => {
    setListExportFileNameEditMode(!listExportFileNameEditMode);
  };

  const saveListExportFileName = async (): Promise<void> => {
    if (!listExportFileName?.id) {
      setErrorMessage(
        'listExportFileName',
        _('Cannot save list export filename: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      listExportFileName.id,
      'listExportFileName',
      listExportFileNameState as string,
      setListExportFileNameEditMode,
    );
  };

  const cancelListExportFileNameEdit = (): void => {
    setListExportFileNameState(listExportFileName.value);
    setListExportFileNameEditMode(false);
    clearErrorMessage('listExportFileName');
  };

  const handleListExportFileNameChange = (value: string): void => {
    setListExportFileNameState(value);
  };

  const toggleReportExportFileNameEditMode = (): void => {
    setReportExportFileNameEditMode(!reportExportFileNameEditMode);
  };

  const saveReportExportFileName = async (): Promise<void> => {
    if (!reportExportFileName?.id) {
      setErrorMessage(
        'reportExportFileName',
        _('Cannot save report export filename: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      reportExportFileName.id,
      'reportExportFileName',
      reportExportFileNameState as string,
      setReportExportFileNameEditMode,
    );
  };

  const cancelReportExportFileNameEdit = (): void => {
    setReportExportFileNameState(reportExportFileName.value);
    setReportExportFileNameEditMode(false);
    clearErrorMessage('reportExportFileName');
  };

  const handleReportExportFileNameChange = (value: string): void => {
    setReportExportFileNameState(value);
  };

  const toggleAutoCacheRebuildEditMode = (): void => {
    setAutoCacheRebuildEditMode(!autoCacheRebuildEditMode);
  };

  const saveAutoCacheRebuild = async (): Promise<void> => {
    if (!autoCacheRebuild?.id) {
      setErrorMessage(
        'autoCacheRebuild',
        _('Cannot save auto cache rebuild: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      autoCacheRebuild.id,
      'autoCacheRebuild',
      autoCacheRebuildState as string,
      setAutoCacheRebuildEditMode,
    );
  };

  const cancelAutoCacheRebuildEdit = (): void => {
    setAutoCacheRebuildState(autoCacheRebuild.value);
    setAutoCacheRebuildEditMode(false);
    clearErrorMessage('autoCacheRebuild');
  };

  const handleAutoCacheRebuildChange = (value: string): void => {
    setAutoCacheRebuildState(value);
  };

  const togglePasswordEditMode = (): void => {
    setPasswordEditMode(!passwordEditMode);
  };

  const savePassword = async (): Promise<void> => {
    if (newPasswordState === confPasswordState && oldPasswordState) {
      await saveSetting(
        'Password',
        'Password',
        newPasswordState,
        (value: boolean) => {
          if (value === false) setPasswordEditMode(false);
        },
        () => gmp.user.changePassword(oldPasswordState, newPasswordState),
      );
    }
  };

  const cancelPasswordEdit = (): void => {
    setOldPasswordState('');
    setNewPasswordState('');
    setConfPasswordState('');
    setPasswordEditMode(false);
    clearErrorMessage('Password');
  };

  const handlePasswordChange = (value: string, name?: string): void => {
    if (name === 'oldPassword') {
      setOldPasswordState(value);
    } else if (name === 'newPassword') {
      setNewPasswordState(value);
    } else if (name === 'confPassword') {
      setConfPasswordState(value);
    }
  };

  const getYesNoValue = (setting?: string | number): string => {
    if (!setting && setting !== 0) {
      return _('No');
    }
    return parseYesNo(String(setting)) === YES_VALUE ? _('Yes') : _('No');
  };

  const getTimeFormatLabel = (timeFormatState: string): string => {
    if (timeFormatState === SYSTEM_DEFAULT) {
      return _('System Default');
    }
    return timeFormatState === DATE_TIME_FORMAT_OPTIONS.TIME_12
      ? _('12h')
      : _('24h');
  };

  const getDateFormatLabel = (dateFormatState: string): string => {
    if (dateFormatState === SYSTEM_DEFAULT) {
      return _('System Default');
    }
    return dateFormatState === DATE_TIME_FORMAT_OPTIONS.WMDY
      ? _('Weekday, Month, Day, Year')
      : _('Weekday, Day, Month, Year');
  };

  return (
    <StripedTable>
      <colgroup>
        <col width="30%" />
        <col width="55%" />
        <col width="15%" />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead>{_('Setting')}</TableHead>
          <TableHead>{_('Value')}</TableHead>
          <TableHead>{_('Actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <TimeZoneSelect
              name="timezone"
              value={timezoneState}
              onChange={handleTimezoneChange}
            />
          }
          errorMessage={getErrorMessage('Timezone')}
          isEditMode={timezoneEditMode}
          label={_('Timezone')}
          title={_('Timezone')}
          viewComponent={<span>{timezoneState}</span>}
          onCancel={cancelTimezoneEdit}
          onEdit={toggleTimezoneEditMode}
          onSave={saveTimezone}
        />

        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <div>
              <Checkbox<string>
                checked={
                  parseYesNo(isUserInterfaceTimeDateDefaultState) === YES_VALUE
                }
                checkedValue={String(YES_VALUE)}
                name="isUserInterfaceTimeDateDefault"
                title={_('Use System Default for Time and Date Format')}
                unCheckedValue={String(NO_VALUE)}
                onChange={handleSysDefaultChange}
              />
              <Select
                disabled={
                  parseYesNo(isUserInterfaceTimeDateDefaultState) === YES_VALUE
                }
                items={getSelectItems(DATE_TIME_CATEGORY.TIME, _)}
                label={_('Time Format')}
                name="userInterfaceTimeFormat"
                value={timeFormatState}
                onChange={handleTimeFormatChange}
              />
              <Select
                disabled={
                  parseYesNo(isUserInterfaceTimeDateDefaultState) === YES_VALUE
                }
                items={getSelectItems(DATE_TIME_CATEGORY.LONG_DATE, _)}
                label={_('Date Format')}
                name="userInterfaceDateFormat"
                value={dateFormatState}
                onChange={handleDateFormatChange}
              />
            </div>
          }
          errorMessage={getErrorMessage('dateTimeFormat')}
          isEditMode={dateTimeFormatEditMode}
          label={_('Date & Time Format')}
          title={_('Configure date and time display formats')}
          viewComponent={
            <div>
              <div>
                {_('Time Format')}: {getTimeFormatLabel(timeFormatState)}
              </div>
              <div>
                {_('Date Format')}: {getDateFormatLabel(dateFormatState)}
              </div>
            </div>
          }
          onCancel={cancelDateTimeFormatEdit}
          onEdit={toggleDateTimeFormatEditMode}
          onSave={saveDateTimeFormat}
        />

        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <div>
              <FormGroup title={_('Change Password')}>
                <PasswordField
                  autoComplete="off"
                  grow="1"
                  name="oldPassword"
                  title={_('Old')}
                  value={oldPasswordState}
                  onChange={value => handlePasswordChange(value, 'oldPassword')}
                />
                <PasswordField
                  autoComplete="off"
                  grow="1"
                  name="newPassword"
                  title={_('New')}
                  value={newPasswordState}
                  onChange={value => handlePasswordChange(value, 'newPassword')}
                />
                <PasswordField
                  autoComplete="off"
                  name="confPassword"
                  title={_('Confirm')}
                  value={confPasswordState}
                  onChange={value =>
                    handlePasswordChange(value, 'confPassword')
                  }
                />
              </FormGroup>
              <FormGroup title=" ">
                <UserSettingsPasswordNotification
                  confPassword={confPasswordState}
                  newPassword={newPasswordState}
                  oldPassword={oldPasswordState}
                />
              </FormGroup>
            </div>
          }
          errorMessage={getErrorMessage('Password')}
          isEditMode={passwordEditMode}
          label={_('Password')}
          title={_('Change your password')}
          viewComponent={<span>********</span>}
          onCancel={cancelPasswordEdit}
          onEdit={togglePasswordEditMode}
          onSave={savePassword}
        />

        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <Select
              items={renderLanguageItems()}
              name="userInterfaceLanguage"
              value={languageState}
              onChange={handleLanguageChange}
            />
          }
          errorMessage={getErrorMessage('userInterfaceLanguage')}
          isEditMode={languageEditMode}
          label={_('User Interface Language')}
          title={userInterfaceLanguage.comment}
          viewComponent={
            <span>{getLangNameByCode(userInterfaceLanguage.value)}</span>
          }
          onCancel={cancelLanguageEdit}
          onEdit={toggleLanguageEditMode}
          onSave={saveLanguage}
        />

        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <TextField
              name="rowsPerPage"
              value={rowsPerPageState}
              onChange={handleRowsPerPageChange}
            />
          }
          errorMessage={getErrorMessage('rowsPerPage')}
          isEditMode={rowsPerPageEditMode}
          label={_('Rows Per Page')}
          title={rowsPerPage.comment}
          viewComponent={<span>{rowsPerPage.value}</span>}
          onCancel={cancelRowsPerPageEdit}
          onEdit={toggleRowsPerPageEditMode}
          onSave={saveRowsPerPage}
        />

        <TableRow>
          <TableData>{_('Max Rows Per Page (immutable)')}</TableData>
          <TableData>{maxRowsPerPage.value}</TableData>
          <TableData> {/* Fill column */}</TableData>
        </TableRow>

        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <TextField
              name="detailsExportFileName"
              value={detailsExportFileNameState}
              onChange={handleDetailsExportFileNameChange}
            />
          }
          errorMessage={getErrorMessage('detailsExportFileName')}
          isEditMode={detailsExportFileNameEditMode}
          label={_('Details Export File Name')}
          title={detailsExportFileName.comment}
          viewComponent={<span>{detailsExportFileName.value}</span>}
          onCancel={cancelDetailsExportFileNameEdit}
          onEdit={toggleDetailsExportFileNameEditMode}
          onSave={saveDetailsExportFileName}
        />

        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <TextField
              name="listExportFileName"
              value={listExportFileNameState}
              onChange={handleListExportFileNameChange}
            />
          }
          errorMessage={getErrorMessage('listExportFileName')}
          isEditMode={listExportFileNameEditMode}
          label={_('List Export File Name')}
          title={listExportFileName.comment}
          viewComponent={<span>{listExportFileName.value}</span>}
          onCancel={cancelListExportFileNameEdit}
          onEdit={toggleListExportFileNameEditMode}
          onSave={saveListExportFileName}
        />

        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <TextField
              name="reportExportFileName"
              value={reportExportFileNameState}
              onChange={handleReportExportFileNameChange}
            />
          }
          errorMessage={getErrorMessage('reportExportFileName')}
          isEditMode={reportExportFileNameEditMode}
          label={_('Report Export File Name')}
          title={reportExportFileName.comment}
          viewComponent={<span>{reportExportFileName.value}</span>}
          onCancel={cancelReportExportFileNameEdit}
          onEdit={toggleReportExportFileNameEditMode}
          onSave={saveReportExportFileName}
        />

        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <Checkbox<string>
              checked={parseYesNo(autoCacheRebuildState) === YES_VALUE}
              checkedValue={String(YES_VALUE)}
              name="autoCacheRebuild"
              title={_('Auto Cache Rebuild')}
              unCheckedValue={String(NO_VALUE)}
              onChange={handleAutoCacheRebuildChange}
            />
          }
          errorMessage={getErrorMessage('autoCacheRebuild')}
          isEditMode={autoCacheRebuildEditMode}
          label={_('Auto Cache Rebuild')}
          title={autoCacheRebuild.comment}
          viewComponent={<span>{getYesNoValue(autoCacheRebuild.value)}</span>}
          onCancel={cancelAutoCacheRebuildEdit}
          onEdit={toggleAutoCacheRebuildEditMode}
          onSave={saveAutoCacheRebuild}
        />
      </TableBody>
    </StripedTable>
  );
};

export default GeneralSettings;
