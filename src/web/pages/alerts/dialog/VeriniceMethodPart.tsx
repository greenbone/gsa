/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  type default as Credential,
  type CredentialType,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
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

interface VeriniceMethodPartProps {
  prefix?: string;
  credentials?: Credential[];
  reportConfigs?: ReportConfig[];
  reportFormats?: ReportFormat[];
  veriniceServerUrl?: string;
  veriniceServerCredential?: string;
  veriniceServerReportConfig?: string;
  veriniceServerReportFormat?: string;
  onChange: (value: string | number, name?: string) => void;
  onCredentialChange: (value: string, name?: string) => void;
  onNewCredentialClick: (credentialTypes: CredentialType[]) => void;
}

export const VERINICE_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
] as CredentialType[];

const VeriniceMethodPart = ({
  prefix: initialPrefix,
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
}: VeriniceMethodPartProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const prefix = addPrefix(initialPrefix);
  reportFormats = reportFormats.filter(format => format.extension === 'vna');
  credentials = credentials.filter(
    cred => cred.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  const [reportFormatId, setReportFormatId] = useState(
    selectSaveId(reportFormats, veriniceServerReportFormat),
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatId === config.reportFormat?.id;
    }) as RenderSelectItemProps[],
    UNSET_VALUE,
  );
  const [veriniceServerConfigIdInState, setVeriniceServerConfigId] = useState(
    selectSaveId(reportConfigs, veriniceServerReportConfig, UNSET_VALUE),
  );
  const handleReportConfigIdChange = (value: string, name?: string) => {
    setVeriniceServerConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value: string, name?: string) => {
    setVeriniceServerConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, prefix('verinice_server_report_config'));
    setReportFormatId(value);
    onChange(value, name);
  };
  return (
    <>
      <FormGroup>
        <TextField
          grow="1"
          name={prefix('verinice_server_url')}
          title={_('verinice.PRO URL')}
          value={veriniceServerUrl}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup direction="row">
        <Select
          grow="1"
          items={renderSelectItems(credentials as RenderSelectItemProps[])}
          label={_('Credential')}
          name={prefix('verinice_server_credential')}
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

      <FormGroup>
        <Select
          items={renderSelectItems(reportFormats as RenderSelectItemProps[])}
          label={_('verinice.PRO Report')}
          name={prefix('verinice_server_report_format')}
          value={reportFormatId}
          onChange={handleReportFormatIdChange}
        />
        {capabilities.mayOp('get_report_configs') && (
          <Select
            id="report-config-select"
            items={reportConfigItems}
            label={_('Report Config')}
            name={prefix('verinice_server_report_config')}
            value={veriniceServerConfigIdInState}
            onChange={handleReportConfigIdChange}
          />
        )}
      </FormGroup>
    </>
  );
};

export default VeriniceMethodPart;
