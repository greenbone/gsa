/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import styled from 'styled-components';

import _ from 'gmp/locale';
import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {dateTimeFormatOptions, SYSTEM_DEFAULT} from 'gmp/locale/date';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';
import TimeZoneSelect from 'web/components/form/timezoneselect';
import Divider from 'web/components/layout/divider';

import Languages from 'web/utils/languages';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

const renderLanguageItems = () =>
  Object.entries(Languages).map(([code, {name, native_name}]) => ({
    value: code,
    label: isDefined(native_name) ? `${name} | ${native_name}` : `${name}`,
  }));

const NotificationDiv = styled.div`
  color: ${props => props.color};
`;

const Notification = ({newPassword, oldPassword, confPassword}) => {
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
      <FormGroup title={_('Timezone')} titleSize="3">
        <TimeZoneSelect name="timezone" value={timezone} onChange={onChange} />
      </FormGroup>
      <FormGroup
        title={_('Use System Default for Time and Date Format')}
        titleSize="3"
      >
        <Checkbox
          name="isUserInterfaceTimeDateDefault"
          checked={parseYesNo(isUserInterfaceTimeDateDefault) === YES_VALUE}
          checkedValue={YES_VALUE}
          unCheckedValue={NO_VALUE}
          onChange={handleSysDefaultChange}
        />
      </FormGroup>

      <FormGroup title={_('Time Format')} titleSize="3">
        <Select
          label={_('Time Format')}
          name="userInterfaceTimeFormat"
          value={
            userInterfaceTimeFormat === 'system_default'
              ? ''
              : userInterfaceTimeFormat
          }
          items={getSelectItems('time')}
          onChange={onChange}
          disabled={isUserInterfaceTimeDateDefault}
        />
      </FormGroup>
      <FormGroup title={_('Date Format')} titleSize="3">
        <Select
          label={_('Date Format')}
          name="userInterfaceDateFormat"
          value={
            userInterfaceDateFormat === 'system_default'
              ? ''
              : userInterfaceDateFormat
          }
          items={getSelectItems('longDate')}
          onChange={onChange}
          disabled={isUserInterfaceTimeDateDefault}
        />
      </FormGroup>

      <FormGroup title={_('Change Password')} titleSize="3">
        <Divider flex="column">
          <FormGroup title={_('Old')}>
            <PasswordField
              name="oldPassword"
              value={oldPassword}
              grow="1"
              size="30"
              autoComplete="off"
              onChange={onChange}
            />
          </FormGroup>
          <FormGroup title={_('New')}>
            <PasswordField
              name="newPassword"
              value={newPassword}
              grow="1"
              size="30"
              color="red"
              autoComplete="off"
              onChange={onChange}
            />
          </FormGroup>
          <FormGroup title={_('Confirm')}>
            <PasswordField
              name="confPassword"
              value={confPassword}
              grow="1"
              size="30"
              autoComplete="off"
              border="red"
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
        </Divider>
      </FormGroup>
      <FormGroup title={_('User Interface Language')} titleSize="3">
        <Select
          name="userInterfaceLanguage"
          value={userInterfaceLanguage}
          items={renderLanguageItems()}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Rows Per Page')} titleSize="3">
        <TextField
          name="rowsPerPage"
          hasError={shouldWarn && !!errors.rowsPerPage}
          errorContent={errors.rowsPerPage}
          value={rowsPerPage}
          size="19"
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Details Export File Name')} titleSize="3">
        <TextField
          name="detailsExportFileName"
          value={detailsExportFileName}
          size="19"
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('List Export File Name')} titleSize="3">
        <TextField
          name="listExportFileName"
          value={listExportFileName}
          size="19"
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Report Export File Name')} titleSize="3">
        <TextField
          name="reportExportFileName"
          value={reportExportFileName}
          size="19"
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Auto Cache Rebuild')} titleSize="3">
        <Checkbox
          name="autoCacheRebuild"
          checked={parseYesNo(autoCacheRebuild) === YES_VALUE}
          checkedValue={YES_VALUE}
          unCheckedValue={NO_VALUE}
          onChange={onChange}
        />
      </FormGroup>
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
