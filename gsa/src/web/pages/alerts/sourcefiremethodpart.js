/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {
  PASSWORD_ONLY_CREDENTIAL_TYPE,
  password_only_credential_filter,
} from 'gmp/models/credential';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import FileField from 'web/components/form/filefield';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';
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
  const credentialOptions = credentials.filter(password_only_credential_filter);
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('Defense Center IP')}>
        <TextField
          size="30"
          name={prefix + 'defense_center_ip'}
          value={defenseCenterIp}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Defense Center Port')}>
        <Spinner
          name={prefix + 'defense_center_port'}
          value={defenseCenterPort}
          type="int"
          max="65535"
          min="0"
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('PKCS12 Credential')}>
        <Divider>
          <Select
            name={prefix + 'pkcs12_credential'}
            items={renderSelectItems(credentialOptions, UNSET_VALUE)}
            value={pkcs12Credential}
            onChange={onCredentialChange}
          />
          <NewIcon
            size="small"
            value={[PASSWORD_ONLY_CREDENTIAL_TYPE]}
            title={_('Create a credential')}
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

// vim: set ts=2 sw=2 tw=80:
