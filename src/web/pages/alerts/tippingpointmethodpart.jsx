/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential';

import {renderSelectItems} from 'web/utils/render';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

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
  credentials = credentials.filter(
    cred => cred.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('Hostname / IP')}>
        <TextField
          grow="1"
          size="30"
          name={prefix + 'tp_sms_hostname'}
          value={tpSmsHostname}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Credential')}>
        <Divider>
          <Select
            items={renderSelectItems(credentials)}
            name={prefix + 'tp_sms_credential'}
            value={tpSmsCredential}
            onChange={onCredentialChange}
          />
          <Layout>
            <NewIcon
              size="small"
              title={_('Create a credential')}
              value={TIPPINGPOINT_CREDENTIAL_TYPES}
              onClick={onNewCredentialClick}
            />
          </Layout>
        </Divider>
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
    </Layout>
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

// vim: set ts=2 sw=2 tw=80:
