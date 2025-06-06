/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {NewIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';
import withPrefix from 'web/utils/withPrefix';
const TIPPINGPOINT_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

const TippingPointMethodPart = ({
  credentials = [],
  prefix,
  tpSmsCredential,
  tpSmsHostname,
  tpSmsTlsWorkaround,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  const [_] = useTranslation();
  credentials = credentials.filter(
    cred => cred.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  return (
    <>
      <FormGroup title={_('Hostname / IP')}>
        <TextField
          grow="1"
          name={prefix + 'tp_sms_hostname'}
          value={tpSmsHostname}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup direction="row" title={_('Credential')}>
        <Select
          grow="1"
          items={renderSelectItems(credentials)}
          name={prefix + 'tp_sms_credential'}
          value={tpSmsCredential}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          title={_('Create a credential')}
          value={TIPPINGPOINT_CREDENTIAL_TYPES}
          onClick={onNewCredentialClick}
        />
      </FormGroup>
      <FormGroup title={_('SSL / TLS Certificate')}>
        <FileField
          name={prefix + 'tp_sms_tls_certificate'}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Use workaround for default certificate')}>
        <YesNoRadio
          name={prefix + 'tp_sms_tls_workaround'}
          value={tpSmsTlsWorkaround}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

TippingPointMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  tpSmsCredential: PropTypes.id,
  tpSmsHostname: PropTypes.string,
  tpSmsTlsWorkaround: PropTypes.yesno.isRequired,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func.isRequired,
};

export default withPrefix(TippingPointMethodPart);
