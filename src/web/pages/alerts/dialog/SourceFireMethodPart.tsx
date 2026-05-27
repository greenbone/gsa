/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as Credential,
  PASSWORD_ONLY_CREDENTIAL_TYPE,
  password_only_credential_filter,
} from 'gmp/models/credential';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextField from 'web/components/form/TextField';
import {NewIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import addPrefix from 'web/utils/add-prefix';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

interface SourceFireMethodPartProps {
  prefix?: string;
  credentials?: Credential[];
  pkcs12Credential?: string;
  pkcs12File?: File;
  defenseCenterIp?: string;
  defenseCenterPort?: number;
  onChange: (value?: string | number | File, name?: string) => void;
  onCredentialChange: (value: string, name?: string) => void;
  onNewCredentialClick: () => void;
}

const SourceFireMethodPart = ({
  credentials = [],
  pkcs12Credential,
  pkcs12File,
  prefix: initialPrefix,
  defenseCenterIp,
  defenseCenterPort,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}: SourceFireMethodPartProps) => {
  const [_] = useTranslation();
  const prefix = addPrefix(initialPrefix);
  const credentialOptions = credentials.filter(password_only_credential_filter);
  return (
    <Layout flex="column" grow="1">
      <FormGroup direction="row">
        <TextField
          grow="1"
          name={prefix('defense_center_ip')}
          title={_('Defense Center IP')}
          value={defenseCenterIp}
          onChange={onChange}
        />
        <Spinner
          max={65535}
          min={0}
          name={prefix('defense_center_port')}
          title={_('Defense Center Port')}
          type="int"
          value={defenseCenterPort}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup
        direction="row"
        htmlFor="pkcs12-credential"
        title={_('PKCS12 Credential')}
      >
        <Select
          grow="1"
          id="pkcs12-credential"
          items={renderSelectItems(
            credentialOptions as RenderSelectItemProps[],
            UNSET_VALUE,
          )}
          name={prefix('pkcs12_credential')}
          value={pkcs12Credential}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          title={_('Create a credential')}
          value={[PASSWORD_ONLY_CREDENTIAL_TYPE]}
          onClick={onNewCredentialClick}
        />
      </FormGroup>
      <FormGroup>
        <FileField
          name={prefix('pkcs12')}
          title={_('PKCS12 File')}
          value={pkcs12File}
          onChange={onChange}
        />
      </FormGroup>
    </Layout>
  );
};

export default SourceFireMethodPart;
