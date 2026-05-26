/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
} from 'web/testing';
import {
  EMAIL_NOTICE_ATTACH,
  EMAIL_NOTICE_INCLUDE,
  EMAIL_NOTICE_SIMPLE,
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  EVENT_TYPE_TICKET_RECEIVED,
} from 'gmp/models/alert';
import Credential, {
  EMAIL_CREDENTIAL_TYPES,
  KRB5_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import ReportConfig from 'gmp/models/report-config';
import ReportFormat from 'gmp/models/report-format';
import EmailMethodPart from 'web/pages/alerts/dialog/EmailMethodPart';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/Render';

describe('EmailMethodPart tests', () => {
  test('should render the EmailMethodPart component', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});

    render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_SIMPLE}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByName('to_address')).toBeInTheDocument();
    expect(screen.getByName('from_address')).toBeInTheDocument();
    expect(screen.getByName('subject')).toBeInTheDocument();
    expect(screen.getByName('recipient_credential')).toBeInTheDocument();
    expect(screen.getByName('notice')).toBeInTheDocument();
    expect(screen.getByName('notice_report_format')).toBeInTheDocument();
    expect(screen.getByName('notice_report_config')).toBeInTheDocument();
    expect(screen.getByName('message')).toBeInTheDocument();
    expect(screen.getByName('notice_attach_format')).toBeInTheDocument();
    expect(screen.getByName('notice_attach_config')).toBeInTheDocument();
    expect(screen.getByName('message_attach')).toBeInTheDocument();
  });

  test('should render the EmailMethodPart for ticket alerts', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});

    render(
      <EmailMethodPart
        event={EVENT_TYPE_TICKET_RECEIVED}
        notice={EMAIL_NOTICE_SIMPLE}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByName('to_address')).toBeInTheDocument();
    expect(screen.getByName('from_address')).toBeInTheDocument();
    expect(screen.queryByName('subject')).not.toBeInTheDocument();
    expect(screen.getByName('recipient_credential')).toBeInTheDocument();
    expect(screen.queryByName('notice')).not.toBeInTheDocument();
    expect(screen.queryByName('notice_report_format')).not.toBeInTheDocument();
    expect(screen.queryByName('notice_report_config')).not.toBeInTheDocument();
    expect(screen.queryByName('message')).not.toBeInTheDocument();
    expect(screen.queryByName('notice_attach_format')).not.toBeInTheDocument();
    expect(screen.queryByName('notice_attach_config')).not.toBeInTheDocument();
    expect(screen.queryByName('message_attach')).not.toBeInTheDocument();
  });

  test('should allow to use a prefix', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});

    render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_SIMPLE}
        prefix="test"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByName('test_to_address')).toBeInTheDocument();
    expect(screen.getByName('test_from_address')).toBeInTheDocument();
    expect(screen.getByName('test_subject')).toBeInTheDocument();
    expect(screen.getByName('test_recipient_credential')).toBeInTheDocument();
    expect(screen.getByName('test_notice')).toBeInTheDocument();
    expect(screen.getByName('test_notice_report_format')).toBeInTheDocument();
    expect(screen.getByName('test_notice_report_config')).toBeInTheDocument();
    expect(screen.getByName('test_message')).toBeInTheDocument();
    expect(screen.getByName('test_notice_attach_format')).toBeInTheDocument();
    expect(screen.getByName('test_notice_attach_config')).toBeInTheDocument();
    expect(screen.getByName('test_message_attach')).toBeInTheDocument();
  });

  test('should allow to render simple notice', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});

    render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        fromAddress="foo@bar.com"
        notice={EMAIL_NOTICE_SIMPLE}
        subject="Some Message"
        toAddress="baz@baz.gov"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'To Address'})).toHaveValue(
      'baz@baz.gov',
    );
    expect(screen.getByRole('textbox', {name: 'From Address'})).toHaveValue(
      'foo@bar.com',
    );
    expect(screen.getByRole('textbox', {name: 'Subject'})).toHaveValue(
      'Some Message',
    );
    expect(screen.getByRole('textbox', {name: 'Email Encryption'})).toHaveValue(
      '',
    );

    expect(screen.getByLabelText('Simple Notice')).toBeChecked();
    expect(screen.getByLabelText('Include report')).not.toBeChecked();
    expect(screen.getByLabelText('Attach report')).not.toBeChecked();

    expect(screen.getByName('notice_report_format')).toBeDisabled();
    expect(screen.getByName('notice_report_config')).toBeDisabled();
    expect(screen.getByName('message')).toBeDisabled();
    expect(screen.getByName('notice_attach_format')).toBeDisabled();
    expect(screen.getByName('notice_attach_config')).toBeDisabled();
    expect(screen.getByName('message_attach')).toBeDisabled();
  });

  test('should allow to include report', () => {
    const reportFormat = new ReportFormat({
      id: '123',
      name: 'Test Format',
      content_type: 'text/xml',
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});

    render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        fromAddress="foo@bar.com"
        message="Some message to include in the notice"
        notice={EMAIL_NOTICE_INCLUDE}
        noticeReportFormat={reportFormat.id}
        reportFormats={[reportFormat]}
        subject="Some Message"
        toAddress="baz@baz.gov"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'To Address'})).toHaveValue(
      'baz@baz.gov',
    );
    expect(screen.getByRole('textbox', {name: 'From Address'})).toHaveValue(
      'foo@bar.com',
    );
    expect(screen.getByRole('textbox', {name: 'Subject'})).toHaveValue(
      'Some Message',
    );
    expect(screen.getByRole('textbox', {name: 'Email Encryption'})).toHaveValue(
      '',
    );

    expect(screen.getByLabelText('Simple Notice')).not.toBeChecked();
    expect(screen.getByLabelText('Include report')).toBeChecked();
    expect(screen.getByLabelText('Attach report')).not.toBeChecked();

    expect(screen.getByName('notice_report_format')).not.toBeDisabled();
    expect(screen.getByName('notice_report_format')).toHaveValue(
      reportFormat.id,
    );
    expect(screen.getByName('notice_report_config')).not.toBeDisabled();
    expect(screen.getByName('notice_report_config')).toHaveValue(UNSET_VALUE);
    expect(screen.getByName('message')).not.toBeDisabled();
    expect(screen.getByName('message')).toHaveValue(
      'Some message to include in the notice',
    );
    expect(screen.getByName('notice_attach_format')).toBeDisabled();
    expect(screen.getByName('notice_attach_config')).toBeDisabled();
    expect(screen.getByName('message_attach')).toBeDisabled();
  });

  test('should allow to attach report', () => {
    const reportFormat = new ReportFormat({
      id: '123',
      name: 'Test Format',
      content_type: 'text/xml',
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});

    render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        fromAddress="foo@bar.com"
        messageAttach="Some message to attach in the notice"
        notice={EMAIL_NOTICE_ATTACH}
        noticeAttachFormat={reportFormat.id}
        reportFormats={[reportFormat]}
        subject="Some Message"
        toAddress="baz@baz.gov"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'To Address'})).toHaveValue(
      'baz@baz.gov',
    );
    expect(screen.getByRole('textbox', {name: 'From Address'})).toHaveValue(
      'foo@bar.com',
    );
    expect(screen.getByRole('textbox', {name: 'Subject'})).toHaveValue(
      'Some Message',
    );
    expect(screen.getByRole('textbox', {name: 'Email Encryption'})).toHaveValue(
      '',
    );

    expect(screen.getByLabelText('Simple Notice')).not.toBeChecked();
    expect(screen.getByLabelText('Include report')).not.toBeChecked();
    expect(screen.getByLabelText('Attach report')).toBeChecked();

    expect(screen.getByName('notice_report_format')).toBeDisabled();
    expect(screen.getByName('notice_report_config')).toBeDisabled();
    expect(screen.getByName('message')).toBeDisabled();
    expect(screen.getByName('notice_attach_format')).toHaveValue(
      reportFormat.id,
    );
    expect(screen.getByName('notice_attach_format')).not.toBeDisabled();
    expect(screen.getByName('notice_attach_config')).not.toBeDisabled();
    expect(screen.getByName('notice_attach_config')).toHaveValue(UNSET_VALUE);
    expect(screen.getByName('message_attach')).not.toBeDisabled();
    expect(screen.getByName('message_attach')).toHaveValue(
      'Some message to attach in the notice',
    );
  });

  test('should call onChange when changing values', async () => {
    const reportFormat1 = new ReportFormat({
      id: '123',
      name: 'Test Format',
      content_type: 'text/xml',
    });
    const reportFormat2 = new ReportFormat({
      id: '124',
      name: 'Another Test Format',
      content_type: 'text/html',
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});

    const {rerender} = render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_SIMPLE}
        noticeAttachFormat={reportFormat1.id}
        noticeReportFormat={reportFormat1.id}
        reportFormats={[reportFormat1, reportFormat2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const fromAddressInput = screen.getByRole('textbox', {
      name: 'From Address',
    });
    changeInputValue(fromAddressInput, 'new@address.com');
    expect(onChange).toHaveBeenCalledWith('new@address.com', 'from_address');

    const toAddressInput = screen.getByRole('textbox', {
      name: 'To Address',
    });
    changeInputValue(toAddressInput, 'new@address.gov');
    expect(onChange).toHaveBeenCalledWith('new@address.gov', 'to_address');

    const subjectInput = screen.getByRole('textbox', {
      name: 'Subject',
    });
    changeInputValue(subjectInput, 'New Subject');
    expect(onChange).toHaveBeenCalledWith('New Subject', 'subject');

    const noticeRadios = screen.getAllByName('notice');
    fireEvent.click(noticeRadios[1]);
    expect(onChange).toHaveBeenCalledWith(EMAIL_NOTICE_INCLUDE, 'notice');

    rerender(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_INCLUDE}
        noticeAttachFormat={reportFormat1.id}
        noticeReportFormat={reportFormat1.id}
        reportFormats={[reportFormat1, reportFormat2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const noticeReportFormatSelect = screen.getByRole<HTMLSelectElement>(
      'textbox',
      {
        name: 'Include Report Format',
      },
    );
    const noticeReportFormatOptions = await getSelectItemElementsForSelect(
      noticeReportFormatSelect,
    );
    expect(noticeReportFormatOptions.length).toEqual(2);
    fireEvent.click(noticeReportFormatOptions[1]);
    expect(onChange).toHaveBeenCalledWith(
      reportFormat2.id,
      'notice_report_format',
    );

    const messageInput = screen.getByName('message');
    changeInputValue(messageInput, 'New message to include');
    expect(onChange).toHaveBeenCalledWith('New message to include', 'message');

    fireEvent.click(noticeRadios[2]);
    expect(onChange).toHaveBeenCalledWith(EMAIL_NOTICE_ATTACH, 'notice');

    rerender(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_ATTACH}
        noticeAttachFormat={reportFormat1.id}
        noticeReportFormat={reportFormat1.id}
        reportFormats={[reportFormat1, reportFormat2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const noticeAttachFormatSelect = screen.getByRole<HTMLSelectElement>(
      'textbox',
      {
        name: 'Attach Report Format',
      },
    );
    const noticeAttachFormatOptions = await getSelectItemElementsForSelect(
      noticeAttachFormatSelect,
    );
    expect(noticeAttachFormatOptions.length).toEqual(2);
    fireEvent.click(noticeAttachFormatOptions[1]);
    expect(onChange).toHaveBeenCalledWith(
      reportFormat2.id,
      'notice_attach_format',
    );

    const messageAttachInput = screen.getByName('message_attach');
    changeInputValue(messageAttachInput, 'New message to attach');
    expect(onChange).toHaveBeenCalledWith(
      'New message to attach',
      'message_attach',
    );
  });

  test('should allow to select a report config for include report format', async () => {
    const reportFormat1 = new ReportFormat({
      id: '123',
      name: 'Test Format',
      content_type: 'text/xml',
    });
    const reportFormat2 = new ReportFormat({
      id: '124',
      name: 'Another Test Format',
      content_type: 'text/html',
    });
    const reportConfig1 = new ReportConfig({
      id: '321',
      name: 'Test Config',
      reportFormat: reportFormat1,
    });
    const reportConfig2 = new ReportConfig({
      id: '322',
      name: 'Another Test Config',
      reportFormat: reportFormat1,
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_INCLUDE}
        noticeReportFormat={reportFormat1.id}
        reportConfigs={[reportConfig1, reportConfig2]}
        reportFormats={[reportFormat1, reportFormat2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const noticeIncludeReportConfigSelect = screen.getByRole<HTMLSelectElement>(
      'textbox',
      {
        name: 'Include Report Config',
      },
    );
    const noticeIncludeReportConfigOptions =
      await getSelectItemElementsForSelect(noticeIncludeReportConfigSelect);
    expect(noticeIncludeReportConfigOptions.length).toEqual(3);
    fireEvent.click(noticeIncludeReportConfigOptions[1]);
    expect(onChange).toHaveBeenCalledWith(
      reportConfig1.id,
      'notice_report_config',
    );
  });

  test('should allow to select a report config for attach report format', async () => {
    const reportFormat1 = new ReportFormat({
      id: '123',
      name: 'Test Format',
      content_type: 'text/xml',
    });
    const reportFormat2 = new ReportFormat({
      id: '124',
      name: 'Another Test Format',
      content_type: 'text/html',
    });
    const reportConfig1 = new ReportConfig({
      id: '321',
      name: 'Test Config',
      reportFormat: reportFormat1,
    });
    const reportConfig2 = new ReportConfig({
      id: '322',
      name: 'Another Test Config',
      reportFormat: reportFormat1,
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_ATTACH}
        noticeAttachFormat={reportFormat1.id}
        reportConfigs={[reportConfig1, reportConfig2]}
        reportFormats={[reportFormat1, reportFormat2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const noticeAttachReportConfigSelect = screen.getByRole<HTMLSelectElement>(
      'textbox',
      {
        name: 'Report Config',
      },
    );
    const noticeAttachReportConfigOptions =
      await getSelectItemElementsForSelect(noticeAttachReportConfigSelect);
    expect(noticeAttachReportConfigOptions.length).toEqual(3);
    fireEvent.click(noticeAttachReportConfigOptions[1]);
    expect(onChange).toHaveBeenCalledWith(
      reportConfig1.id,
      'notice_attach_config',
    );
  });

  test('should allow to select an email credential', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const credential1 = new Credential({
      id: 'cred1',
      name: 'Credential 1',
      credentialType: EMAIL_CREDENTIAL_TYPES[0],
    });
    const credential2 = new Credential({
      id: 'cred2',
      name: 'Credential 2',
      credentialType: EMAIL_CREDENTIAL_TYPES[1],
    });
    // will be filtered out, because not of email credential type
    const credential3 = new Credential({
      id: 'cred3',
      name: 'Credential 3',
      credentialType: KRB5_CREDENTIAL_TYPE,
    });
    const {render} = rendererWith({capabilities: true});
    render(
      <EmailMethodPart
        credentials={[credential1, credential2, credential3]}
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_SIMPLE}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Email Encryption',
    });
    const credentialOptions =
      await getSelectItemElementsForSelect(credentialSelect);
    expect(credentialOptions.length).toEqual(3);
    expect(credentialOptions[0]).toHaveTextContent(UNSET_LABEL);
    expect(credentialOptions[1]).toHaveTextContent('Credential 1');
    expect(credentialOptions[2]).toHaveTextContent('Credential 2');
    fireEvent.click(credentialOptions[1]);
    expect(onCredentialChange).toHaveBeenCalledWith(
      credential1.id,
      'recipient_credential',
    );
  });

  test('should allow to create a new credential', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});

    render(
      <EmailMethodPart
        event={EVENT_TYPE_TASK_RUN_STATUS_CHANGED}
        notice={EMAIL_NOTICE_SIMPLE}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const newCredentialButton = screen.getByRole('button', {
      name: 'New Icon',
    });
    fireEvent.click(newCredentialButton);
    expect(onNewCredentialClick).toHaveBeenCalledWith(EMAIL_CREDENTIAL_TYPES);
  });
});
