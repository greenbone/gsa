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
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import ReportConfig from 'gmp/models/report-config';
import ReportFormat from 'gmp/models/report-format';
import VeriniceMethodPart, {
  VERINICE_CREDENTIAL_TYPES,
} from 'web/pages/alerts/dialog/VeriniceMethodPart';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/Render';

describe('VeriniceMethodPart tests', () => {
  test('should render VeriniceMethodPart component', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <VeriniceMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const serverUrlInput = screen.getByRole('textbox', {
      name: 'verinice.PRO URL',
    });
    expect(serverUrlInput).toHaveAttribute('name', 'verinice_server_url');

    expect(screen.getByName('verinice_server_credential')).toBeInTheDocument();
    expect(
      screen.getByName('verinice_server_report_format'),
    ).toBeInTheDocument();
    expect(
      screen.getByName('verinice_server_report_config'),
    ).toBeInTheDocument();
  });

  test('should render with prefix', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <VeriniceMethodPart
        prefix="test"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const serverUrlInput = screen.getByRole('textbox', {
      name: 'verinice.PRO URL',
    });
    expect(serverUrlInput).toHaveAttribute('name', 'test_verinice_server_url');

    expect(
      screen.getByName('test_verinice_server_credential'),
    ).toBeInTheDocument();
    expect(
      screen.getByName('test_verinice_server_report_format'),
    ).toBeInTheDocument();
    expect(
      screen.getByName('test_verinice_server_report_config'),
    ).toBeInTheDocument();
  });

  test('should allow to change server url', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <VeriniceMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const serverUrlInput = screen.getByRole('textbox', {
      name: 'verinice.PRO URL',
    });
    changeInputValue(serverUrlInput, 'http://url');
    expect(onChange).toHaveBeenCalledWith('http://url', 'verinice_server_url');
  });

  test('should allow to change credential', async () => {
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
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <VeriniceMethodPart
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
    expect(credentialOptions).toHaveLength(2);
    expect(credentialOptions[0]).toHaveTextContent('Credential 1');
    expect(credentialOptions[1]).toHaveTextContent('Credential 2');

    fireEvent.click(credentialOptions[1]);
    expect(onCredentialChange).toHaveBeenCalledWith(
      'credential2',
      'verinice_server_credential',
    );
  });

  test('should allow to create a new credential', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <VeriniceMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const newCredentialButton = screen.getByRole('button', {
      name: 'New Icon',
    });
    fireEvent.click(newCredentialButton);
    expect(onNewCredentialClick).toHaveBeenCalledWith(
      VERINICE_CREDENTIAL_TYPES,
    );
  });

  test('should allow to change report format', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const reportFormat1 = new ReportFormat({
      id: 'report_format_id',
      name: 'Report Format 1',
      extension: 'vna',
    });
    const reportFormat2 = new ReportFormat({
      id: 'report_format_id_2',
      name: 'Report Format 2',
      extension: 'vna',
    });
    const reportFormat3 = new ReportFormat({
      id: 'report_format_id_3',
      name: 'Report Format 3',
      extension: 'xml',
    });
    const {render} = rendererWith({capabilities: true});
    render(
      <VeriniceMethodPart
        reportFormats={[reportFormat1, reportFormat2, reportFormat3]}
        veriniceServerReportFormat={reportFormat1.id}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const reportFormatSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'verinice.PRO Report',
    });
    expect(reportFormatSelect).toHaveValue(reportFormat1.name);

    const reportFormatOptions =
      await getSelectItemElementsForSelect(reportFormatSelect);
    expect(reportFormatOptions).toHaveLength(2);
    expect(reportFormatOptions[0]).toHaveTextContent(
      reportFormat1.name as string,
    );
    expect(reportFormatOptions[1]).toHaveTextContent(
      reportFormat2.name as string,
    );

    fireEvent.click(reportFormatOptions[1]);
    expect(onChange).toHaveBeenCalledWith(
      reportFormat2.id,
      'verinice_server_report_format',
    );
    expect(onChange).toHaveBeenCalledWith(
      UNSET_VALUE,
      'verinice_server_report_config',
    );
  });

  test('should allow to change report config', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const reportFormat1 = new ReportFormat({
      id: 'report_format_id',
      name: 'Report Format 1',
      extension: 'vna',
    });
    const reportConfig1 = new ReportConfig({
      id: 'report_config_id',
      name: 'Report Config 1',
      reportFormat: reportFormat1,
    });
    const reportConfig2 = new ReportConfig({
      id: 'report_config_id_2',
      name: 'Report Config 2',
      reportFormat: reportFormat1,
    });

    const {render} = rendererWith({capabilities: true});
    render(
      <VeriniceMethodPart
        reportConfigs={[reportConfig1, reportConfig2]}
        reportFormats={[reportFormat1]}
        veriniceServerReportConfig={reportConfig1.id}
        veriniceServerReportFormat={reportFormat1.id}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const reportConfigSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Report Config',
    });
    expect(reportConfigSelect).toHaveValue(reportConfig1.name);
    const reportConfigOptions =
      await getSelectItemElementsForSelect(reportConfigSelect);
    expect(reportConfigOptions).toHaveLength(3);
    expect(reportConfigOptions[0]).toHaveTextContent(UNSET_LABEL);
    expect(reportConfigOptions[1]).toHaveTextContent(
      reportConfig1.name as string,
    );
    expect(reportConfigOptions[2]).toHaveTextContent(
      reportConfig2.name as string,
    );

    fireEvent.click(reportConfigOptions[2]);
    expect(onChange).toHaveBeenCalledWith(
      reportConfig2.id,
      'verinice_server_report_config',
    );
  });
});
