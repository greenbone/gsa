/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  type default as Credential,
  SSH_CREDENTIAL_TYPES,
  ssh_credential_filter,
} from 'gmp/models/credential';
import type ReportConfig from 'gmp/models/report-config';
import type ReportFormat from 'gmp/models/report-format';
import {selectSaveId} from 'gmp/utils/id';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextArea from 'web/components/form/TextArea';
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

interface ScpMethodPartProps {
  prefix?: string;
  credentials?: Credential[];
  reportFormats?: ReportFormat[];
  reportConfigs?: ReportConfig[];
  scpCredential?: string;
  scpHost?: string;
  scpKnownHosts?: string;
  scpPath?: string;
  scpPort?: number;
  scpReportConfig?: string;
  scpReportFormat?: string;
  onChange: (value: string | number, name?: string) => void;
  onCredentialChange: (value: string, name?: string) => void;
  onNewCredentialClick: () => void;
}

const ScpMethodPart = ({
  prefix: initialPrefix,
  credentials = [],
  reportFormats = [],
  reportConfigs = [],
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
}: ScpMethodPartProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const prefix = addPrefix(initialPrefix);

  const [reportFormatId, setReportFormatId] = useState<string | undefined>(
    selectSaveId(reportFormats, scpReportFormat),
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatId === config.reportFormat?.id;
    }) as RenderSelectItemProps[],
    UNSET_VALUE,
  );
  const [scpConfigId, setScpConfigId] = useState<string>(
    selectSaveId(reportConfigs, scpReportConfig, UNSET_VALUE) as string,
  );
  const handleReportConfigIdChange = (value: string, name?: string) => {
    setScpConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value: string, name?: string) => {
    setScpConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, prefix('scp_report_config'));
    setReportFormatId(value);
    onChange(value, name);
  };

  credentials = credentials.filter(ssh_credential_filter);
  return (
    <>
      <FormGroup
        direction="row"
        htmlFor="scp-credential"
        title={_('Credential')}
      >
        <Select
          grow="1"
          id="scp-credential"
          items={renderSelectItems(credentials as RenderSelectItemProps[])}
          name={prefix('scp_credential')}
          value={scpCredential}
          onChange={onCredentialChange}
        />
        <NewIcon
          aria-label={_('Create a credential')}
          size="small"
          title={_('Create a credential')}
          value={SSH_CREDENTIAL_TYPES}
          onClick={onNewCredentialClick}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('scp_host')}
          title={_('Host')}
          value={scpHost}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <Spinner
          max={65535}
          min={1}
          name={prefix('scp_port')}
          title={_('Port')}
          type="int"
          value={scpPort}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextArea
          cols="50"
          grow="1"
          name={prefix('scp_known_hosts')}
          rows="3"
          title={_('Known Hosts')}
          value={scpKnownHosts}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          name={prefix('scp_path')}
          title={_('Path')}
          value={scpPath}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup htmlFor="scp-report-format" title={_('Report')}>
        <Select
          id="scp-report-format"
          items={renderSelectItems(reportFormats as RenderSelectItemProps[])}
          name={prefix('scp_report_format')}
          value={reportFormatId}
          onChange={handleReportFormatIdChange}
        />
        {capabilities.mayOp('get_report_configs') && (
          <Select
            id="scp-report-config-select"
            items={reportConfigItems}
            label={_('Report Config')}
            name={prefix('scp_report_config')}
            value={scpConfigId}
            onChange={handleReportConfigIdChange}
          />
        )}
      </FormGroup>
    </>
  );
};

export default ScpMethodPart;
