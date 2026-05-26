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
import Credential, {
  SNMP_CREDENTIAL_TYPE,
  SSH_CREDENTIAL_TYPES,
} from 'gmp/models/credential';
import ReportConfig from 'gmp/models/report-config';
import ReportFormat from 'gmp/models/report-format';
import ScpMethodPart from 'web/pages/alerts/dialog/ScpMethodPart';
import {UNSET_VALUE} from 'web/utils/Render';

describe('ScpMethodPart tests', () => {
  test('should render with values', () => {
    const credential1 = new Credential({
      id: 'credential1',
      name: 'Credential 1',
      credentialType: SSH_CREDENTIAL_TYPES[0],
    });
    const credential2 = new Credential({
      id: 'credential2',
      name: 'Credential 2',
      credentialType: SSH_CREDENTIAL_TYPES[0],
    });
    const reportFormat1 = new ReportFormat({
      id: 'report_format_id',
      name: 'Report Format',
    });
    const reportConfig1 = new ReportConfig({
      id: 'report_config_id',
      name: 'Report Config',
      reportFormat: reportFormat1,
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <ScpMethodPart
        credentials={[credential1, credential2]}
        reportConfigs={[reportConfig1]}
        reportFormats={[reportFormat1]}
        scpCredential={credential1.id}
        scpHost="example.com"
        scpKnownHosts="known_hosts_content"
        scpPath="/path/to/file"
        scpPort={22}
        scpReportConfig="report_config_id"
        scpReportFormat="report_format_id"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Credential'})).toHaveValue(
      credential1.name,
    );
    expect(screen.getByRole('textbox', {name: 'Host'})).toHaveValue(
      'example.com',
    );
    expect(screen.getByRole('spinbutton', {name: 'Port'})).toHaveValue('22');
    expect(screen.getByRole('textbox', {name: 'Known Hosts'})).toHaveValue(
      'known_hosts_content',
    );
    expect(screen.getByRole('textbox', {name: 'Path'})).toHaveValue(
      '/path/to/file',
    );
    expect(screen.getByRole('textbox', {name: 'Report'})).toHaveValue(
      reportFormat1.name,
    );
    expect(screen.getByRole('textbox', {name: 'Report Config'})).toHaveValue(
      reportConfig1.name,
    );
  });

  test('should allow to create a new credential', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <ScpMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const newCredentialButton = screen.getByRole('button', {
      name: 'Create a credential',
    });
    fireEvent.click(newCredentialButton);
    expect(onNewCredentialClick).toHaveBeenCalled();
  });

  test('should call onChange when input values change', async () => {
    const credential1 = new Credential({
      id: 'credential1',
      name: 'Credential 1',
      credentialType: SSH_CREDENTIAL_TYPES[0],
    });
    const credential2 = new Credential({
      id: 'credential2',
      name: 'Credential 2',
      credentialType: SSH_CREDENTIAL_TYPES[0],
    });
    const reportFormat1 = new ReportFormat({
      id: 'report_format_id',
      name: 'Report Format',
    });
    const reportFormat2 = new ReportFormat({
      id: 'report_format_id_2',
      name: 'Report Format 2',
    });
    const reportConfig1 = new ReportConfig({
      id: 'report_config_id',
      name: 'Report Config',
      reportFormat: reportFormat1,
    });
    const reportConfig2 = new ReportConfig({
      id: 'report_config_id_2',
      name: 'Report Config 2',
      reportFormat: reportFormat2,
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <ScpMethodPart
        credentials={[credential1, credential2]}
        reportConfigs={[reportConfig1, reportConfig2]}
        reportFormats={[reportFormat1, reportFormat2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Credential',
    });
    const credentialOptions =
      await getSelectItemElementsForSelect(credentialSelect);
    expect(credentialOptions.length).toEqual(2);
    fireEvent.click(credentialOptions[1]);
    expect(onCredentialChange).toHaveBeenCalledWith(
      credential2.id,
      'scp_credential',
    );

    changeInputValue(
      screen.getByRole('textbox', {name: 'Host'}),
      'example.com',
    );
    expect(onChange).toHaveBeenCalledWith('example.com', 'scp_host');

    changeInputValue(screen.getByRole('spinbutton', {name: 'Port'}), '22');
    expect(onChange).toHaveBeenCalledWith(22, 'scp_port');

    changeInputValue(
      screen.getByRole('textbox', {name: 'Known Hosts'}),
      'known_hosts_content',
    );
    expect(onChange).toHaveBeenCalledWith(
      'known_hosts_content',
      'scp_known_hosts',
    );

    changeInputValue(
      screen.getByRole('textbox', {name: 'Path'}),
      '/path/to/file',
    );
    expect(onChange).toHaveBeenCalledWith('/path/to/file', 'scp_path');

    onChange.mockReset();
    const reportFormatSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Report',
    });
    const reportFormatOptions =
      await getSelectItemElementsForSelect(reportFormatSelect);
    expect(reportFormatOptions.length).toEqual(2);
    fireEvent.click(reportFormatOptions[1]);
    expect(onChange).toHaveBeenCalledWith(UNSET_VALUE, 'scp_report_config');
    expect(onChange).toHaveBeenCalledWith(
      reportFormat2.id,
      'scp_report_format',
    );

    const reportConfigSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Report Config',
    });
    const reportConfigOptions =
      await getSelectItemElementsForSelect(reportConfigSelect);
    expect(reportConfigOptions.length).toEqual(2);
    fireEvent.click(reportConfigOptions[1]);
    expect(onChange).toHaveBeenCalledWith(
      reportConfig2.id,
      'scp_report_config',
    );
  });

  test('should allow to add prefix to input names', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <ScpMethodPart
        prefix="method"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByName('method_scp_credential')).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: 'Host'})).toHaveAttribute(
      'name',
      'method_scp_host',
    );
    expect(screen.getByRole('spinbutton', {name: 'Port'})).toHaveAttribute(
      'name',
      'method_scp_port',
    );
    expect(screen.getByRole('textbox', {name: 'Known Hosts'})).toHaveAttribute(
      'name',
      'method_scp_known_hosts',
    );
    expect(screen.getByRole('textbox', {name: 'Path'})).toHaveAttribute(
      'name',
      'method_scp_path',
    );
    expect(screen.getByName('method_scp_report_format')).toBeInTheDocument();
    expect(screen.getByName('method_scp_report_config')).toBeInTheDocument();
  });

  test('should only render ssh credentials in credential select', async () => {
    const credential1 = new Credential({
      id: 'credential1',
      name: 'Credential 1',
      credentialType: SSH_CREDENTIAL_TYPES[0],
    });
    const credential2 = new Credential({
      id: 'credential2',
      name: 'Credential 2',
      credentialType: SNMP_CREDENTIAL_TYPE,
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <ScpMethodPart
        credentials={[credential1, credential2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Credential',
    });
    const credentialOptions =
      await getSelectItemElementsForSelect(credentialSelect);
    expect(credentialOptions.length).toEqual(1);
    expect(credentialOptions[0]).toHaveTextContent('Credential 1');
  });
});
