/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as Credential,
  type CredentialType,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import type ReportFormat from 'gmp/models/report-format';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import {NewIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import {VFIRE_CALL_DESCRIPTION} from 'web/pages/alerts/Dialog';
import addPrefix from 'web/utils/add-prefix';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface AlembavFireMethodPartProps {
  prefix?: string;
  credentials?: Credential[];
  reportFormats?: ReportFormat[];
  reportFormatIds?: string[];
  vFireBaseUrl?: string;
  vFireCallDescription?: string;
  vFireCallImpactName?: string;
  vFireCallPartitionName?: string;
  vFireCallTemplateName?: string;
  vFireCallTypeName?: string;
  vFireCallUrgencyName?: string;
  vFireClientId?: string;
  vFireCredential?: string;
  vFireSessionType?: string;
  onChange: (value: string | undefined, name?: string) => void;
  onCredentialChange: (value: string, name?: string) => void;
  onNewVfireCredentialClick: (credentialTypes: CredentialType[]) => void;
  onReportFormatsChange: (value: string[], name?: string) => void;
}

const VFIRE_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
] as CredentialType[];

const AlembavFireMethodPart = ({
  credentials = [],
  prefix: initialPrefix,
  reportFormats = [],
  reportFormatIds = [],
  vFireBaseUrl,
  vFireCallDescription = VFIRE_CALL_DESCRIPTION,
  vFireCallImpactName,
  vFireCallPartitionName,
  vFireCallTemplateName,
  vFireCallTypeName,
  vFireCallUrgencyName,
  vFireClientId,
  vFireCredential,
  vFireSessionType = 'Analyst',
  onChange,
  onCredentialChange,
  onNewVfireCredentialClick,
  onReportFormatsChange,
}: AlembavFireMethodPartProps) => {
  const [_] = useTranslation();
  const prefix = addPrefix(initialPrefix);
  credentials = credentials.filter(
    cred => cred.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  return (
    <>
      <FormGroup>
        <MultiSelect
          items={renderSelectItems(reportFormats as RenderSelectItemProps[])}
          label={_('Report Formats')}
          name={'report_format_ids'}
          value={reportFormatIds}
          onChange={onReportFormatsChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('vfire_base_url')}
          title={_('Base URL')}
          value={vFireBaseUrl}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup
        direction="row"
        htmlFor="vfire-credential"
        title={_('Credential')}
      >
        <Select
          grow="1"
          id="vfire-credential"
          items={renderSelectItems(credentials as RenderSelectItemProps[])}
          name={prefix('vfire_credential')}
          value={vFireCredential}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          title={_('Create a credential')}
          value={VFIRE_CREDENTIAL_TYPES}
          onClick={onNewVfireCredentialClick}
        />
      </FormGroup>

      <FormGroup direction="row" title={_('Session Type')}>
        <Radio
          checked={vFireSessionType === 'Analyst'}
          name={prefix('vfire_session_type')}
          title={_('Analyst')}
          value="Analyst"
          onChange={onChange}
        />
        <Radio
          checked={vFireSessionType === 'User'}
          name={prefix('vfire_session_type')}
          title={_('User')}
          value="User"
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('vfire_client_id')}
          title={_('Alemba Client ID')}
          value={vFireClientId}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('vfire_call_partition_name')}
          title={_('Partition')}
          value={vFireCallPartitionName}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextArea
          grow="1"
          name={prefix('vfire_call_description')}
          rows="9"
          title={_('Call Description')}
          value={vFireCallDescription}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('vfire_call_template_name')}
          title={_('Call Template')}
          value={vFireCallTemplateName}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('vfire_call_type_name')}
          title={_('Call Type')}
          value={vFireCallTypeName}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('vfire_call_impact_name')}
          title={_('Impact')}
          value={vFireCallImpactName}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('vfire_call_urgency_name')}
          title={_('Urgency')}
          value={vFireCallUrgencyName}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

export default AlembavFireMethodPart;
