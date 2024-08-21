/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import TextField from 'web/components/form/textfield';

import Layout from 'web/components/layout/layout';

const RadiusDialog = ({enable = false, radiushost = '', onClose, onSave}) => {
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
        <Layout flex="column">
          <FormGroup title={_('Enable')}>
            <CheckBox
              data-testid="enable-checkbox"
              name="enable"
              checked={values.enable}
              checkedValue={true}
              unCheckedValue={false}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('RADIUS Host')}>
            <TextField
              data-testid="radiushost-textfield"
              name="radiushost"
              size="50"
              value={values.radiushost}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Secret Key')}>
            <PasswordField
              data-testid="radiuskey-textfield"
              name="radiuskey"
              size="50"
              value={values.radiuskey}
              onChange={onValueChange}
            />
          </FormGroup>
        </Layout>
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
