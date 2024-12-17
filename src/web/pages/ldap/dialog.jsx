/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SaveDialog from 'web/components/dialog/savedialog';
import CheckBox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

const LdapDialog = ({
  authdn = '',
  enable = false,
  ldaphost = '',
  ldapsOnly = false,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const uncontrolledValues = {
    authdn,
    enable,
    ldaphost,
    ldapsOnly,
  };
  return (
    <SaveDialog
      buttonTitle={_('Save')}
      defaultValues={uncontrolledValues}
      title={_('Edit LDAP per-User Authentication')}
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
          <FormGroup title={_('LDAP Host')}>
            <TextField
              data-testid="ldaphost-textfield"
              name="ldaphost"
              size="30"
              value={values.ldaphost}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Auth. DN')}>
            <TextField
              data-testid="authdn-textfield"
              name="authdn"
              size="30"
              value={values.authdn}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('CA Certificate')}>
            <FileField name="certificate" onChange={onValueChange} />
          </FormGroup>
          <CheckBox
            checked={values.ldapsOnly}
            checkedValue={true}
            data-testid="ldapsOnly-checkbox"
            name="ldapsOnly"
            title={_('Use LDAPS only')}
            unCheckedValue={false}
            onChange={onValueChange}
          />
        </>
      )}
    </SaveDialog>
  );
};

LdapDialog.propTypes = {
  authdn: PropTypes.string,
  enable: PropTypes.bool,
  ldaphost: PropTypes.string,
  ldapsOnly: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default LdapDialog;

// vim: set ts=2 sw=2 tw=80:
