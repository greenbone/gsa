/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextArea from 'web/components/form/textarea';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import {VFIRE_CALL_DESCRIPTION} from 'web/pages/alerts/dialog';

const VFIRE_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

const AlembaVfireMethodPart = ({
  credentials,
  prefix,
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
}) => {
  credentials = credentials.filter(
    cred => cred.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('Report Formats')}>
        <MultiSelect
          name={'report_format_ids'}
          items={renderSelectItems(reportFormats)}
          value={reportFormatIds}
          onChange={onReportFormatsChange}
        />
      </FormGroup>

      <FormGroup title={_('Base URL')}>
        <TextField
          grow="1"
          name={prefix + 'vfire_base_url'}
          value={vFireBaseUrl}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Credential')}>
        <Divider>
          <Select
            name={prefix + 'vfire_credential'}
            items={renderSelectItems(credentials)}
            value={vFireCredential}
            onChange={onCredentialChange}
          />
          <Layout>
            <NewIcon
              size="small"
              title={_('Create a credential')}
              value={VFIRE_CREDENTIAL_TYPES}
              onClick={onNewVfireCredentialClick}
            />
          </Layout>
        </Divider>
      </FormGroup>

      <FormGroup title={_('Session Type')}>
        <Radio
          title={_('Analyst')}
          name={prefix + 'vfire_session_type'}
          checked={vFireSessionType === 'Analyst'}
          value="Analyst"
          onChange={onChange}
        />
        <Radio
          title={_('User')}
          name={prefix + 'vfire_session_type'}
          checked={vFireSessionType === 'User'}
          value="User"
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Alemba Client ID')}>
        <TextField
          grow="1"
          name={prefix + 'vfire_client_id'}
          value={vFireClientId}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Partition')}>
        <TextField
          grow="1"
          name={prefix + 'vfire_call_partition_name'}
          value={vFireCallPartitionName}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Call Description')}>
        <TextArea
          grow="1"
          rows="9"
          name={prefix + 'vfire_call_description'}
          value={vFireCallDescription}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Call Template')}>
        <TextField
          grow="1"
          name={prefix + 'vfire_call_template_name'}
          value={vFireCallTemplateName}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Call Type')}>
        <TextField
          grow="1"
          name={prefix + 'vfire_call_type_name'}
          value={vFireCallTypeName}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Impact')}>
        <TextField
          grow="1"
          name={prefix + 'vfire_call_impact_name'}
          value={vFireCallImpactName}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Urgency')}>
        <TextField
          grow="1"
          name={prefix + 'vfire_call_urgency_name'}
          value={vFireCallUrgencyName}
          onChange={onChange}
        />
      </FormGroup>
    </Layout>
  );
};

AlembaVfireMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  reportFormatIds: PropTypes.array,
  reportFormats: PropTypes.array,
  vFireBaseUrl: PropTypes.string,
  vFireCallDescription: PropTypes.string,
  vFireCallImpactName: PropTypes.string,
  vFireCallPartitionName: PropTypes.string,
  vFireCallTemplateName: PropTypes.string,
  vFireCallTypeName: PropTypes.string,
  vFireCallUrgencyName: PropTypes.string,
  vFireClientId: PropTypes.string,
  vFireCredential: PropTypes.string,
  vFireSessionType: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewVfireCredentialClick: PropTypes.func.isRequired,
  onReportFormatsChange: PropTypes.func.isRequired,
};

export default withPrefix(AlembaVfireMethodPart);

// vim: set ts=2 sw=2 tw=80:
