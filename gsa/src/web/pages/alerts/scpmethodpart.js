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
  SSH_CREDENTIAL_TYPES,
  ssh_credential_filter,
} from 'gmp/models/credential';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import TextArea from 'web/components/form/textarea';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import NewIcon from 'web/components/icon/newicon';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

const ScpMethodPart = ({
  prefix,
  credentials = [],
  reportFormats,
  scpCredential,
  scpHost,
  scpKnownHosts,
  scpPath,
  scpReportFormat,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  credentials = credentials.filter(ssh_credential_filter);
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('Credential')}>
        <Divider>
          <Select
            name={prefix + 'scp_credential'}
            value={scpCredential}
            items={renderSelectItems(credentials)}
            onChange={onCredentialChange}
          />
          <Layout>
            <NewIcon
              size="small"
              value={SSH_CREDENTIAL_TYPES}
              title={_('Create a credential')}
              onClick={onNewCredentialClick}
            />
          </Layout>
        </Divider>
      </FormGroup>

      <FormGroup title={_('Host')}>
        <TextField
          grow="1"
          name={prefix + 'scp_host'}
          value={scpHost}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Known Hosts')}>
        <TextArea
          grow="1"
          rows="3"
          cols="50"
          name={prefix + 'scp_known_hosts'}
          value={scpKnownHosts}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Path')}>
        <TextField
          name={prefix + 'scp_path'}
          value={scpPath}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Report')}>
        <Select
          name={prefix + 'scp_report_format'}
          value={scpReportFormat}
          items={renderSelectItems(reportFormats)}
          onChange={onChange}
        />
      </FormGroup>
    </Layout>
  );
};

ScpMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  reportFormats: PropTypes.array,
  scpCredential: PropTypes.id,
  scpHost: PropTypes.string.isRequired,
  scpKnownHosts: PropTypes.string.isRequired,
  scpPath: PropTypes.string.isRequired,
  scpReportFormat: PropTypes.id,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func.isRequired,
};

export default withPrefix(ScpMethodPart);

// vim: set ts=2 sw=2 tw=80:
