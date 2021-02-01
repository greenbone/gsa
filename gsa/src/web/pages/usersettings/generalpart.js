/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import styled from 'styled-components';

import _ from 'gmp/locale';
import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

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
  oldPassword,
  newPassword,
  confPassword,
  userInterfaceLanguage,
  rowsPerPage,
  maxRowsPerPage,
  detailsExportFileName,
  listExportFileName,
  reportExportFileName,
  autoCacheRebuild,
  shouldWarn,
  validityStatus,
  onChange,
}) => {
  return (
    <React.Fragment>
      <FormGroup title={_('Timezone')} titleSize="3">
        <TimeZoneSelect name="timezone" value={timezone} onChange={onChange} />
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
          hasError={shouldWarn && !validityStatus.rowsPerPage.isValid}
          errorContent={validityStatus.rowsPerPage.error}
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
    </React.Fragment>
  );
};

GeneralPart.propTypes = {
  autoCacheRebuild: PropTypes.number,
  confPassword: PropTypes.string,
  detailsExportFileName: PropTypes.string,
  listExportFileName: PropTypes.string,
  maxRowsPerPage: PropTypes.number,
  newPassword: PropTypes.string,
  oldPassword: PropTypes.string,
  reportExportFileName: PropTypes.string,
  rowsPerPage: PropTypes.number,
  shouldWarn: PropTypes.bool.isRequired,
  timezone: PropTypes.string,
  userInterfaceLanguage: PropTypes.string,
  validityStatus: PropTypes.object.isRequired,
  onChange: PropTypes.func,
};

export default GeneralPart;

// vim: set ts=2 sw=2 tw=80:
