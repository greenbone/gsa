/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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
import {selectSaveId} from 'gmp/utils/id';
import React, {useState} from 'react';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import TextArea from 'web/components/form/textarea';
import TextField from 'web/components/form/textfield';
import NewIcon from 'web/components/icon/newicon';
import Row from 'web/components/layout/row';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

const EmailMethodPart = ({
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
  const [_] = useTranslation();
  const capabilities = useCapabilities();
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
    <>
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

      <FormGroup direction="row" title={_('Email Encryption')}>
        <Select
          grow="1"
          items={renderSelectItems(credentials, UNSET_VALUE)}
          name={prefix + 'recipient_credential'}
          value={recipientCredential}
          onChange={onCredentialChange}
        />
        <NewIcon
          size="small"
          title={_('Create a credential')}
          value={EMAIL_CREDENTIAL_TYPES}
          onClick={onNewCredentialClick}
        />
      </FormGroup>

      {(taskEvent || secinfoEvent) && (
        <FormGroup title={_('Content')}>
          <Radio
            checked={notice === EMAIL_NOTICE_SIMPLE}
            name={prefix + 'notice'}
            title={_('Simple Notice')}
            value="1"
            onChange={onChange}
          />

          {capabilities.mayOp('get_report_formats') && (
            <>
              <Row>
                <Radio
                  checked={notice === EMAIL_NOTICE_INCLUDE}
                  name={prefix + 'notice'}
                  title={
                    taskEvent
                      ? _('Include report')
                      : _('Include list of resources with message:')
                  }
                  value="0"
                  onChange={onChange}
                />
                {taskEvent && (
                  <Select
                    disabled={notice !== EMAIL_NOTICE_INCLUDE}
                    grow="1"
                    items={textReportFormatItems}
                    name={prefix + 'notice_report_format'}
                    value={reportFormatIdInState}
                    onChange={handleReportFormatIdChange}
                  />
                )}

                {capabilities.mayOp('get_report_configs') && (
                  <>
                    <label htmlFor="report-config-select">Report Config</label>
                    <Select
                      disabled={notice !== EMAIL_NOTICE_INCLUDE}
                      id="report-config-select"
                      items={reportConfigItems}
                      name={prefix + 'notice_report_config'}
                      value={reportConfigIdInState}
                      onChange={handleReportConfigIdChange}
                    />
                  </>
                )}
              </Row>
              <TextArea
                cols="50"
                disabled={notice !== EMAIL_NOTICE_INCLUDE}
                name={prefix + 'message'}
                rows="8"
                title={
                  notice === EMAIL_NOTICE_INCLUDE
                    ? undefined
                    : _('Activate the "include" option to make changes here.')
                }
                value={message}
                onChange={onChange}
              />
            </>
          )}

          {capabilities.mayOp('get_report_formats') && (
            <>
              <Row>
                <Radio
                  checked={notice === EMAIL_NOTICE_ATTACH}
                  name={prefix + 'notice'}
                  title={
                    taskEvent
                      ? _('Attach report')
                      : _('Attach list of resources with message:')
                  }
                  value="2"
                  onChange={onChange}
                />
                {taskEvent && (
                  <Select
                    disabled={notice !== EMAIL_NOTICE_ATTACH}
                    grow="1"
                    items={reportFormatItems}
                    name={prefix + 'notice_attach_format'}
                    value={attachFormatIdInState}
                    onChange={handleAttachFormatIdChange}
                  />
                )}
                {capabilities.mayOp('get_report_configs') && (
                  <>
                    <label htmlFor="attach-config-select">Report Config</label>
                    <Select
                      disabled={notice !== EMAIL_NOTICE_ATTACH}
                      id="attach-config-select"
                      items={attachConfigItems}
                      name={prefix + 'notice_attach_config'}
                      value={attachConfigIdInState}
                      onChange={handleAttachConfigIdChange}
                    />
                  </>
                )}
              </Row>
              <TextArea
                cols="50"
                disabled={notice !== EMAIL_NOTICE_ATTACH}
                name={prefix + 'message_attach'}
                rows="8"
                title={
                  notice === EMAIL_NOTICE_ATTACH
                    ? undefined
                    : _('Activate the "attach" option to allow changes here.')
                }
                value={messageAttach}
                onChange={onChange}
              />
            </>
          )}
        </FormGroup>
      )}
    </>
  );
};

EmailMethodPart.propTypes = {
  attachConfigItems: PropTypes.array,
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

export default withPrefix(EmailMethodPart);
