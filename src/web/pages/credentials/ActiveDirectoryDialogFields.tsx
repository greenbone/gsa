/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useRef, useState} from 'react';
import {
  type default as Credential,
  type ActiveDirectoryTlsMode,
} from 'gmp/models/credential';
import Checkbox from 'web/components/form/Checkbox';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import PasswordField from 'web/components/form/PasswordField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import ConnectionStatusPill from 'web/components/status/ConnectionStatusPill';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

export interface ActiveDirectoryDialogValues {
  adHost?: string;
  adPort?: string;
  adBindDn?: string;
  adBindPassword?: string;
  adBaseDn?: string;
  adTlsMode?: ActiveDirectoryTlsMode;
  adCaCertificate?: File | null;
}

interface ActiveDirectoryDialogFieldsProps {
  state: ActiveDirectoryDialogValues;
  credential?: Credential;
  initialCertificate?: File;
  onValueChange: (value: string | undefined, name?: string) => void;
  onCertificateChange: (file: File | undefined) => Promise<void>;
}

const ActiveDirectoryDialogFields = ({
  state,
  credential,
  initialCertificate,
  onValueChange,
  onCertificateChange,
}: ActiveDirectoryDialogFieldsProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const isEdit = credential !== undefined;
  const [changeAdBindPassword, setChangeAdBindPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'success' | 'failed' | 'testing'
  >();
  const requestVersion = useRef(0);
  const invalidateConnection = () => {
    requestVersion.current += 1;
    setConnectionStatus(undefined);
  };
  const handleValueChange = (value: string | undefined, name?: string) => {
    invalidateConnection();
    onValueChange(value, name);
  };
  const handleAdCaCertificateChange = (file: File | undefined) => {
    invalidateConnection();
    void onCertificateChange(file);
  };
  const settingsChanged =
    credential !== undefined &&
    (state.adHost !== credential.adHost ||
      state.adPort !== credential.adPort ||
      state.adBindDn !== credential.adBindDn ||
      state.adBaseDn !== credential.adBaseDn ||
      state.adTlsMode !== credential.adTlsMode ||
      state.adCaCertificate !== initialCertificate);
  const requiresPassword = isEdit && !changeAdBindPassword && settingsChanged;
  const handleTestConnection = async () => {
    if (requiresPassword) return;
    const version = ++requestVersion.current;
    setConnectionStatus('testing');
    try {
      if (credential?.id && !changeAdBindPassword) {
        await gmp.credential.verifyActiveDirectory({id: credential.id});
      } else {
        await gmp.credential.verifyActiveDirectory({
          adHost: state.adHost ?? '',
          adPort: state.adPort,
          adBindDn: state.adBindDn ?? '',
          adBindPassword: state.adBindPassword ?? '',
          adBaseDn: state.adBaseDn ?? '',
          adTlsMode: state.adTlsMode ?? 'ldaps',
          adCaCertificate:
            state.adCaCertificate === initialCertificate &&
            credential?.adCaCertificate
              ? new File([credential.adCaCertificate], 'ad-ca.pem')
              : state.adCaCertificate,
        });
      }
      if (version === requestVersion.current) setConnectionStatus('success');
    } catch {
      if (version === requestVersion.current) setConnectionStatus('failed');
    }
  };
  return (
    <>
      <TextField
        name="adHost"
        title={_('Active Directory Host or Address')}
        value={state.adHost}
        onChange={handleValueChange}
      />
      <TextField
        max={65535}
        min={1}
        name="adPort"
        title={_('Port')}
        type="number"
        value={state.adPort}
        onChange={handleValueChange}
      />
      <TextField
        name="adBindDn"
        title={_('Bind DN')}
        value={state.adBindDn}
        onChange={handleValueChange}
      />
      <FormGroup direction="row" title={_('Bind Password')}>
        {isEdit && (
          <Checkbox<boolean>
            checked={changeAdBindPassword}
            checkedValue={true}
            name="changeAdBindPassword"
            title={_('Replace existing password with')}
            unCheckedValue={false}
            onChange={value => {
              setChangeAdBindPassword(value);
              invalidateConnection();
              if (!value) onValueChange(undefined, 'adBindPassword');
            }}
          />
        )}
        <PasswordField
          autoComplete="new-password"
          disabled={isEdit && !changeAdBindPassword}
          grow="1"
          name="adBindPassword"
          value={state.adBindPassword ?? ''}
          onChange={handleValueChange}
        />
      </FormGroup>
      <TextField
        name="adBaseDn"
        title={_('Base DN')}
        value={state.adBaseDn}
        onChange={handleValueChange}
      />
      <Select<ActiveDirectoryTlsMode>
        items={[
          {label: _('LDAPS'), value: 'ldaps'},
          {label: _('StartTLS'), value: 'starttls'},
        ]}
        label={_('TLS Mode')}
        name="adTlsMode"
        value={state.adTlsMode}
        onChange={handleValueChange}
      />
      <FileField
        name="adCaCertificate"
        title={_('CA Certificate (PEM)')}
        value={state.adCaCertificate}
        onChange={handleAdCaCertificateChange}
      />
      {requiresPassword && (
        <p>
          {_(
            'Save the credential or enter the bind password to test changed settings.',
          )}
        </p>
      )}
      <Row justify="center" mb="md">
        <ConnectionStatusPill
          disabled={requiresPassword}
          labels={{
            idle: _('Verify credential'),
            testing: _('Verifying credential...'),
            success: _('Credential verified'),
            failed: _('Credential verification failed'),
          }}
          status={connectionStatus}
          onClick={() => void handleTestConnection()}
        />
      </Row>
    </>
  );
};

export default ActiveDirectoryDialogFields;
