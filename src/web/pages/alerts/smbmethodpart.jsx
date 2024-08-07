/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {selectSaveId} from 'gmp/utils/id';

import _ from 'gmp/locale';
import {_l} from 'gmp/locale/lang';

import {
  SMB_CREDENTIAL_TYPES,
  smb_credential_filter,
} from 'gmp/models/credential';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import useCapabilities from "web/hooks/useCapabilities";
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

const smbMaxProtocolItems = [
  {label: _l('Default'), value: ''},
  {label: 'NT1', value: 'NT1'},
  {label: 'SMB2', value: 'SMB2'},
  {label: 'SMB3', value: 'SMB3'},
];

const SmbMethodPart = ({
  prefix,
  credentials = [],
  reportConfigs,
  reportFormats,
  smbCredential,
  smbFilePath,
  smbMaxProtocol,
  smbReportConfig,
  smbReportFormat,
  smbSharePath,
  onChange,
  onNewCredentialClick,
  onCredentialChange,
}) => {
  const capabilities = useCapabilities();
  const [reportFormatIdInState, setReportFormatId] = useState(
    selectSaveId(reportFormats, smbReportFormat),
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatIdInState === config.report_format._id;
    }),
    UNSET_VALUE,
  );
  const [smbConfigIdInState, setSmbConfigId] = useState(
    selectSaveId(reportConfigs, smbReportConfig, UNSET_VALUE),
  );
  const handleReportConfigIdChange = (value, name) => {
    setSmbConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value, name) => {
    setSmbConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, 'method_data_smb_report_config');
    setReportFormatId(value);
    onChange(value, name);
  };
  credentials = credentials.filter(smb_credential_filter);
  return (
    <Layout flex="column" grow="1">
      <FormGroup title=" ">
        <span>
          {_(
            'Security note: The SMB protocol does not offer a ' +
              'fingerprint to establish complete mutual trust. Thus a ' +
              'man-in-the-middle attack can not be fully prevented.',
          )}
        </span>
      </FormGroup>

      <FormGroup title={_('Credential')}>
        <Divider>
          <Select
            name={prefix + 'smb_credential'}
            items={renderSelectItems(credentials)}
            value={smbCredential}
            onChange={onCredentialChange}
          />
          <Layout>
            <NewIcon
              size="small"
              value={SMB_CREDENTIAL_TYPES}
              title={_('Create a credential')}
              onClick={onNewCredentialClick}
            />
          </Layout>
        </Divider>
      </FormGroup>

      <FormGroup title={_('Share path')}>
        <TextField
          grow="1"
          name={prefix + 'smb_share_path'}
          value={smbSharePath}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('File path')}>
        <TextField
          grow="1"
          name={prefix + 'smb_file_path'}
          value={smbFilePath}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Report Format')}>
        <Select
          name={prefix + 'smb_report_format'}
          items={renderSelectItems(reportFormats)}
          value={reportFormatIdInState}
          onChange={handleReportFormatIdChange}
        />
        {
          capabilities.mayOp('get_report_configs') &&
          <>
            <label htmlFor="report-config-select">&nbsp; Report Config &nbsp; </label>
            <Select
              name={prefix + 'smb_report_config'}
              id="report-config-select"
              value={smbConfigIdInState}
              items={reportConfigItems}
              onChange={handleReportConfigIdChange}
            />
          </>
        }
      </FormGroup>

      <FormGroup title={_('Max Protocol')}>
        <Select
          name={prefix + 'smb_max_protocol'}
          items={smbMaxProtocolItems}
          value={smbMaxProtocol}
          onChange={onChange}
        />
      </FormGroup>
    </Layout>
  );
};

SmbMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
  smbCredential: PropTypes.id,
  smbFilePath: PropTypes.string.isRequired,
  smbMaxProtocol: PropTypes.string,
  smbReportConfig: PropTypes.id,
  smbReportFormat: PropTypes.id,
  smbSharePath: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func.isRequired,
};

export default withPrefix(SmbMethodPart);

// vim: set ts=2 sw=2 tw=80:
