/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import Layout from 'web/components/layout/layout';

const LdapDialog = ({
  authdn = '',
  enable = false,
  ldaphost = '',
  onClose,
  onSave,
}) => {
  const uncontrolledValues = {
    authdn,
    enable,
    ldaphost,
  };
  return (
    <SaveDialog
      buttonTitle={_('OK')}
      title={_('Edit Authentication')}
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
            <Layout flex="column">
              <FileField name="certificate" onChange={onValueChange} />
            </Layout>
          </FormGroup>
        </Layout>
      )}
    </SaveDialog>
  );
};

LdapDialog.propTypes = {
  authdn: PropTypes.string,
  enable: PropTypes.bool,
  ldaphost: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default LdapDialog;

// vim: set ts=2 sw=2 tw=80:
