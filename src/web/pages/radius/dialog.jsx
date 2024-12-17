/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SaveDialog from 'web/components/dialog/savedialog';
import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import TextField from 'web/components/form/textfield';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

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
      defaultValues={uncontrolledValues}
      title={_('Edit RADIUS Authentication')}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <CheckBox
            checked={values.enable}
            checkedValue={true}
            data-testid="enable-checkbox"
            name="enable"
            title={_('Enable')}
            unCheckedValue={false}
            onChange={onValueChange}
          />
          <FormGroup title={_('RADIUS Host')}>
            <TextField
              data-testid="radiushost-textfield"
              grow="1"
              name="radiushost"
              value={values.radiushost}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Secret Key')}>
            <PasswordField
              data-testid="radiuskey-textfield"
              grow="1"
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
