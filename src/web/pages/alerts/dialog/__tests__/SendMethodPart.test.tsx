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
import ReportConfig from 'gmp/models/report-config';
import ReportFormat from 'gmp/models/report-format';
import SendMethodPart from 'web/pages/alerts/dialog/SendMethodPart';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/Render';

describe('SendMethodPart tests', () => {
  test('should render SendMethodPart component', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(<SendMethodPart onChange={onChange} />);

    const hostInput = screen.getByRole('textbox', {name: 'Send to host'});
    expect(hostInput).toHaveAttribute('name', 'send_host');

    const portInput = screen.getByRole('textbox', {name: 'on port'});
    expect(portInput).toHaveAttribute('name', 'send_port');

    expect(screen.getByName('send_report_format')).toBeInTheDocument();
    expect(screen.getByName('send_report_config')).toBeInTheDocument();
  });

  test('should render with prefix', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(<SendMethodPart prefix="test" onChange={onChange} />);

    const hostInput = screen.getByRole('textbox', {name: 'Send to host'});
    expect(hostInput).toHaveAttribute('name', 'test_send_host');

    const portInput = screen.getByRole('textbox', {name: 'on port'});
    expect(portInput).toHaveAttribute('name', 'test_send_port');

    expect(screen.getByName('test_send_report_format')).toBeInTheDocument();
    expect(screen.getByName('test_send_report_config')).toBeInTheDocument();
  });

  test('should allow to change report format', async () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    const reportFormat1 = new ReportFormat({id: 'format1', name: 'Format 1'});
    const reportFormat2 = new ReportFormat({id: 'format2', name: 'Format 2'});
    render(
      <SendMethodPart
        reportFormats={[reportFormat1, reportFormat2]}
        sendReportFormat={reportFormat1.id}
        onChange={onChange}
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

    const reportConfigSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Report Config',
    });
    expect(reportConfigSelect).toHaveValue(UNSET_LABEL);

    fireEvent.click(reportFormatOptions[1]);
    expect(onChange).toHaveBeenCalledWith(
      reportFormat2.id,
      'send_report_format',
    );
    expect(onChange).toHaveBeenCalledWith(UNSET_VALUE, 'send_report_config');
  });

  test('should allow to change report config', async () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    const reportFormat1 = new ReportFormat({id: 'format1', name: 'Format 1'});
    const reportFormat2 = new ReportFormat({id: 'format2', name: 'Format 2'});
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
      <SendMethodPart
        reportConfigs={[reportConfig1, reportConfig2]}
        reportFormats={[reportFormat1, reportFormat2]}
        sendReportConfig={reportConfig1.id}
        sendReportFormat={reportFormat1.id}
        onChange={onChange}
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
      'send_report_config',
    );
  });
});
