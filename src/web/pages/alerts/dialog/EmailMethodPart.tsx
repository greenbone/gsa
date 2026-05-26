/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  isTaskEvent,
  isSecinfoEvent,
  EMAIL_NOTICE_INCLUDE,
  EMAIL_NOTICE_SIMPLE,
  EMAIL_NOTICE_ATTACH,
  type AlertEventType,
  type AlertMethodNoticeType,
} from 'gmp/models/alert';
import {
  type default as Credential,
  EMAIL_CREDENTIAL_TYPES,
  email_credential_filter,
} from 'gmp/models/credential';
import type ReportConfig from 'gmp/models/report-config';
import type ReportFormat from 'gmp/models/report-format';
import {selectSaveId} from 'gmp/utils/id';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import {NewIcon} from 'web/components/icon';
import Row from 'web/components/layout/Row';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import addPrefix from 'web/utils/add-prefix';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

interface EmailMethodPartProps {
  credentials?: Credential[];
  event: AlertEventType;
  fromAddress?: string;
  message?: string;
  messageAttach?: string;
  notice: AlertMethodNoticeType;
  noticeAttachConfig?: string;
  noticeAttachFormat?: string;
  noticeReportConfig?: string;
  noticeReportFormat?: string;
  prefix?: string;
  recipientCredential?: string;
  reportConfigs?: ReportConfig[];
  reportFormats?: ReportFormat[];
  subject?: string;
  toAddress?: string;
  onChange: (value: string, name?: string) => void;
  onCredentialChange: (value: string, name?: string) => void;
  onNewCredentialClick: () => void;
}

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
  prefix: initialPrefix,
  recipientCredential,
  reportConfigs = [],
  reportFormats = [],
  subject,
  toAddress,
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}: EmailMethodPartProps) => {
  const prefix = addPrefix(initialPrefix);
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const taskEvent = isTaskEvent(event);
  const secinfoEvent = isSecinfoEvent(event);
  const [reportConfigId, setReportConfigId] = useState<string>(
    selectSaveId(reportConfigs, noticeReportConfig, UNSET_VALUE) as string,
  );
  const [attachFormatId, setAttachFormatId] = useState(
    selectSaveId(reportFormats, noticeAttachFormat),
  );
  const textReportFormats = reportFormats.filter(
    format =>
      (taskEvent && format.content_type?.startsWith('text/')) || !taskEvent,
  );
  const textReportFormatItems = renderSelectItems(
    textReportFormats as RenderSelectItemProps[],
  );
  const reportFormatItems = renderSelectItems(
    reportFormats as RenderSelectItemProps[],
  );
  const attachReportConfigs = reportConfigs.filter(config => {
    return attachFormatId === config.reportFormat?.id;
  });
  const attachConfigItems = renderSelectItems(
    attachReportConfigs as RenderSelectItemProps[],
    UNSET_VALUE,
  );
  const [attachConfigId, setAttachConfigId] = useState<string>(
    selectSaveId(reportConfigs, noticeAttachConfig, UNSET_VALUE) as string,
  );
  const handleAttachConfigIdChange = (value: string, name?: string) => {
    setAttachConfigId(value);
    onChange(value, name);
  };
  const handleAttachFormatIdChange = (value: string, name?: string) => {
    setAttachConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, prefix('notice_attach_config'));
    setAttachFormatId(value);
    onChange(value, name);
  };
  const [reportFormatId, setReportFormatId] = useState<string>(
    selectSaveId(reportFormats, noticeReportFormat) as string,
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatId === config.reportFormat?.id;
    }) as RenderSelectItemProps[],
    UNSET_VALUE,
  );
  const handleReportConfigIdChange = (value: string, name?: string) => {
    setReportConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value: string, name?: string) => {
    setReportConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, prefix('notice_report_config'));
    setReportFormatId(value);
    onChange(value, name);
  };
  credentials = credentials.filter(email_credential_filter);
  return (
    <>
      <FormGroup>
        <TextField
          grow="1"
          name={prefix('to_address')}
          title={_('To Address')}
          value={toAddress}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          grow="1"
          name={prefix('from_address')}
          title={_('From Address')}
          value={fromAddress}
          onChange={onChange}
        />
      </FormGroup>

      {(taskEvent || secinfoEvent) && (
        <FormGroup>
          <TextField
            grow="1"
            name={prefix('subject')}
            title={_('Subject')}
            value={subject}
            onChange={onChange}
          />
        </FormGroup>
      )}

      <FormGroup
        direction="row"
        htmlFor="email-encryption-credential"
        title={_('Email Encryption')}
      >
        <Select
          grow="1"
          id="email-encryption-credential"
          items={renderSelectItems(
            credentials as RenderSelectItemProps[],
            UNSET_VALUE,
          )}
          name={prefix('recipient_credential')}
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
            name={prefix('notice')}
            title={_('Simple Notice')}
            value="1"
            onChange={onChange}
          />

          {capabilities.mayOp('get_report_formats') && (
            <>
              <Row>
                <Radio
                  checked={notice === EMAIL_NOTICE_INCLUDE}
                  name={prefix('notice')}
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
                    aria-label="Include Report Format"
                    disabled={notice !== EMAIL_NOTICE_INCLUDE}
                    grow="1"
                    items={textReportFormatItems}
                    name={prefix('notice_report_format')}
                    value={reportFormatId}
                    onChange={handleReportFormatIdChange}
                  />
                )}

                {capabilities.mayOp('get_report_configs') && (
                  <Select
                    aria-label="Include Report Config"
                    disabled={notice !== EMAIL_NOTICE_INCLUDE}
                    id="report-config-select"
                    items={reportConfigItems}
                    label={_('Report Config')}
                    name={prefix('notice_report_config')}
                    value={reportConfigId}
                    onChange={handleReportConfigIdChange}
                  />
                )}
              </Row>
              <TextArea
                cols="50"
                disabled={notice !== EMAIL_NOTICE_INCLUDE}
                name={prefix('message')}
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
                  name={prefix('notice')}
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
                    aria-label="Attach Report Format"
                    disabled={notice !== EMAIL_NOTICE_ATTACH}
                    grow="1"
                    items={reportFormatItems}
                    name={prefix('notice_attach_format')}
                    value={attachFormatId}
                    onChange={handleAttachFormatIdChange}
                  />
                )}
                {capabilities.mayOp('get_report_configs') && (
                  <Select
                    disabled={notice !== EMAIL_NOTICE_ATTACH}
                    items={attachConfigItems}
                    label="Report Config"
                    name={prefix('notice_attach_config')}
                    value={attachConfigId}
                    onChange={handleAttachConfigIdChange}
                  />
                )}
              </Row>
              <TextArea
                cols="50"
                disabled={notice !== EMAIL_NOTICE_ATTACH}
                name={prefix('message_attach')}
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

export default EmailMethodPart;
