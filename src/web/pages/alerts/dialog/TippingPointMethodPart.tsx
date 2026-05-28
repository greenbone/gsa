/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as Credential,
  type CredentialType,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import {type YesNo} from 'gmp/parser';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {NewIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import addPrefix from 'web/utils/add-prefix';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface TippingPointMethodPartProps {
  prefix?: string;
  credentials?: Credential[];
  tpSmsCredential?: string;
  tpSmsTlsCertificate?: File;
  tpSmsHostname?: string;
  tpSmsTlsWorkaround?: YesNo;
  onChange: (value: string | File | YesNo | undefined, name?: string) => void;
  onCredentialChange: (value: string, name?: string) => void;
  onNewCredentialClick: (credentialTypes: CredentialType[]) => void;
}

export const TIPPING_POINT_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
] as CredentialType[];

const TippingPointMethodPart = ({
  credentials = [],
  prefix: initialPrefix,
  tpSmsCredential,
  tpSmsTlsCertificate,
  tpSmsHostname,
  tpSmsTlsWorkaround,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}: TippingPointMethodPartProps) => {
  const [_] = useTranslation();
  const prefix = addPrefix(initialPrefix);
  credentials = credentials.filter(
    cred => cred.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  return (
    <>
      <FormGroup>
        <TextField
          grow="1"
          name={prefix('tp_sms_hostname')}
          title={_('Hostname / IP')}
          value={tpSmsHostname}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup
        direction="row"
        htmlFor="tipping-point-credential"
        title={_('Credential')}
      >
        <Select
          grow="1"
          id="tipping-point-credential"
          items={renderSelectItems(credentials as RenderSelectItemProps[])}
          name={prefix('tp_sms_credential')}
          value={tpSmsCredential}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          title={_('Create a credential')}
          value={TIPPING_POINT_CREDENTIAL_TYPES}
          onClick={onNewCredentialClick}
        />
      </FormGroup>
      <FormGroup>
        <FileField
          name={prefix('tp_sms_tls_certificate')}
          title={_('SSL / TLS Certificate')}
          value={tpSmsTlsCertificate}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Use workaround for default certificate')}>
        <YesNoRadio
          name={prefix('tp_sms_tls_workaround')}
          value={tpSmsTlsWorkaround}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

export default TippingPointMethodPart;
