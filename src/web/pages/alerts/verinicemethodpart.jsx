/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {selectSaveId} from 'gmp/utils/id';

import _ from 'gmp/locale';

import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import useCapabilities from "web/hooks/useCapabilities";
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from '../../utils/render';
import withPrefix from 'web/utils/withPrefix';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

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
          value={reportFormatIdInState}
          onChange={handleReportFormatIdChange}
        />
        {
          capabilities.mayOp('get_report_configs') &&
          <>
            <label htmlFor="report-config-select">&nbsp; Report Config &nbsp; </label>
            <Select
              name={prefix + 'verinice_server_report_config'}
              id="report-config-select"
              value={veriniceServerConfigIdInState}
              items={reportConfigItems}
              onChange={handleReportConfigIdChange}
            />
          </>
        }
      </FormGroup>
    </Layout>
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

// vim: set ts=2 sw=2 tw=80:
