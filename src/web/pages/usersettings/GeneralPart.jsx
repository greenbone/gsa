/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {SYSTEM_DEFAULT} from 'gmp/locale/date';
import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {useState} from 'react';
import styled from 'styled-components';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import PasswordField from 'web/components/form/PasswordField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import TimeZoneSelect from 'web/components/form/TimeZoneSelect';
import useTranslation from 'web/hooks/useTranslation';
import Languages from 'web/utils/Languages';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

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

const TIME = 'time';
const LONG_DATE = 'longDate';

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
    const dateTimeFormatOptions = {
      [TIME]: {
        12: _('12h'),
        24: _('24h'),
      },
      [LONG_DATE]: {
        wmdy: _('Weekday, Month, Day, Year'),
        wdmy: _('Weekday, Day, Month, Year'),
      },
    };
    return Object.entries(dateTimeFormatOptions[category]).map(
      ([value, label]) => ({
        value: isNaN(value) ? value : Number(value),
        label,
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
        checked={parseYesNo(isUserInterfaceTimeDateDefault) === YES_VALUE}
        checkedValue={YES_VALUE}
        name="isUserInterfaceTimeDateDefault"
        title={_('Use System Default for Time and Date Format')}
        unCheckedValue={NO_VALUE}
        onChange={handleSysDefaultChange}
      />

      <Select
        disabled={isUserInterfaceTimeDateDefault}
        items={getSelectItems(TIME)}
        label={_('Time Format')}
        name="userInterfaceTimeFormat"
        value={userInterfaceTimeFormat}
        onChange={onChange}
      />
      <Select
        disabled={isUserInterfaceTimeDateDefault}
        items={getSelectItems(LONG_DATE)}
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
        <Notification
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
          errorContent={errors.rowsPerPage}
          hasError={shouldWarn && !!errors.rowsPerPage}
          name="rowsPerPage"
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
  isUserInterfaceTimeDateDefault: PropTypes.oneOf([YES_VALUE, NO_VALUE]),
  userInterfaceLanguage: PropTypes.string,
  onChange: PropTypes.func,
};

export default GeneralPart;
