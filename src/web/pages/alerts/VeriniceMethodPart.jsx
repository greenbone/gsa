/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential';
import {selectSaveId} from 'gmp/utils/id';
import React, {useState} from 'react';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import { NewIcon } from 'web/components/icon/icons';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';
import withPrefix from 'web/utils/withPrefix';
const VERINICE_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

const VeriniceMethodPart = ({
  prefix,
  veriniceServerUrl,
  veriniceServerCredential,
  veriniceServerReportConfig,
  veriniceServerReportFormat,
  reportConfigs = [],
  reportFormats = [],
  credentials = [],
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  reportFormats = reportFormats.filter(format => format.extension === 'vna');
  credentials = credentials.filter(
    cred => cred.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  const [reportFormatIdInState, setReportFormatId] = useState(
    selectSaveId(reportFormats, veriniceServerReportFormat),
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatIdInState === config.report_format._id;
    }),
    UNSET_VALUE,
  );
  const [veriniceServerConfigIdInState, setVeriniceServerConfigId] = useState(
    selectSaveId(reportConfigs, veriniceServerReportConfig, UNSET_VALUE),
  );
  const handleReportConfigIdChange = (value, name) => {
    setVeriniceServerConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value, name) => {
    setVeriniceServerConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, 'method_data_verinice_server_report_config');
    setReportFormatId(value);
    onChange(value, name);
  };
  return (
    <>
      <FormGroup title={_('verinice.PRO URL')}>
        <TextField
          grow="1"
          name={prefix + 'verinice_server_url'}
          value={veriniceServerUrl}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup direction="row" title={_('Credential')}>
        <Select
          grow="1"
          items={renderSelectItems(credentials)}
          name={prefix + 'verinice_server_credential'}
          value={veriniceServerCredential}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          title={_('Create a credential')}
          value={VERINICE_CREDENTIAL_TYPES}
          onClick={onNewCredentialClick}
        />
      </FormGroup>

      <FormGroup title={_('verinice.PRO Report')}>
        <Select
          items={renderSelectItems(reportFormats)}
          name={prefix + 'verinice_server_report_format'}
          value={reportFormatIdInState}
          onChange={handleReportFormatIdChange}
        />
        {capabilities.mayOp('get_report_configs') && (
          <>
            <label htmlFor="report-config-select">
              &nbsp; Report Config &nbsp;{' '}
            </label>
            <Select
              id="report-config-select"
              items={reportConfigItems}
              name={prefix + 'verinice_server_report_config'}
              value={veriniceServerConfigIdInState}
              onChange={handleReportConfigIdChange}
            />
          </>
        )}
      </FormGroup>
    </>
  );
};

VeriniceMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
  veriniceServerCredential: PropTypes.id,
  veriniceServerReportConfig: PropTypes.id,
  veriniceServerReportFormat: PropTypes.id,
  veriniceServerUrl: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func.isRequired,
};

export default withPrefix(VeriniceMethodPart);
