/* Copyright (C) 2016-2022 Greenbone AG
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
import React, {useState} from 'react';
import {selectSaveId} from 'gmp/utils/id';

import {
  SSH_CREDENTIAL_TYPES,
  ssh_credential_filter,
} from 'gmp/models/credential';

import PropTypes from 'web/utils/proptypes';

import {renderSelectItems, UNSET_VALUE} from '../../utils/render';
import withPrefix from 'web/utils/withPrefix';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';
import TextField from 'web/components/form/textfield';
import TextArea from 'web/components/form/textarea';

import NewIcon from 'web/components/icon/newicon';

import useTranslation from 'web/hooks/useTranslation';

const ScpMethodPart = ({
  prefix,
  credentials = [],
  reportFormats,
  reportConfigs,
  scpCredential,
  scpHost,
  scpPort,
  scpKnownHosts,
  scpPath,
  scpReportConfig,
  scpReportFormat,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  const [_] = useTranslation();

  const [reportFormatIdInState, setReportFormatId] = useState(
    selectSaveId(reportFormats, scpReportFormat),
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatIdInState === config.report_format._id;
    }),
    UNSET_VALUE,
  );
  const [scpConfigIdInState, setScpConfigId] = useState(
    selectSaveId(reportConfigs, scpReportConfig, UNSET_VALUE),
  );
  const handleReportConfigIdChange = (value, name) => {
    setScpConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value, name) => {
    setScpConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, 'method_data_scp_report_config');
    setReportFormatId(value);
    onChange(value, name);
  };

  credentials = credentials.filter(ssh_credential_filter);
  return (
    <>
      <FormGroup title={_('Credential')} direction="row">
        <Select
          grow="1"
          name={prefix + 'scp_credential'}
          value={scpCredential}
          items={renderSelectItems(credentials)}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          value={SSH_CREDENTIAL_TYPES}
          title={_('Create a credential')}
          onClick={onNewCredentialClick}
        />
      </FormGroup>

      <FormGroup title={_('Host')}>
        <TextField
          grow="1"
          name={prefix + 'scp_host'}
          value={scpHost}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Port')}>
        <Spinner
          name={prefix + 'scp_port'}
          value={scpPort}
          type="int"
          onChange={onChange}
          min={1}
          max={65535}
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
          value={reportFormatIdInState}
          items={renderSelectItems(reportFormats)}
          onChange={handleReportFormatIdChange}
        />
        <label htmlFor="report-config-select">
          &nbsp; Report Config &nbsp;{' '}
        </label>
        <Select
          name={prefix + 'scp_report_config'}
          id="report-config-select"
          value={scpConfigIdInState}
          items={reportConfigItems}
          onChange={handleReportConfigIdChange}
        />
      </FormGroup>
    </>
  );
};

ScpMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
  scpCredential: PropTypes.id,
  scpHost: PropTypes.string.isRequired,
  scpKnownHosts: PropTypes.string.isRequired,
  scpPath: PropTypes.string.isRequired,
  scpPort: PropTypes.number.isRequired,
  scpReportConfig: PropTypes.id,
  scpReportFormat: PropTypes.id,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func.isRequired,
};

export default withPrefix(ScpMethodPart);

// vim: set ts=2 sw=2 tw=80:
