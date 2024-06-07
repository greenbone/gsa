/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React, {useState} from 'react';

import {selectSaveId} from 'gmp/utils/id';

import _ from 'gmp/locale';

import {
  isTaskEvent,
  isSecinfoEvent,
  EMAIL_NOTICE_INCLUDE,
  EMAIL_NOTICE_SIMPLE,
  EMAIL_NOTICE_ATTACH,
} from 'gmp/models/alert';
import {
  EMAIL_CREDENTIAL_TYPES,
  email_credential_filter,
} from 'gmp/models/credential';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextArea from 'web/components/form/textarea';
import TextField from 'web/components/form/textfield';
import Radio from 'web/components/form/radio';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';
import withPrefix from 'web/utils/withPrefix';

const EmailMethodPart = ({
  capabilities,
  credentials = [],
  fromAddress,
  event,
  message,
  messageAttach,
  notice,
  noticeAttachFormat,
  noticeReportFormat,
  noticeAttachConfig,
  noticeReportConfig,
  prefix,
  recipientCredential,
  reportConfigs = [],
  reportFormats = [],
  subject,
  toAddress,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  const taskEvent = isTaskEvent(event);
  const secinfoEvent = isSecinfoEvent(event);
  const textReportFormatItems = renderSelectItems(
    reportFormats.filter(
      format =>
        (taskEvent && format.content_type.startsWith('text/')) || !taskEvent,
    ),
  );
  const reportFormatItems = renderSelectItems(reportFormats);
  const [attachFormatIdInState, setAttachFormatId] = useState(
    selectSaveId(reportFormats, noticeAttachFormat),
  );
  const attachConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return attachFormatIdInState === config.report_format._id;
    }),
    UNSET_VALUE,
  );
  const [attachConfigIdInState, setAttachConfigId] = useState(
    selectSaveId(reportConfigs, noticeAttachConfig, UNSET_VALUE),
  );
  const handleAttachConfigIdChange = (value, name) => {
    setAttachConfigId(value);
    onChange(value, name);
  };
  const handleAttachFormatIdChange = (value, name) => {
    setAttachConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, 'method_data_notice_attach_config');
    setAttachFormatId(value);
    onChange(value, name);
  };
  const [reportFormatIdInState, setReportFormatId] = useState(
    selectSaveId(reportFormats, noticeReportFormat),
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatIdInState === config.report_format._id;
    }),
    UNSET_VALUE,
  );
  const [reportConfigIdInState, setReportConfigId] = useState(
    selectSaveId(reportConfigs, noticeReportConfig, UNSET_VALUE),
  );
  const handleReportConfigIdChange = (value, name) => {
    setReportConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value, name) => {
    setReportConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, 'method_data_notice_report_config');
    setReportFormatId(value);
    onChange(value, name);
  };
  credentials = credentials.filter(email_credential_filter);
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('To Address')}>
        <TextField
          grow="1"
          name={prefix + 'to_address'}
          value={toAddress}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('From Address')}>
        <TextField
          grow="1"
          name={prefix + 'from_address'}
          value={fromAddress}
          onChange={onChange}
        />
      </FormGroup>

      {(taskEvent || secinfoEvent) && (
        <FormGroup title={_('Subject')}>
          <TextField
            grow="1"
            name={prefix + 'subject'}
            size="30"
            value={subject}
            onChange={onChange}
          />
        </FormGroup>
      )}

      <FormGroup title={_('Email Encryption')}>
        <IconDivider>
          <Select
            name={prefix + 'recipient_credential'}
            value={recipientCredential}
            items={renderSelectItems(credentials, UNSET_VALUE)}
            onChange={onCredentialChange}
          />
          <NewIcon
            size="small"
            value={EMAIL_CREDENTIAL_TYPES}
            title={_('Create a credential')}
            onClick={onNewCredentialClick}
          />
        </IconDivider>
      </FormGroup>

      {(taskEvent || secinfoEvent) && (
        <FormGroup title={_('Content')} flex="column">
          <Divider flex="column" grow="1">
            <Radio
              title={_('Simple Notice')}
              name={prefix + 'notice'}
              checked={notice === EMAIL_NOTICE_SIMPLE}
              value="1"
              onChange={onChange}
            />

            {capabilities.mayOp('get_report_formats') && (
              <Layout flex="column">
                <Divider>
                  <Radio
                    name={prefix + 'notice'}
                    title={
                      taskEvent
                        ? _('Include report')
                        : _('Include list of resources with message:')
                    }
                    checked={notice === EMAIL_NOTICE_INCLUDE}
                    value="0"
                    onChange={onChange}
                  />
                  {taskEvent && (
                    <Select
                      disabled={notice !== EMAIL_NOTICE_INCLUDE}
                      name={prefix + 'notice_report_format'}
                      value={reportFormatIdInState}
                      items={textReportFormatItems}
                      onChange={handleReportFormatIdChange}
                    />
                  )}

                  <label htmlFor="report-config-select">Report Config</label>
                  <Select
                    disabled={notice !== EMAIL_NOTICE_INCLUDE}
                    name={prefix + 'notice_report_config'}
                    id="report-config-select"
                    value={reportConfigIdInState}
                    items={reportConfigItems}
                    onChange={handleReportConfigIdChange}
                  />
                </Divider>

                <TextArea
                  disabled={notice !== EMAIL_NOTICE_INCLUDE}
                  name={prefix + 'message'}
                  rows="8"
                  cols="50"
                  title={
                    notice === EMAIL_NOTICE_INCLUDE
                      ? undefined
                      : _('Activate the "include" option to make changes here.')
                  }
                  value={message}
                  onChange={onChange}
                />
              </Layout>
            )}

            {capabilities.mayOp('get_report_formats') && (
              <Layout flex="column">
                <Layout>
                  <Divider>
                    <Radio
                      name={prefix + 'notice'}
                      title={
                        taskEvent
                          ? _('Attach report')
                          : _('Attach list of resources with message:')
                      }
                      checked={notice === EMAIL_NOTICE_ATTACH}
                      value="2"
                      onChange={onChange}
                    />
                    {taskEvent && (
                      <Select
                        disabled={notice !== EMAIL_NOTICE_ATTACH}
                        name={prefix + 'notice_attach_format'}
                        value={attachFormatIdInState}
                        items={reportFormatItems}
                        onChange={handleAttachFormatIdChange}
                      />
                    )}
                    <label htmlFor="attach-config-select">Report Config</label>
                    <Select
                      disabled={notice !== EMAIL_NOTICE_ATTACH}
                      name={prefix + 'notice_attach_config'}
                      id="attach-config-select"
                      value={attachConfigIdInState}
                      items={attachConfigItems}
                      onChange={handleAttachConfigIdChange}
                    />
                  </Divider>
                </Layout>
                <TextArea
                  disabled={notice !== EMAIL_NOTICE_ATTACH}
                  name={prefix + 'message_attach'}
                  rows="8"
                  cols="50"
                  title={
                    notice === EMAIL_NOTICE_ATTACH
                      ? undefined
                      : _('Activate the "attach" option to allow changes here.')
                  }
                  value={messageAttach}
                  onChange={onChange}
                />
              </Layout>
            )}
          </Divider>
        </FormGroup>
      )}
    </Layout>
  );
};

EmailMethodPart.propTypes = {
  attachConfigItems: PropTypes.array,
  capabilities: PropTypes.capabilities.isRequired,
  credentials: PropTypes.array,
  event: PropTypes.string.isRequired,
  fromAddress: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  messageAttach: PropTypes.string.isRequired,
  notice: PropTypes.string.isRequired,
  noticeAttachConfig: PropTypes.id,
  noticeAttachFormat: PropTypes.id,
  noticeReportConfig: PropTypes.id,
  noticeReportFormat: PropTypes.id,
  prefix: PropTypes.string.isRequired,
  recipientCredential: PropTypes.id,
  reportConfigItems: PropTypes.array,
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
  subject: PropTypes.string.isRequired,
  toAddress: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onCredentialChange: PropTypes.func,
  onNewCredentialClick: PropTypes.func,
};

export default compose(withCapabilities, withPrefix)(EmailMethodPart);

// vim: set ts=2 sw=2 tw=80:
