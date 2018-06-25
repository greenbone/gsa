/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential.js';

import {render_select_items} from '../../utils/render.js';

import PropTypes from '../../utils/proptypes.js';
import withPrefix from '../../utils/withPrefix.js';

import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import Select from '../../components/form/select.js';
import TextField from '../../components/form/textfield.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import NewIcon from '../../components/icon/newicon.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

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
    cred => cred.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE);
  return (
    <Layout
      flex="column"
      grow="1"
    >
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
            items={render_select_items(credentials)}
            name={prefix + 'tp_sms_credential'}
            value={tpSmsCredential}
            onChange={onCredentialChange}
          />
          <Layout flex box>
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
