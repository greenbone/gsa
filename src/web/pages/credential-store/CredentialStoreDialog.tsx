/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SaveDialog from 'web/components/dialog/SaveDialog';
import CheckBox from 'web/components/form/Checkbox';
import FileField from 'web/components/form/FileField';
import PasswordField from 'web/components/form/PasswordField';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';

interface CredentialStoreDialogProps {
  active?: boolean;
  appId?: string;
  comment?: string;
  host?: string;
  path?: string;
  port?: string;
  onClose: () => void;
  onSave: (values: CredentialStoreDialogState) => void | Promise<void>;
}

export type CredentialStoreDialogState = CredentialStoreDialogDefaultValues;

interface CredentialStoreDialogDefaultValues {
  active: boolean;
  appId: string;
  comment: string;
  host: string;
  path: string;
  port: string;
  clientCertificate?: File;
  clientKey?: File;
  pkcs12File?: File;
  passphrase?: string;
  serverCaCertificate?: File;
}

const CredentialStoreDialog = ({
  active = true,
  appId = '',
  comment = '',
  host = '',
  path = '',
  port = '',
  onClose,
  onSave,
}: CredentialStoreDialogProps) => {
  const [_] = useTranslation();

  const uncontrolledValues = {
    active,
    appId,
    comment,
    host,
    passphrase: '',
    path,
    port,
  };

  return (
    <SaveDialog<{}, CredentialStoreDialogDefaultValues>
      buttonTitle={_('Save')}
      defaultValues={uncontrolledValues}
      title={_('Edit Credential Store')}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <CheckBox<boolean>
            checked={values.active}
            checkedValue={true}
            data-testid="active-checkbox"
            name="active"
            title={_('Active')}
            unCheckedValue={false}
            onChange={onValueChange}
          />

          <TextField
            data-testid="appid-textfield"
            description={_(
              'Unique ID of the application issuing password requests (required)',
            )}
            name="appId"
            title={_('Application ID')}
            value={values.appId}
            onChange={onValueChange}
          />
          <TextField
            data-testid="host-textfield"
            name="host"
            title={_('Host')}
            onChange={onValueChange}
          />
          <TextField
            data-testid="path-textfield"
            name="path"
            title={_('Path')}
            value={values.path}
            onChange={onValueChange}
          />
          <TextField
            data-testid="port-textfield"
            name="port"
            title={_('Port')}
            value={values.port}
            onChange={onValueChange}
          />
          <TextField
            data-testid="comment-textfield"
            name="comment"
            title={_('Comment')}
            value={values.comment}
            onChange={onValueChange}
          />

          <FileField
            name="clientCertificate"
            placeholder={_('Upload client certificate (.pem, .crt)')}
            title={_('Client Certificate')}
            value={values.clientCertificate}
            onChange={onValueChange}
          />
          <FileField
            name="clientKey"
            placeholder={_('Upload private key (.pem, .key)')}
            title={_('Client Private Key')}
            value={values.clientKey}
            onChange={onValueChange}
          />
          <FileField
            name="pkcs12File"
            placeholder={_('Upload PKCS#12 file (.p12, .pfx)  ')}
            title={_('PKCS#12 File - alternative to separate certificate/key')}
            value={values.pkcs12File}
            onChange={onValueChange}
          />
          <FileField
            name="serverCaCertificate"
            placeholder={_('Upload server CA certificate (.pem, .crt)')}
            title={_('Server CA Certificate')}
            value={values.serverCaCertificate}
            onChange={onValueChange}
          />
          <PasswordField
            data-testid="passphrase-field"
            name="passphrase"
            placeholder={_(
              'Passphrase for private key or PKCS#12 file (if encrypted)',
            )}
            title={_('Passphrase')}
            value={values.passphrase}
            onChange={onValueChange}
          />
        </>
      )}
    </SaveDialog>
  );
};

export default CredentialStoreDialog;
