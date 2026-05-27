/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
} from 'web/testing';
import Credential, {
  SMB_CREDENTIAL_TYPES,
  SNMP_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import ReportConfig from 'gmp/models/report-config';
import ReportFormat from 'gmp/models/report-format';
import SmbMethodPart from 'web/pages/alerts/dialog/SmbMethodPart';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/Render';

describe('SmbMethodPart tests', () => {
  test('should render SmbMethodPart component', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SmbMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    expect(screen.getByText(/Security note/)).toBeInTheDocument();

    const smbCredentialSelect = screen.getByName('smb_credential');
    expect(smbCredentialSelect).toBeInTheDocument();

    const sharePathInput = screen.getByRole('textbox', {name: 'Share path'});
    expect(sharePathInput).toHaveAttribute('name', 'smb_share_path');

    const filePathInput = screen.getByRole('textbox', {name: 'File path'});
    expect(filePathInput).toHaveAttribute('name', 'smb_file_path');

    const smbReportFormatSelect = screen.getByName('smb_report_format');
    expect(smbReportFormatSelect).toBeInTheDocument();

    const smbReportConfigSelect = screen.getByName('smb_report_config');
    expect(smbReportConfigSelect).toBeInTheDocument();

    const smbMaxProtocolSelect = screen.getByName('smb_max_protocol');
    expect(smbMaxProtocolSelect).toBeInTheDocument();

    expect(screen.getByRole('textbox', {name: 'Report Config'})).toHaveValue(
      UNSET_LABEL,
    );
  });

  test('should render with prefix', () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SmbMethodPart
        prefix="test"
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const smbCredentialSelect = screen.getByName('test_smb_credential');
    expect(smbCredentialSelect).toBeInTheDocument();

    const sharePathInput = screen.getByRole('textbox', {name: 'Share path'});
    expect(sharePathInput).toHaveAttribute('name', 'test_smb_share_path');

    const filePathInput = screen.getByRole('textbox', {name: 'File path'});
    expect(filePathInput).toHaveAttribute('name', 'test_smb_file_path');

    const smbReportFormatSelect = screen.getByName('test_smb_report_format');
    expect(smbReportFormatSelect).toBeInTheDocument();

    const smbReportConfigSelect = screen.getByName('test_smb_report_config');
    expect(smbReportConfigSelect).toBeInTheDocument();

    const smbMaxProtocolSelect = screen.getByName('test_smb_max_protocol');
    expect(smbMaxProtocolSelect).toBeInTheDocument();
  });

  test('should only render smb credentials in credential select', async () => {
    const credential1 = new Credential({
      id: 'credential1',
      name: 'Credential 1',
      credentialType: SMB_CREDENTIAL_TYPES[0],
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
      <SmbMethodPart
        credentials={[credential1, credential2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Credential',
    });
    expect(credentialSelect).toBeInTheDocument();

    const options = await getSelectItemElementsForSelect(credentialSelect);
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Credential 1');
  });

  test('should allow to change credential', async () => {
    const credential1 = new Credential({
      id: 'credential1',
      name: 'Credential 1',
      credentialType: SMB_CREDENTIAL_TYPES[0],
    });
    const credential2 = new Credential({
      id: 'credential2',
      name: 'Credential 2',
      credentialType: SMB_CREDENTIAL_TYPES[0],
    });
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SmbMethodPart
        credentials={[credential1, credential2]}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const credentialSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Credential',
    });

    const options = await getSelectItemElementsForSelect(credentialSelect);
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Credential 1');
    expect(options[1]).toHaveTextContent('Credential 2');

    fireEvent.click(options[1]);
    expect(onCredentialChange).toHaveBeenCalledWith(
      credential2.id,
      'smb_credential',
    );
  });

  test('should allow to create a new credential', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <SmbMethodPart
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const newCredentialButton = screen.getByRole('button', {
      name: 'New Icon',
    });
    fireEvent.click(newCredentialButton);
    expect(onNewCredentialClick).toHaveBeenCalled();
  });

  test('should allow to change report format', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    const reportFormat1 = new ReportFormat({id: 'format1', name: 'Format 1'});
    const reportFormat2 = new ReportFormat({id: 'format2', name: 'Format 2'});
    render(
      <SmbMethodPart
        reportFormats={[reportFormat1, reportFormat2]}
        smbReportFormat={reportFormat1.id}
        onChange={onChange}
        onCredentialChange={onCredentialChange}
        onNewCredentialClick={onNewCredentialClick}
      />,
    );

    const reportFormatSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Report Format',
    });
    expect(reportFormatSelect).toHaveValue(reportFormat1.name);

    const reportFormatOptions =
      await getSelectItemElementsForSelect(reportFormatSelect);
    expect(reportFormatOptions).toHaveLength(2);
    expect(reportFormatOptions[0]).toHaveTextContent('Format 1');
    expect(reportFormatOptions[1]).toHaveTextContent('Format 2');

    fireEvent.click(reportFormatOptions[1]);
    expect(onChange).toHaveBeenCalledWith(
      reportFormat2.id,
      'smb_report_format',
    );
    expect(onChange).toHaveBeenCalledWith(UNSET_VALUE, 'smb_report_config');
  });

  test('should allow to change report config', async () => {
    const onChange = testing.fn();
    const onCredentialChange = testing.fn();
    const onNewCredentialClick = testing.fn();
    const {render} = rendererWith({capabilities: true});
    const reportFormat1 = new ReportFormat({id: 'format1', name: 'Format 1'});
    const reportConfig1 = new ReportConfig({
      id: 'config1',
      name: 'Config 1',
      reportFormat: reportFormat1,
    });
    const reportConfig2 = new ReportConfig({
      id: 'config2',
      name: 'Config 2',
      reportFormat: reportFormat1,
    });
    render(
      <SmbMethodPart
        reportConfigs={[reportConfig1, reportConfig2]}
        reportFormats={[reportFormat1]}
        smbReportConfig={reportConfig1.id}
        smbReportFormat={reportFormat1.id}
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
    expect(reportConfigOptions[1]).toHaveTextContent('Config 1');
    expect(reportConfigOptions[2]).toHaveTextContent('Config 2');

    fireEvent.click(reportConfigOptions[2]);
    expect(onChange).toHaveBeenCalledWith(
      reportConfig2.id,
      'smb_report_config',
    );
  });
});
