/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, fireEvent, waitFor} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import ReportConfig from 'gmp/models/report-config';
import ReportFormat from 'gmp/models/report-format';
import {CONTAINER_SCANNING_RESULTS_THRESHOLD} from 'gmp/settings';
import DownloadReportDialog from 'web/pages/reports/DownloadReportDialog';
import {getSelectItemElementsForSelect} from 'web/testing/actions';
import {getSelectElement} from 'web/testing/custom-queries';

const filter = QueryFilter.fromString('rows=100');

const reportFormats = [
  ReportFormat.fromElement({_id: 'rf-1', name: 'PDF', report_type: 'scan'}),
  ReportFormat.fromElement({_id: 'rf-2', name: 'CSV', report_type: 'scan'}),
];

const defaultProps = {
  defaultReportFormatId: 'rf-1',
  filter,
  reportFormats,
  onClose: testing.fn(),
  onSave: testing.fn(),
};

describe('DownloadReportDialog', () => {
  test('submits the picked report format instead of the initial one', async () => {
    const onSave = testing.fn().mockResolvedValue(undefined);
    render(<DownloadReportDialog {...defaultProps} onSave={onSave} />);

    const select = getSelectElement();
    const items = await getSelectItemElementsForSelect(select);
    fireEvent.click(items[1]); // pick CSV instead of the default PDF

    fireEvent.click(screen.getByTestId('dialog-save-button'));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({reportFormatId: 'rf-2'}),
      ),
    );
  });

  test('resets the report config when the report format changes', async () => {
    const reportConfigs = [
      ReportConfig.fromElement({
        _id: 'config-1',
        name: 'Config 1',
        report_format: {_id: 'rf-1'},
      }),
      ReportConfig.fromElement({
        _id: 'config-2',
        name: 'Config 2',
        report_format: {_id: 'rf-2'},
      }),
    ];
    const onSave = testing.fn().mockResolvedValue(undefined);
    render(
      <DownloadReportDialog
        {...defaultProps}
        defaultReportConfigId="config-1"
        reportConfigs={reportConfigs}
        onSave={onSave}
      />,
    );

    const selects = screen.getAllByTestId('form-select');
    const configSelect = await getSelectItemElementsForSelect(
      selects[1] as HTMLSelectElement,
    );
    fireEvent.click(configSelect[1]); // pick Config 2 for the default format

    const formatItems = await getSelectItemElementsForSelect(
      selects[0] as HTMLSelectElement,
    );
    fireEvent.click(formatItems[1]); // switch the format to CSV

    fireEvent.click(screen.getByTestId('dialog-save-button'));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          reportFormatId: 'rf-2',
          reportConfigId: '',
        }),
      ),
    );
  });

  test('should render the dialog with scan report title', () => {
    render(<DownloadReportDialog {...defaultProps} />);

    expect(
      screen.getByText('Compose Content for Scan Report'),
    ).toBeInTheDocument();
  });

  test('should render the dialog with compliance report title when audit', () => {
    render(<DownloadReportDialog {...defaultProps} audit={true} />);

    expect(
      screen.getByText('Compose Content for Compliance Report'),
    ).toBeInTheDocument();
  });

  test('should not show container scanning warning when not container scanning', () => {
    render(
      <DownloadReportDialog
        {...defaultProps}
        isContainerScanning={false}
        totalResultCount={20000}
      />,
    );

    expect(
      screen.queryByText(/Please be aware that the report has more results/),
    ).not.toBeInTheDocument();
  });

  test('should show threshold message when not container scanning', () => {
    render(
      <DownloadReportDialog
        {...defaultProps}
        isContainerScanning={false}
        showThresholdMessage={true}
        threshold={1000}
        totalResultCount={20000}
      />,
    );

    expect(screen.getByText(/threshold of 1000/)).toBeInTheDocument();
  });

  describe('Container Scanning Threshold Warning', () => {
    test('should not show container scanning warning when container scanning but results below threshold', () => {
      render(
        <DownloadReportDialog
          {...defaultProps}
          isContainerScanning={true}
          totalResultCount={CONTAINER_SCANNING_RESULTS_THRESHOLD - 1}
        />,
      );

      expect(
        screen.queryByText(/Please be aware that the report has more results/),
      ).not.toBeInTheDocument();
    });

    test('should not show container scanning warning when container scanning and results equal to threshold', () => {
      render(
        <DownloadReportDialog
          {...defaultProps}
          isContainerScanning={true}
          totalResultCount={CONTAINER_SCANNING_RESULTS_THRESHOLD}
        />,
      );

      expect(
        screen.queryByText(/Please be aware that the report has more results/),
      ).not.toBeInTheDocument();
    });

    test('should show container scanning warning when container scanning and results exceed threshold', () => {
      render(
        <DownloadReportDialog
          {...defaultProps}
          isContainerScanning={true}
          totalResultCount={CONTAINER_SCANNING_RESULTS_THRESHOLD + 1}
        />,
      );

      expect(
        screen.getByText(
          `WARNING: Please be aware that the report has more results than the threshold of ${CONTAINER_SCANNING_RESULTS_THRESHOLD}. Therefore, this action can take a really long time to finish. It might even exceed the session timeout!`,
        ),
      ).toBeInTheDocument();
    });

    test('should show container scanning warning instead of threshold message when both conditions met', () => {
      render(
        <DownloadReportDialog
          {...defaultProps}
          isContainerScanning={true}
          showThresholdMessage={true}
          threshold={1000}
          totalResultCount={CONTAINER_SCANNING_RESULTS_THRESHOLD + 1000}
        />,
      );

      // ContainerScanningThresholdMessage takes priority
      expect(
        screen.getByText(
          `WARNING: Please be aware that the report has more results than the threshold of ${CONTAINER_SCANNING_RESULTS_THRESHOLD}. Therefore, this action can take a really long time to finish. It might even exceed the session timeout!`,
        ),
      ).toBeInTheDocument();

      // ThresholdMessage should NOT be shown
      expect(screen.queryByText(/threshold of 1000/)).not.toBeInTheDocument();
    });
  });
});
