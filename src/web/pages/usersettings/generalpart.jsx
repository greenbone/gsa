/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import styled from 'styled-components';

import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {dateTimeFormatOptions, SYSTEM_DEFAULT} from 'gmp/locale/date';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';
import TimeZoneSelect from 'web/components/form/timezoneselect';

import Languages from 'web/utils/languages';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import useTranslation from 'web/hooks/useTranslation';

const renderLanguageItems = () =>
  Object.entries(Languages).map(([code, {name, native_name}]) => ({
    value: code,
    label: isDefined(native_name) ? `${name} | ${native_name}` : `${name}`,
  }));

const NotificationDiv = styled.div`
  color: ${props => props.color};
`;

const Notification = ({newPassword, oldPassword, confPassword}) => {
  const [_] = useTranslation();
  let color;
  let text;

  if (oldPassword === '' && newPassword === '' && confPassword === '') {
    text = null;
  } else if (oldPassword !== '' && newPassword === '' && confPassword === '') {
    color = Theme.warningRed;
    text = _('Please enter a new password!');
  } else if (
    oldPassword === '' &&
    (newPassword !== '' || confPassword !== '')
  ) {
    color = Theme.warningRed;
    text = _('Please enter your old password!');
  } else if (oldPassword !== '' && newPassword !== confPassword) {
    color = Theme.warningRed;
    text = _('Confirmation does not match new password!');
  } else if (oldPassword !== '' && newPassword === confPassword) {
    color = Theme.darkGreen;
    text = _('Confirmation matches new password!');
  }

  return <NotificationDiv color={color}>{text}</NotificationDiv>;
};

Notification.propTypes = {
  confPassword: PropTypes.string,
  newPassword: PropTypes.string,
  oldPassword: PropTypes.string,
};

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
}) => {
  const [_] = useTranslation();
  const [prevUserInterfaceTimeFormat, setPrevUserInterfaceTimeFormat] =
    useState(undefined);
  const [prevUserInterfaceDateFormat, setPrevUserInterfaceDateFormat] =
    useState(undefined);

  const getSelectItems = category => {
    return Object.entries(dateTimeFormatOptions[category].options).map(
      ([value, {label}]) => ({
        value: isNaN(value) ? value : Number(value),
        label: _(label),
      }),
    );
  };

  const handleSysDefaultChange = event => {
    const isSystemDefault = parseYesNo(event);

    const defaultTimeFormat = 24;
    const defaultDateFormat = 'wdmy';

    const currentUserInterfaceTimeFormat =
      userInterfaceTimeFormat || defaultTimeFormat;
    const currentUserInterfaceDateFormat =
      userInterfaceDateFormat || defaultDateFormat;

    if (!isSystemDefault) {
      onChange(
        prevUserInterfaceTimeFormat || defaultTimeFormat,
        'userInterfaceTimeFormat',
      );
      onChange(
        prevUserInterfaceDateFormat || defaultDateFormat,
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
        title={_('Use System Default for Time and Date Format')}
        name="isUserInterfaceTimeDateDefault"
        checked={parseYesNo(isUserInterfaceTimeDateDefault) === YES_VALUE}
        checkedValue={YES_VALUE}
        unCheckedValue={NO_VALUE}
        onChange={handleSysDefaultChange}
      />

      <Select
        label={_('Time Format')}
        name="userInterfaceTimeFormat"
        value={userInterfaceTimeFormat}
        items={getSelectItems('time')}
        onChange={onChange}
        disabled={isUserInterfaceTimeDateDefault}
      />
      <Select
        label={_('Date Format')}
        name="userInterfaceDateFormat"
        value={userInterfaceDateFormat}
        items={getSelectItems('longDate')}
        onChange={onChange}
        disabled={isUserInterfaceTimeDateDefault}
      />
      <FormGroup title={_('Change Password')}>
        <PasswordField
          grow="1"
          title={_('Old')}
          name="oldPassword"
          value={oldPassword}
          autoComplete="off"
          onChange={onChange}
        />
        <PasswordField
          grow="1"
          title={_('New')}
          name="newPassword"
          value={newPassword}
          autoComplete="off"
          onChange={onChange}
        />
        <PasswordField
          title={_('Confirm')}
          name="confPassword"
          value={confPassword}
          autoComplete="off"
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title=" ">
        <Notification
          newPassword={newPassword}
          oldPassword={oldPassword}
          confPassword={confPassword}
        />
      </FormGroup>
      <FormGroup title={_('User Interface Language')}>
        <Select
          name="userInterfaceLanguage"
          value={userInterfaceLanguage}
          items={renderLanguageItems()}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Rows Per Page')}>
        <TextField
          name="rowsPerPage"
          hasError={shouldWarn && !!errors.rowsPerPage}
          errorContent={errors.rowsPerPage}
          value={rowsPerPage}
          onChange={onChange}
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
        title={_('Auto Cache Rebuild')}
        name="autoCacheRebuild"
        checked={parseYesNo(autoCacheRebuild) === YES_VALUE}
        checkedValue={YES_VALUE}
        unCheckedValue={NO_VALUE}
        onChange={onChange}
      />
    </>
  );
};

GeneralPart.propTypes = {
  autoCacheRebuild: PropTypes.number,
  confPassword: PropTypes.string,
  detailsExportFileName: PropTypes.string,
  errors: PropTypes.object.isRequired,
  listExportFileName: PropTypes.string,
  newPassword: PropTypes.string,
  oldPassword: PropTypes.string,
  reportExportFileName: PropTypes.string,
  rowsPerPage: PropTypes.number,
  shouldWarn: PropTypes.bool.isRequired,
  timezone: PropTypes.string,
  userInterfaceTimeFormat: PropTypes.oneOf([12, 24, SYSTEM_DEFAULT]),
  userInterfaceDateFormat: PropTypes.oneOf(['wmdy', 'wdmy', SYSTEM_DEFAULT]),
  isUserInterfaceTimeDateDefault: PropTypes.oneOfType([YES_VALUE, NO_VALUE]),
  userInterfaceLanguage: PropTypes.string,
  onChange: PropTypes.func,
};

export default GeneralPart;

// vim: set ts=2 sw=2 tw=80:
