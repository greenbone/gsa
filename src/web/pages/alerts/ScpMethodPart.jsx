/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {
  SSH_CREDENTIAL_TYPES,
  ssh_credential_filter,
} from 'gmp/models/credential';
import {selectSaveId} from 'gmp/utils/id';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import {NewIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';
import withPrefix from 'web/utils/withPrefix';
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
  const capabilities = useCapabilities();
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
      <FormGroup direction="row" title={_('Credential')}>
        <Select
          grow="1"
          items={renderSelectItems(credentials)}
          name={prefix + 'scp_credential'}
          value={scpCredential}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          title={_('Create a credential')}
          value={SSH_CREDENTIAL_TYPES}
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
          max={65535}
          min={1}
          name={prefix + 'scp_port'}
          type="int"
          value={scpPort}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Known Hosts')}>
        <TextArea
          cols="50"
          grow="1"
          name={prefix + 'scp_known_hosts'}
          rows="3"
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
          items={renderSelectItems(reportFormats)}
          name={prefix + 'scp_report_format'}
          value={reportFormatIdInState}
          onChange={handleReportFormatIdChange}
        />
        {capabilities.mayOp('get_report_configs') && (
          <>
            <label htmlFor="report-config-select">
              &nbsp; Report Config &nbsp;
            </label>
            <Select
              id="report-config-select"
              items={reportConfigItems}
              name={prefix + 'scp_report_config'}
              value={scpConfigIdInState}
              onChange={handleReportConfigIdChange}
            />
          </>
        )}
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
