/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SaveDialog from 'web/components/dialog/SaveDialog';
import CheckBox from 'web/components/form/Checkbox';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';

interface LdapDialogProps {
  authdn?: string;
  ldapEnabled?: boolean;
  ldapHost?: string;
  ldapsOnly?: boolean;
  onClose: () => void;
  onSave: (values: LdapDialogState) => void;
}

export type LdapDialogState = LdapDialogDefaultValues & LdapDialogValues;

interface LdapDialogDefaultValues {
  authdn: string;
  ldapEnabled: boolean;
  ldapHost: string;
  ldapsOnly: boolean;
}

interface LdapDialogValues {
  certificate?: File;
}

const LdapDialog = ({
  authdn = '',
  ldapEnabled = false,
  ldapHost = '',
  ldapsOnly = false,
  onClose,
  onSave,
}: LdapDialogProps) => {
  const [_] = useTranslation();
  const uncontrolledValues = {
    authdn,
    ldapEnabled,
    ldapHost,
    ldapsOnly,
  };
  return (
    <SaveDialog<LdapDialogValues, LdapDialogDefaultValues>
      buttonTitle={_('Save')}
      defaultValues={uncontrolledValues}
      title={_('Edit LDAP per-User Authentication')}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <CheckBox<boolean>
            checked={values.ldapEnabled}
            checkedValue={true}
            data-testid="enable-checkbox"
            name="ldapEnabled"
            title={_('Enable')}
            unCheckedValue={false}
            onChange={onValueChange}
          />
          <FormGroup title={_('LDAP Host')}>
            <TextField
              data-testid="ldaphost-textfield"
              name="ldapHost"
              size="30"
              value={values.ldapHost}
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
          <CheckBox<boolean>
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

export default LdapDialog;
