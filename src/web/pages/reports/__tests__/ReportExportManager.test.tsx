/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {
  act,
  fireEvent,
  rendererWith,
  screen,
  waitFor,
  within,
} from 'web/testing';
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
  report: {
    download: testing.fn().mockResolvedValue({data: new ArrayBuffer(8)}),
  },
  auditreport: {
    download: testing.fn().mockResolvedValue({data: new ArrayBuffer(8)}),
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

const CompletedExportStarter = () => {
  const {start} = useReportExportManager();
  return (
    <button
      onClick={() => {
        void start({
          kind: 'scan',
          payload: exportPayload,
          filename: 'completed-report.xml',
          reportTitle: 'Completed report',
          reportUrl: '/report/report-uuid',
        });
      }}
    >
      Start completed export
    </button>
  );
};

const DirectDownloadStarter = () => {
  const {startDirect} = useReportExportManager();
  return (
    <button
      onClick={() =>
        startDirect({
          kind: 'delta_scan',
          payload: {
            report_id: 'report-uuid',
            format_id: 'format-uuid',
            config_id: 'config-uuid',
            delta_report_id: 'delta-uuid',
          },
          filename: 'report.xml',
          reportTitle: 'Direct report',
          reportUrl: '/report/report-uuid',
        })
      }
    >
      Start direct download
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
    const {render} = rendererWith({gmp, capabilities: true});

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
      within(activityPopover).getByRole('button', {
        name: 'Close export activity',
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('report-export-activity-button').querySelector('svg'),
    ).toHaveClass('lucide-download');
    expect(screen.getByTestId('report-export-activity-button')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Progress: generating')).toBeInTheDocument();

    fireEvent.click(
      within(activityPopover).getByRole('button', {
        name: 'Cancel report export',
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
      within(activityPopover).getByRole('button', {
        name: 'Retry cancellation',
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(
      within(activityPopover).queryByRole('button', {
        name: 'Cancel report export',
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
    const {render} = rendererWith({gmp, capabilities: true});

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

  test('removes a completed export from activity after browser handoff', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-completed'},
    });
    gmp.reportexport.getReportExports.mockResolvedValue({
      data: [{id: 'export-completed', status: 'done', progress: 'completed'}],
    });
    let resolveDownload: ((response: {data: ArrayBuffer}) => void) | undefined;
    gmp.reportexport.downloadReportExport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDownload = resolve;
        }),
    );
    window.URL.createObjectURL = testing.fn().mockReturnValue('blob:report');
    window.URL.revokeObjectURL = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <CompletedExportStarter />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(
      screen.getByRole('button', {name: 'Start completed export'}),
    );

    expect(await screen.findByText('Report exports (1)')).toBeInTheDocument();
    await waitFor(() =>
      expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1),
    );
    expect(screen.getByText('Preparing download')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'View report', hidden: true}),
    ).toHaveAttribute('href', '/report/report-uuid');
    expect(
      screen.queryByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Cancel report export',
        hidden: true,
      }),
    ).toBeInTheDocument();
    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });

    await waitFor(() =>
      expect(
        screen.queryByTestId('report-export-activity-button'),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByText('Report exports (1)')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Report export: Completed report'),
    ).not.toBeInTheDocument();
  });

  test('tracks direct downloads locally and removes them after browser handoff', async () => {
    const gmp = createGmp();
    let resolveDownload: ((response: {data: ArrayBuffer}) => void) | undefined;
    gmp.report.download.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDownload = resolve;
        }),
    );
    window.URL.createObjectURL = testing.fn().mockReturnValue('blob:report');
    window.URL.revokeObjectURL = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <DirectDownloadStarter />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(
      screen.getByRole('button', {name: 'Start direct download'}),
    );

    expect(
      await screen.findByText('Report download: Direct report'),
    ).toBeInTheDocument();
    expect(screen.getByText('Downloading report')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Cancel report export',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
    expect(gmp.report.download).toHaveBeenCalledWith(
      {id: 'report-uuid'},
      {
        reportFormatId: 'format-uuid',
        reportConfigId: 'config-uuid',
        deltaReportId: 'delta-uuid',
        filter: undefined,
      },
    );
    expect(gmp.reportexport.getReportExports).not.toHaveBeenCalled();

    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });
    await waitFor(() =>
      expect(screen.queryByTestId('report-export-activity-button')).toBeNull(),
    );
  });

  test('hides cancellation when the server does not advertise it', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-unsupported-cancel'},
    });
    gmp.reportexport.getReportExports.mockResolvedValue({
      data: [{id: 'export-unsupported-cancel', status: 'running'}],
    });
    const {render} = rendererWith({gmp, capabilities: false});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <MultiExportStarter />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Start two exports'}));
    await screen.findByText('Report export: Report A');
    expect(
      screen.queryByRole('button', {
        name: 'Cancel report export',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
    expect(gmp.reportexport.cancelReportExport).not.toHaveBeenCalled();
  });

  test('labels terminal-row removal separately from closing activity', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-failed'},
    });
    gmp.reportexport.getReportExports.mockResolvedValue({
      data: [
        {
          id: 'export-failed',
          status: 'error',
          errorMessage: 'Export failed',
        },
      ],
    });
    const {render} = rendererWith({gmp});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <CompletedExportStarter />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(
      screen.getByRole('button', {name: 'Start completed export'}),
    );

    const activityPopover = await screen.findByTestId(
      'report-export-activity-popover',
    );
    expect(
      await within(activityPopover).findByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(
      within(activityPopover).getByRole('button', {
        name: 'Close export activity',
        hidden: true,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(activityPopover).getByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId('report-export-activity-button')).toBeNull(),
    );
  });
});
