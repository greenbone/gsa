/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  type default as Credential,
  SMB_CREDENTIAL_TYPES,
  smb_credential_filter,
} from 'gmp/models/credential';
import type ReportConfig from 'gmp/models/report-config';
import type ReportFormat from 'gmp/models/report-format';
import {selectSaveId} from 'gmp/utils/id';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {NewIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import addPrefix from 'web/utils/add-prefix';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

interface SmbMethodPartProps {
  prefix?: string;
  credentials?: Credential[];
  reportConfigs?: ReportConfig[];
  reportFormats?: ReportFormat[];
  smbCredential?: string;
  smbSharePath?: string;
  smbFilePath?: string;
  smbMaxProtocol?: string;
  smbReportConfig?: string;
  smbReportFormat?: string;
  onChange: (value: string | number, name?: string) => void;
  onCredentialChange: (value: string, name?: string) => void;
  onNewCredentialClick: () => void;
}

const SmbMethodPart = ({
  prefix: initialPrefix,
  credentials = [],
  reportConfigs = [],
  reportFormats = [],
  smbCredential,
  smbFilePath,
  smbMaxProtocol,
  smbReportConfig,
  smbReportFormat,
  smbSharePath,
  onChange,
  onNewCredentialClick,
  onCredentialChange,
}: SmbMethodPartProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const [reportFormatId, setReportFormatId] = useState(
    selectSaveId(reportFormats, smbReportFormat),
  );
  const prefix = addPrefix(initialPrefix);
  const [smbConfigId, setSmbConfigId] = useState(
    selectSaveId(reportConfigs, smbReportConfig, UNSET_VALUE),
  );

  const handleReportConfigIdChange = (value: string, name?: string) => {
    setSmbConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value: string, name?: string) => {
    setSmbConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, prefix('smb_report_config'));
    setReportFormatId(value);
    onChange(value, name);
  };

  const smbMaxProtocolItems = [
    {label: _('Default'), value: ''},
    {label: 'NT1', value: 'NT1'},
    {label: 'SMB2', value: 'SMB2'},
    {label: 'SMB3', value: 'SMB3'},
  ];
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatId === config.reportFormat?.id;
    }) as RenderSelectItemProps[],
    UNSET_VALUE,
  );
  credentials = credentials.filter(smb_credential_filter);
  return (
    <>
      <FormGroup title=" ">
        <span>
          {_(
            'Security note: The SMB protocol does not offer a ' +
              'fingerprint to establish complete mutual trust. Thus a ' +
              'man-in-the-middle attack can not be fully prevented.',
          )}
        </span>
      </FormGroup>

      <FormGroup
        direction="row"
        htmlFor="smb-credential"
        title={_('Credential')}
      >
        <Select
          grow="1"
          id="smb-credential"
          items={renderSelectItems(credentials as RenderSelectItemProps[])}
          name={prefix('smb_credential')}
          value={smbCredential}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          title={_('Create a credential')}
          value={SMB_CREDENTIAL_TYPES}
          onClick={onNewCredentialClick}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('smb_share_path')}
          title={_('Share path')}
          value={smbSharePath}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('smb_file_path')}
          title={_('File path')}
          value={smbFilePath}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <Select
          items={renderSelectItems(reportFormats as RenderSelectItemProps[])}
          label={_('Report Format')}
          name={prefix('smb_report_format')}
          value={reportFormatId}
          onChange={handleReportFormatIdChange}
        />
        {capabilities.mayOp('get_report_configs') && (
          <Select
            items={reportConfigItems}
            label={_('Report Config')}
            name={prefix('smb_report_config')}
            value={smbConfigId}
            onChange={handleReportConfigIdChange}
          />
        )}
      </FormGroup>

      <FormGroup>
        <Select
          items={smbMaxProtocolItems}
          label={_('Max Protocol')}
          name={prefix('smb_max_protocol')}
          value={smbMaxProtocol}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

export default SmbMethodPart;
