/* SPDX-FileCopyrightText: 2026 Greenbone AG
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
import Credential, {
  SNMP_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import ReportFormat from 'gmp/models/report-format';
import AlembavFireMethodPart from 'web/pages/alerts/dialog/AlembavFireMethodPart';

describe('AlembavFireMethodPart tests', () => {
  test('should render AlembavFireMethodPart component', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const onReportFormatsChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <AlembavFireMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewVfireCredentialClick={onNewCredentialClick}
        onReportFormatsChange={onReportFormatsChange}
      />,
    );

    const reportFormatsSelect = screen.getByName('report_format_ids');
    expect(reportFormatsSelect).toBeInTheDocument();

    const baseURLInput = screen.getByRole('textbox', {
      name: 'Base URL',
    });
    expect(baseURLInput).toHaveAttribute('name', 'vfire_base_url');

    const vFireCredentialSelect = screen.getByName('vfire_credential');
    expect(vFireCredentialSelect).toBeInTheDocument();

    const vFireSessionTypeAnalyst = screen.getByRole('radio', {
      name: 'Analyst',
    });
    expect(vFireSessionTypeAnalyst).toHaveAttribute(
      'name',
      'vfire_session_type',
    );
    expect(vFireSessionTypeAnalyst).toHaveAttribute('value', 'Analyst');
    expect(vFireSessionTypeAnalyst).toBeChecked();

    const vFireSessionTypeScanner = screen.getByRole('radio', {
      name: 'User',
    });
    expect(vFireSessionTypeScanner).toHaveAttribute(
      'name',
      'vfire_session_type',
    );
    expect(vFireSessionTypeScanner).toHaveAttribute('value', 'User');

    const vFireClientId = screen.getByRole('textbox', {
      name: 'Alemba Client ID',
    });
    expect(vFireClientId).toHaveAttribute('name', 'vfire_client_id');

    const vFireCallPartitionName = screen.getByRole('textbox', {
      name: 'Partition',
    });
    expect(vFireCallPartitionName).toHaveAttribute(
      'name',
      'vfire_call_partition_name',
    );

    const vFireCallDescription = screen.getByRole('textbox', {
      name: 'Call Description',
    });
    expect(vFireCallDescription).toHaveAttribute(
      'name',
      'vfire_call_description',
    );

    const vFireCallTemplateName = screen.getByRole('textbox', {
      name: 'Call Template',
    });
    expect(vFireCallTemplateName).toHaveAttribute(
      'name',
      'vfire_call_template_name',
    );

    const vFireCallTypeName = screen.getByRole('textbox', {
      name: 'Call Type',
    });
    expect(vFireCallTypeName).toHaveAttribute('name', 'vfire_call_type_name');

    const vFireCallImpactName = screen.getByRole('textbox', {
      name: 'Impact',
    });
    expect(vFireCallImpactName).toHaveAttribute(
      'name',
      'vfire_call_impact_name',
    );

    const vFireCallUrgencyName = screen.getByRole('textbox', {
      name: 'Urgency',
    });
    expect(vFireCallUrgencyName).toHaveAttribute(
      'name',
      'vfire_call_urgency_name',
    );
  });

  test('should render with prefix', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const onReportFormatsChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <AlembavFireMethodPart
        prefix="test"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewVfireCredentialClick={onNewCredentialClick}
        onReportFormatsChange={onReportFormatsChange}
      />,
    );

    const reportFormatsSelect = screen.getByName('report_format_ids');
    expect(reportFormatsSelect).toBeInTheDocument();

    const baseURLInput = screen.getByRole('textbox', {
      name: 'Base URL',
    });
    expect(baseURLInput).toHaveAttribute('name', 'test_vfire_base_url');

    const vFireCredentialSelect = screen.getByName('test_vfire_credential');
    expect(vFireCredentialSelect).toBeInTheDocument();

    const vFireSessionTypeAnalyst = screen.getByRole('radio', {
      name: 'Analyst',
    });
    expect(vFireSessionTypeAnalyst).toHaveAttribute(
      'name',
      'test_vfire_session_type',
    );
    expect(vFireSessionTypeAnalyst).toHaveAttribute('value', 'Analyst');

    const vFireSessionTypeScanner = screen.getByRole('radio', {
      name: 'User',
    });
    expect(vFireSessionTypeScanner).toHaveAttribute(
      'name',
      'test_vfire_session_type',
    );
    expect(vFireSessionTypeScanner).toHaveAttribute('value', 'User');

    const vFireClientId = screen.getByRole('textbox', {
      name: 'Alemba Client ID',
    });
    expect(vFireClientId).toHaveAttribute('name', 'test_vfire_client_id');

    const vFireCallPartitionName = screen.getByRole('textbox', {
      name: 'Partition',
    });
    expect(vFireCallPartitionName).toHaveAttribute(
      'name',
      'test_vfire_call_partition_name',
    );

    const vFireCallDescription = screen.getByRole('textbox', {
      name: 'Call Description',
    });
    expect(vFireCallDescription).toHaveAttribute(
      'name',
      'test_vfire_call_description',
    );

    const vFireCallTemplateName = screen.getByRole('textbox', {
      name: 'Call Template',
    });
    expect(vFireCallTemplateName).toHaveAttribute(
      'name',
      'test_vfire_call_template_name',
    );

    const vFireCallTypeName = screen.getByRole('textbox', {
      name: 'Call Type',
    });
    expect(vFireCallTypeName).toHaveAttribute(
      'name',
      'test_vfire_call_type_name',
    );

    const vFireCallImpactName = screen.getByRole('textbox', {
      name: 'Impact',
    });
    expect(vFireCallImpactName).toHaveAttribute(
      'name',
      'test_vfire_call_impact_name',
    );

    const vFireCallUrgencyName = screen.getByRole('textbox', {
      name: 'Urgency',
    });
    expect(vFireCallUrgencyName).toHaveAttribute(
      'name',
      'test_vfire_call_urgency_name',
    );
  });

  test('should allow to change report formats', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const onReportFormatsChange = testing.fn();
    const reportFormat1 = new ReportFormat({
      id: 'reportFormat1',
      name: 'Report Format 1',
    });
    const reportFormat2 = new ReportFormat({
      id: 'reportFormat2',
      name: 'Report Format 2',
    });
    const {render} = rendererWith({capabilities: true});
    render(
      <AlembavFireMethodPart
        reportFormats={[reportFormat1, reportFormat2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewVfireCredentialClick={onNewCredentialClick}
        onReportFormatsChange={onReportFormatsChange}
      />,
    );

    const reportFormatsSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Report Formats',
    });
    let reportFormatOptions =
      await getSelectItemElementsForSelect(reportFormatsSelect);
    expect(reportFormatOptions).toHaveLength(2);
    expect(reportFormatOptions[0]).toHaveTextContent(
      reportFormat1.name as string,
    );
    expect(reportFormatOptions[1]).toHaveTextContent(
      reportFormat2.name as string,
    );

    fireEvent.click(reportFormatOptions[0]);
    expect(onReportFormatsChange).toHaveBeenCalledWith(
      [reportFormat1.id],
      'report_format_ids',
    );
  });

  test('should allow to change credentials', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const onReportFormatsChange = testing.fn();
    const credential1 = new Credential({
      id: 'credential1',
      name: 'Credential 1',
      credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
    });
    const credential2 = new Credential({
      id: 'credential2',
      name: 'Credential 2',
      credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
    });
    const credential3 = new Credential({
      id: 'credential3',
      name: 'Credential 3',
      credentialType: SNMP_CREDENTIAL_TYPE,
    });
    const {render} = rendererWith({capabilities: true});
    render(
      <AlembavFireMethodPart
        credentials={[credential1, credential2, credential3]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewVfireCredentialClick={onNewCredentialClick}
        onReportFormatsChange={onReportFormatsChange}
      />,
    );

    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Credential',
    });
    const credentialOptions =
      await getSelectItemElementsForSelect(credentialSelect);
    expect(credentialOptions).toHaveLength(2);
    expect(credentialOptions[0]).toHaveTextContent(credential1.name as string);
    expect(credentialOptions[1]).toHaveTextContent(credential2.name as string);

    fireEvent.click(credentialOptions[1]);
    expect(onCredentialChange).toHaveBeenCalledWith(
      credential2.id,
      'vfire_credential',
    );
  });

  test('should allow to create new credential', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const onReportFormatsChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <AlembavFireMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewVfireCredentialClick={onNewCredentialClick}
        onReportFormatsChange={onReportFormatsChange}
      />,
    );

    const newCredentialButton = screen.getByRole('button', {
      name: 'New Icon',
    });
    fireEvent.click(newCredentialButton);
    expect(onNewCredentialClick).toHaveBeenCalled();
  });

  test('should allow to change values', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const onReportFormatsChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <AlembavFireMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewVfireCredentialClick={onNewCredentialClick}
        onReportFormatsChange={onReportFormatsChange}
      />,
    );

    const baseURLInput = screen.getByRole('textbox', {
      name: 'Base URL',
    });
    changeInputValue(baseURLInput, 'http://example.com');
    expect(onChange).toHaveBeenCalledWith(
      'http://example.com',
      'vfire_base_url',
    );

    const vFireClientIdInput = screen.getByRole('textbox', {
      name: 'Alemba Client ID',
    });
    changeInputValue(vFireClientIdInput, 'client_id');
    expect(onChange).toHaveBeenCalledWith('client_id', 'vfire_client_id');

    const vFireCallPartitionNameInput = screen.getByRole('textbox', {
      name: 'Partition',
    });
    changeInputValue(vFireCallPartitionNameInput, 'partition_name');
    expect(onChange).toHaveBeenCalledWith(
      'partition_name',
      'vfire_call_partition_name',
    );

    const vFireCallDescriptionInput = screen.getByRole('textbox', {
      name: 'Call Description',
    });
    changeInputValue(vFireCallDescriptionInput, 'call_description');
    expect(onChange).toHaveBeenCalledWith(
      'call_description',
      'vfire_call_description',
    );

    const vFireCallTemplateNameInput = screen.getByRole('textbox', {
      name: 'Call Template',
    });
    changeInputValue(vFireCallTemplateNameInput, 'template_name');
    expect(onChange).toHaveBeenCalledWith(
      'template_name',
      'vfire_call_template_name',
    );

    const vFireCallTypeNameInput = screen.getByRole('textbox', {
      name: 'Call Type',
    });
    changeInputValue(vFireCallTypeNameInput, 'call_type_name');
    expect(onChange).toHaveBeenCalledWith(
      'call_type_name',
      'vfire_call_type_name',
    );

    const vFireCallImpactNameInput = screen.getByRole('textbox', {
      name: 'Impact',
    });
    changeInputValue(vFireCallImpactNameInput, 'impact_name');
    expect(onChange).toHaveBeenCalledWith(
      'impact_name',
      'vfire_call_impact_name',
    );

    const vFireCallUrgencyNameInput = screen.getByRole('textbox', {
      name: 'Urgency',
    });
    changeInputValue(vFireCallUrgencyNameInput, 'urgency_name');
    expect(onChange).toHaveBeenCalledWith(
      'urgency_name',
      'vfire_call_urgency_name',
    );
  });

  test('should allow to change session type', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const onReportFormatsChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    const {rerender} = render(
      <AlembavFireMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewVfireCredentialClick={onNewCredentialClick}
        onReportFormatsChange={onReportFormatsChange}
      />,
    );

    const vFireSessionTypeScanner = screen.getByRole('radio', {
      name: 'User',
    });
    expect(vFireSessionTypeScanner).not.toBeChecked();
    fireEvent.click(vFireSessionTypeScanner);
    expect(onChange).toHaveBeenCalledWith('User', 'vfire_session_type');

    onChange.mockClear();
    rerender(
      <AlembavFireMethodPart
        vFireSessionType="User"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewVfireCredentialClick={onNewCredentialClick}
        onReportFormatsChange={onReportFormatsChange}
      />,
    );
    const vFireSessionTypeAnalyst = screen.getByRole('radio', {
      name: 'Analyst',
    });
    expect(vFireSessionTypeAnalyst).not.toBeChecked();
    fireEvent.click(vFireSessionTypeAnalyst);
    expect(onChange).toHaveBeenCalledWith('Analyst', 'vfire_session_type');
  });
});
