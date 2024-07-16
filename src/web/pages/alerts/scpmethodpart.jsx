/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {selectSaveId} from 'gmp/utils/id';

import _ from 'gmp/locale';

import {
  SSH_CREDENTIAL_TYPES,
  ssh_credential_filter,
} from 'gmp/models/credential';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import {renderSelectItems, UNSET_VALUE} from '../../utils/render';
import withPrefix from 'web/utils/withPrefix';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';
import TextField from 'web/components/form/textfield';
import TextArea from 'web/components/form/textarea';

import NewIcon from 'web/components/icon/newicon';

const ScpMethodPart = ({
  prefix,
  capabilities,
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
        {
          capabilities.mayOp('get_report_configs') &&
          <>
            <label htmlFor="report-config-select">&nbsp; Report Config &nbsp; </label>
            <Select
              name={prefix + 'scp_report_config'}
              id="report-config-select"
              value={scpConfigIdInState}
              items={reportConfigItems}
              onChange={handleReportConfigIdChange}
            />
          </>
        }
      </FormGroup>
    </Layout>
  );
};

ScpMethodPart.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
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
