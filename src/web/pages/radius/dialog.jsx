/* Copyright (C) 2019-2022 Greenbone AG
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

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import TextField from 'web/components/form/textfield';

import useTranslation from 'web/hooks/useTranslation';

const RadiusDialog = ({enable = false, radiushost = '', onClose, onSave}) => {
  const [_] = useTranslation();
  const uncontrolledValues = {
    enable,
    radiushost,
    radiuskey: '',
  };
  return (
    <SaveDialog
      buttonTitle={_('Save')}
      title={_('Edit RADIUS Authentication')}
      defaultValues={uncontrolledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <CheckBox
            title={_('Enable')}
            data-testid="enable-checkbox"
            name="enable"
            checked={values.enable}
            checkedValue={true}
            unCheckedValue={false}
            onChange={onValueChange}
          />
          <FormGroup title={_('RADIUS Host')}>
            <TextField
              grow="1"
              data-testid="radiushost-textfield"
              name="radiushost"
              value={values.radiushost}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Secret Key')}>
            <PasswordField
              grow="1"
              data-testid="radiuskey-textfield"
              name="radiuskey"
              value={values.radiuskey}
              onChange={onValueChange}
            />
          </FormGroup>
        </>
      )}
    </SaveDialog>
  );
};

RadiusDialog.propTypes = {
  enable: PropTypes.bool,
  radiushost: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default RadiusDialog;

// vim: set ts=2 sw=2 tw=80:
