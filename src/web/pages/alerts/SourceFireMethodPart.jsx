/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  PASSWORD_ONLY_CREDENTIAL_TYPE,
  password_only_credential_filter,
} from 'gmp/models/credential';
import React from 'react';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextField from 'web/components/form/TextField';
import NewIcon from 'web/components/icon/NewIcon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';
import withPrefix from 'web/utils/withPrefix';

const SourcefireMethodPart = ({
  credentials,
  pkcs12Credential,
  prefix,
  defenseCenterIp,
  defenseCenterPort,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  const [_] = useTranslation();
  const credentialOptions = credentials.filter(password_only_credential_filter);
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('Defense Center IP')}>
        <TextField
          name={prefix + 'defense_center_ip'}
          size="30"
          value={defenseCenterIp}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Defense Center Port')}>
        <Spinner
          max="65535"
          min="0"
          name={prefix + 'defense_center_port'}
          type="int"
          value={defenseCenterPort}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('PKCS12 Credential')}>
        <Divider>
          <Select
            items={renderSelectItems(credentialOptions, UNSET_VALUE)}
            name={prefix + 'pkcs12_credential'}
            value={pkcs12Credential}
            onChange={onCredentialChange}
          />
          <NewIcon
            size="small"
            title={_('Create a credential')}
            value={[PASSWORD_ONLY_CREDENTIAL_TYPE]}
            onClick={onNewCredentialClick}
          />
        </Divider>
      </FormGroup>

      <FormGroup title={_('PKCS12 File')}>
        <FileField name={prefix + 'pkcs12'} onChange={onChange} />
      </FormGroup>
    </Layout>
  );
};

SourcefireMethodPart.propTypes = {
  credentials: PropTypes.array.isRequired,
  defenseCenterIp: PropTypes.string.isRequired,
  defenseCenterPort: PropTypes.numberOrNumberString.isRequired,
  pkcs12Credential: PropTypes.id,
  prefix: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func.isRequired,
};

export default withPrefix(SourcefireMethodPart);
