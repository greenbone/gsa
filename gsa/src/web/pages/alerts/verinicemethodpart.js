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

import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

const VERINICE_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

const VeriniceMethodPart = ({
  prefix,
  veriniceServerUrl,
  veriniceServerCredential,
  veriniceServerReportFormat,
  reportFormats = [],
  credentials = [],
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  reportFormats = reportFormats.filter(format => format.extension === 'vna');
  credentials = credentials.filter(
    cred => cred.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('verinice.PRO URL')}>
        <TextField
          grow="1"
          size="30"
          name={prefix + 'verinice_server_url'}
          value={veriniceServerUrl}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Credential')}>
        <Divider>
          <Select
            name={prefix + 'verinice_server_credential'}
            items={renderSelectItems(credentials)}
            value={veriniceServerCredential}
            onChange={onCredentialChange}
          />
          <Layout>
            <NewIcon
              size="small"
              title={_('Create a credential')}
              value={VERINICE_CREDENTIAL_TYPES}
              onClick={onNewCredentialClick}
            />
          </Layout>
        </Divider>
      </FormGroup>

      <FormGroup title={_('verinice.PRO Report')}>
        <Select
          name={prefix + 'verinice_server_report_format'}
          items={renderSelectItems(reportFormats)}
          value={veriniceServerReportFormat}
          onChange={onChange}
        />
      </FormGroup>
    </Layout>
  );
};

VeriniceMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  reportFormats: PropTypes.array,
  veriniceServerCredential: PropTypes.id,
  veriniceServerReportFormat: PropTypes.id,
  veriniceServerUrl: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func.isRequired,
};

export default withPrefix(VeriniceMethodPart);

// vim: set ts=2 sw=2 tw=80:
