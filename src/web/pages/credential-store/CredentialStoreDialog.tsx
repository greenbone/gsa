/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SaveDialog from 'web/components/dialog/SaveDialog';
import CheckBox from 'web/components/form/Checkbox';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import PasswordField from 'web/components/form/PasswordField';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';

interface CyberArkDialogProps {
  active?: boolean;
  appId?: string;
  comment?: string;
  host?: string;
  path?: string;
  port?: string;
  sslOnly?: boolean;
  onClose: () => void;
  onSave: (values: CyberArkDialogState) => void;
}

export type CyberArkDialogState = CyberArkDialogDefaultValues &
  CyberArkDialogValues;

interface CyberArkDialogDefaultValues {
  active: boolean;
  appId: string;
  comment: string;
  host: string;
  path: string;
  port: string;
  sslOnly: boolean;
}

interface CyberArkDialogValues {
  clientCertificate?: File;
  clientKey?: File;
  pkcs12File?: File;
  passphrase?: string;
  serverCaCertificate?: File;
}

const CyberArkDialog = ({
  active = true,
  appId = '',
  comment = '',
  host = '',
  path = '',
  port = '',
  sslOnly = true,
  onClose,
  onSave,
}: CyberArkDialogProps) => {
  const [_] = useTranslation();

  const uncontrolledValues = {
    active,
    appId,
    comment,
    host,
    path,
    port,
    sslOnly,
  };

  return (
    <SaveDialog<CyberArkDialogValues, CyberArkDialogDefaultValues>
      buttonTitle={_('Save')}
      defaultValues={uncontrolledValues}
      title={_('Edit CyberArk Credential Store')}
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
          <FormGroup title={_('Application ID')}>
            <TextField
              data-testid="appid-textfield"
              name="appId"
              title={_(
                'Unique ID of the application issuing password requests (required)',
              )}
              value={values.appId}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Host')}>
            <TextField
              data-testid="host-textfield"
              name="host"
              value={values.host}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Path')}>
            <TextField
              data-testid="path-textfield"
              name="path"
              value={values.path}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Port')}>
            <TextField
              data-testid="port-textfield"
              name="port"
              value={values.port}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Comment')}>
            <TextField
              data-testid="comment-textfield"
              name="comment"
              value={values.comment}
              onChange={onValueChange}
            />
          </FormGroup>
          <CheckBox<boolean>
            checked={values.sslOnly}
            checkedValue={true}
            data-testid="sslOnly-checkbox"
            name="sslOnly"
            title={_('Use SSL only')}
            unCheckedValue={false}
            onChange={onValueChange}
          />
          <FormGroup title={_('Client Certificate')}>
            <FileField
              name="clientCertificate"
              title={_('Upload client certificate (.pem, .crt)')}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Client Private Key')}>
            <FileField
              name="clientKey"
              title={_('Upload private key (.pem, .key)')}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('PKCS#12 File')}>
            <FileField
              name="pkcs12File"
              title={_(
                'Upload PKCS#12 file (.p12, .pfx) - alternative to separate certificate/key',
              )}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Server CA Certificate')}>
            <FileField
              name="serverCaCertificate"
              title={_('Upload server CA certificate (.pem, .crt)')}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Passphrase')}>
            <PasswordField
              data-testid="passphrase-field"
              name="passphrase"
              title={_(
                'Passphrase for private key or PKCS#12 file (if encrypted)',
              )}
              value={values.passphrase || ''}
              onChange={onValueChange}
            />
          </FormGroup>
        </>
      )}
    </SaveDialog>
  );
};

export default CyberArkDialog;
