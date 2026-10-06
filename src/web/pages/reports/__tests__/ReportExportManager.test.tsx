/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor, within} from 'web/testing';
import {createSession} from 'gmp/testing';
import ReportExportManager, {
  ReportExportActivity,
  useReportExportManager,
} from 'web/pages/reports/ReportExportManager';

const exportPayload = {
  report_id: 'report-uuid',
  format_id: 'format-uuid',
};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  reportexport: {
    exportScanReport: testing.fn(),
    exportAuditReport: testing.fn(),
    exportDeltaScanReport: testing.fn(),
    exportDeltaAuditReport: testing.fn(),
    getReportExports: testing.fn(),
    cancelReportExport: testing.fn().mockResolvedValue({}),
    downloadReportExport: testing
      .fn()
      .mockResolvedValue({data: new ArrayBuffer(8)}),
  },
});

const MultiExportStarter = () => {
  const {start} = useReportExportManager();
  return (
    <button
      onClick={() => {
        void Promise.all(
          ['Report A', 'Report B'].map(reportTitle =>
            start({
              kind: 'scan',
              payload: exportPayload,
              filename: `${reportTitle}.xml`,
              reportTitle,
            }),
          ),
        );
      }}
    >
      Start two exports
    </button>
  );
};

const ReportPage = ({onStarted}: {onStarted: () => void}) => {
  const {start} = useReportExportManager();

  return (
    <button
      onClick={async () => {
        const started = await start({
          kind: 'scan',
          payload: exportPayload,
          filename: 'report.xml',
          reportTitle: 'Test report',
        });
        if (started) onStarted();
      }}
    >
      Start export and navigate
    </button>
  );
};

const PageSwitcher = () => {
  const [isReportPage, setIsReportPage] = useState(true);

  return isReportPage ? (
    <ReportPage onStarted={() => setIsReportPage(false)} />
  ) : (
    <p>Another page</p>
  );
};

describe('ReportExportManager', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  test('keeps progress and cancellation available after the report page unmounts', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-uuid'},
    });
    gmp.reportexport.getReportExports.mockResolvedValue({
      data: [{id: 'export-uuid', status: 'running', progress: 'generating'}],
    });
    gmp.reportexport.cancelReportExport.mockRejectedValue(
      new Error('Unknown command'),
    );
    const {render} = rendererWith({gmp, router: false});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <PageSwitcher />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(
      screen.getByRole('button', {name: 'Start export and navigate'}),
    );

    expect(await screen.findByText('Another page')).toBeInTheDocument();
    const activityPopover = await screen.findByTestId(
      'report-export-activity-popover',
    );
    expect(
      screen
        .getByTestId('report-export-activity-button')
        .querySelector('svg'),
    ).toHaveClass('lucide-download');
    expect(screen.getByTestId('report-export-activity-button')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Progress: generating')).toBeInTheDocument();

    fireEvent.click(
      within(activityPopover).getByRole('button', {
        name: 'Cancel export',
        hidden: true,
      }),
    );

    await waitFor(() => {
      expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText('Cancellation failed: Unknown command'),
    ).toBeInTheDocument();
    expect(screen.getByText('Progress: generating')).toBeInTheDocument();
    expect(
      within(activityPopover).queryByRole('button', {
        name: 'Retry cancellation',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
    expect(
      within(activityPopover).queryByRole('button', {
        name: 'Cancel export',
        hidden: true,
      }),
    ).not.toBeInTheDocument();

    const activityButton = screen.getByTestId('report-export-activity-button');
    fireEvent.click(activityButton);
    expect(activityButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(activityButton);
    expect(activityButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('lists multiple report exports independently', async () => {
    const gmp = createGmp();
    let exportCount = 0;
    const createExport = testing.fn().mockImplementation(() => {
      exportCount += 1;
      return Promise.resolve({data: {id: `export-${exportCount}`}});
    });
    gmp.reportexport.exportScanReport = createExport;
    gmp.reportexport.getReportExports.mockImplementation(
      async ({reportExportId}: {reportExportId: string}) => ({
        data: [
          {
            id: reportExportId,
            status: reportExportId === 'export-1' ? 'running' : 'pending',
            progress: reportExportId === 'export-1' ? 'generating' : 'queued',
          },
        ],
      }),
    );
    const {render} = rendererWith({gmp, router: false});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <MultiExportStarter />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Start two exports'}));

    expect(
      await screen.findByText('Report export: Report A'),
    ).toBeInTheDocument();
    expect(screen.getByText('Report export: Report B')).toBeInTheDocument();
    expect(await screen.findByText('Progress: generating')).toBeInTheDocument();
    expect(await screen.findByText('Queued')).toBeInTheDocument();
    expect(createExport).toHaveBeenCalledTimes(2);
  });
});
