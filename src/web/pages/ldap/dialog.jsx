/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import useTranslation from 'web/hooks/useTranslation';

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
      title={_('Edit LDAP per-User Authentication')}
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
          <FormGroup title={_('LDAP Host')}>
            <TextField
              data-testid="ldaphost-textfield"
              name="ldaphost"
              value={values.ldaphost}
              size="30"
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Auth. DN')}>
            <TextField
              data-testid="authdn-textfield"
              name="authdn"
              value={values.authdn}
              size="30"
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('CA Certificate')}>
            <FileField name="certificate" onChange={onValueChange} />
          </FormGroup>
          <CheckBox
            title={_('Use LDAPS only')}
            data-testid="ldapsOnly-checkbox"
            name="ldapsOnly"
            checked={values.ldapsOnly}
            checkedValue={true}
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
