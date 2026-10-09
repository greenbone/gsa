/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {StrictMode, useState} from 'react';
import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {
  act,
  fireEvent,
  rendererWith,
  screen,
  waitFor,
  within,
} from 'web/testing';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@greenbone/ui-lib';
import type * as UiLib from '@greenbone/ui-lib';
import {vi} from 'vitest';
import CollectionCounts from 'gmp/collection/collection-counts';
import {createSession} from 'gmp/testing';
import {ReportExportActivity} from 'web/pages/reports/ReportExportActivity';
import ReportExportManager, {
  useReportExportManager,
} from 'web/pages/reports/ReportExportManager';

vi.mock('@greenbone/ui-lib', async importOriginal => ({
  ...(await importOriginal<typeof UiLib>()),
  showSuccessNotification: vi.fn<typeof showSuccessNotification>(),
  showErrorNotification: vi.fn<typeof showErrorNotification>(),
}));

const exportPayload = {
  report_id: 'report-uuid',
  format_id: 'format-uuid',
};

const createGmp = () => ({
  session: createSession({token: 'test-token', username: 'test-user'}),
  settings: {},
  reportexport: {
    getReportExports: testing.fn().mockResolvedValue({
      data: [],
      meta: {counts: new CollectionCounts({first: 1})},
    }),
    exportScanReport: testing.fn(),
    exportAuditReport: testing.fn(),
    exportDeltaScanReport: testing.fn(),
    exportDeltaAuditReport: testing.fn(),
    getReportExport: testing.fn(),
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

const MultiExportStarter = ({
  reports = [
    {reportTitle: 'Report A', filename: 'Report A.xml'},
    {reportTitle: 'Report B', filename: 'Report B.xml'},
  ],
}) => {
  const {start} = useReportExportManager();
  return (
    <button
      onClick={() => {
        void Promise.all(
          reports.map(({reportTitle, filename}) =>
            start({
              kind: 'scan',
              payload: exportPayload,
              filename,
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

const CompletedExportStarter = ({
  filename = 'completed-report.xml',
  reportTitle = 'Completed report',
}) => {
  const {start} = useReportExportManager();
  return (
    <button
      onClick={() => {
        void start({
          kind: 'scan',
          payload: exportPayload,
          filename,
          reportTitle,
          reportUrl: '/report/report-uuid',
        });
      }}
    >
      Start completed export
    </button>
  );
};

const DifferentReportStarter = () => {
  const {start} = useReportExportManager();
  return (
    <button
      onClick={() =>
        void start({
          kind: 'scan',
          payload: {...exportPayload, report_id: 'other-report-uuid'},
          filename: 'other-report.xml',
          reportTitle: 'Other report',
        })
      }
    >
      Start another report export
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
    testing.clearAllMocks();
    window.sessionStorage.clear();
  });

  test.each([
    ['report.PDF', 'Release.1', 'Report export: Release.1 (.pdf)'],
    ['report.csv', 'Unnamed', 'Report export: Unnamed (.csv)'],
    ['report', 'Release.1', 'Report export: Release.1'],
    ['report.', 'Unnamed', 'Report export: Unnamed'],
    ['.report', 'Unnamed', 'Report export: Unnamed'],
    ['report.pdf', '', 'Report export (.pdf)'],
  ])(
    'shows the activity title for %s',
    async (filename, reportTitle, title) => {
      const gmp = createGmp();
      const {render} = rendererWith({gmp, capabilities: true});

      render(
        <ReportExportManager>
          <>
            <ReportExportActivity />
            <CompletedExportStarter
              filename={filename}
              reportTitle={reportTitle}
            />
          </>
        </ReportExportManager>,
      );

      fireEvent.click(
        screen.getByRole('button', {name: 'Start completed export'}),
      );

      await waitFor(() => expect(screen.getByText(title)).toBeInTheDocument());
    },
  );

  test.each([
    ['error', 'Export failed'],
    ['expired', 'Export expired'],
    ['canceled', 'Canceled'],
  ])(
    'terminal %s takes precedence over queued progress',
    async (status, label) => {
      const gmp = createGmp();
      gmp.reportexport.exportScanReport.mockResolvedValue({
        data: {id: 'export-1'},
      });
      gmp.reportexport.getReportExport.mockResolvedValue({
        data: [
          {
            id: 'export-1',
            status,
            progress: 'queued',
            errorMessage: 'Generation detail',
          },
        ],
      });
      const {render} = rendererWith({gmp});
      render(
        <ReportExportManager>
          <ReportExportActivity />
          <CompletedExportStarter />
        </ReportExportManager>,
      );
      fireEvent.click(screen.getByText('Start completed export'));
      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(screen.queryByText('Queued')).not.toBeInTheDocument();
      if (status !== 'canceled')
        expect(screen.getByText('Generation detail')).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'Remove from activity',
          hidden: true,
        }),
      ).toBeInTheDocument();
      expect(gmp.reportexport.downloadReportExport).not.toHaveBeenCalled();
    },
  );

  test('restores an unfinished intent once under StrictMode', async () => {
    const gmp = createGmp();
    gmp.reportexport.getReportExport.mockResolvedValue({
      data: [{id: 'export-1', status: 'done'}],
    });
    window.sessionStorage.setItem(
      'gsa-report-export-jobs:test-user',
      JSON.stringify([
        {
          key: 'local-intent',
          exportId: 'export-1',
          origin: 'local',
          filename: 'report.pdf',
          reportTitle: 'Local intent',
          autoDownload: true,
          disposition: 'awaiting',
        },
      ]),
    );
    const {render} = rendererWith({gmp});
    render(
      <StrictMode>
        <ReportExportManager>
          <ReportExportActivity />
        </ReportExportManager>
      </StrictMode>,
    );
    await waitFor(() =>
      expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1),
    );
    const button = await screen.findByTestId('report-export-activity-button');
    fireEvent.click(button);
    expect(await screen.findByText('Complete')).toBeInTheDocument();
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(gmp.reportexport.exportScanReport).not.toHaveBeenCalled();
  });

  test('opens activity for explicit local origin regardless of a legacy recovered key', async () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    gmp.session.username = undefined;
    gmp.reportexport.getReportExport.mockResolvedValue({
      data: [{id: 'export-1', status: 'running'}],
    });
    window.sessionStorage.setItem(
      'gsa-report-export-jobs:test-user',
      JSON.stringify([
        {
          key: 'recovered-local-intent',
          exportId: 'export-1',
          origin: 'local',
          filename: 'report.pdf',
          reportTitle: 'Local intent',
          autoDownload: true,
          disposition: 'awaiting',
        },
      ]),
    );
    const {render} = rendererWith({gmp});
    render(
      <ReportExportManager>
        <ReportExportActivity />
      </ReportExportManager>,
    );
    expect(
      screen.queryByTestId('report-export-activity-button'),
    ).not.toBeInTheDocument();
    act(() => {
      gmp.session.token = 'new-token';
      gmp.session.username = 'test-user';
      gmp.session.listener.forEach(listener => listener());
    });
    await waitFor(() =>
      expect(
        screen.getByTestId('report-export-activity-button'),
      ).toHaveAttribute('aria-expanded', 'true'),
    );
    expect(await screen.findByText('Generating')).toBeInTheDocument();
  });

  test('does not add historical ready jobs to activity', async () => {
    const gmp = createGmp();
    gmp.reportexport.getReportExports.mockResolvedValue({
      data: [
        {
          id: 'export-1',
          status: 'done',
          owner: {name: 'test-user'},
          extension: 'xml',
        },
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          rows: 100,
          length: 1,
          filtered: 1,
        }),
      },
    });
    gmp.reportexport.getReportExport.mockResolvedValue({
      data: [{id: 'export-1', status: 'done'}],
    });
    const {render} = rendererWith({gmp});
    render(
      <ReportExportManager>
        <ReportExportActivity />
      </ReportExportManager>,
    );
    await waitFor(() =>
      expect(gmp.reportexport.getReportExports).toHaveBeenCalled(),
    );
    expect(
      screen.queryByTestId('report-export-activity-button'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('report-export-job')).not.toBeInTheDocument();
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();
    expect(gmp.reportexport.downloadReportExport).not.toHaveBeenCalled();
  });

  test('hides completed rows when activity closes but preserves the handoff receipt', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-1'},
    });
    gmp.reportexport.getReportExport.mockResolvedValue({
      data: [{id: 'export-1', status: 'done'}],
    });
    const {render} = rendererWith({gmp});
    const view = render(
      <ReportExportManager>
        <ReportExportActivity />
        <CompletedExportStarter />
      </ReportExportManager>,
    );
    fireEvent.click(screen.getByText('Start completed export'));
    expect(await screen.findByText('Complete')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {name: 'Close export activity', hidden: true}),
    );
    expect(
      screen.queryByTestId('report-export-activity-button'),
    ).not.toBeInTheDocument();
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:test-user'),
    ).toContain('handed-off');
    view.unmount();
    render(
      <ReportExportManager>
        <ReportExportActivity />
      </ReportExportManager>,
    );
    expect(
      screen.queryByTestId('report-export-activity-button'),
    ).not.toBeInTheDocument();
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
  });

  test('distinguishes exports of the same report by extension', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <MultiExportStarter
            reports={[
              {reportTitle: 'Unnamed', filename: 'report.pdf'},
              {reportTitle: 'Unnamed', filename: 'report.xml'},
            ]}
          />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Start two exports'}));

    await waitFor(() => {
      expect(
        screen.getByText('Report export: Unnamed (.pdf)'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Report export: Unnamed (.xml)'),
      ).toBeInTheDocument();
    });
  });

  test('shows a preparing state while export creation is pending', async () => {
    const gmp = createGmp();
    let resolveCreate: ((response: {data: {id: string}}) => void) | undefined;
    gmp.reportexport.exportScanReport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    );
    gmp.reportexport.getReportExport.mockResolvedValue({
      data: [
        {id: 'export-preparing', status: 'running', progress: 'generating'},
      ],
    });
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

    const activityPopover = await screen.findByTestId(
      'report-export-activity-popover',
    );
    expect(within(activityPopover).getByText('Preparing')).toBeInTheDocument();
    expect(
      within(activityPopover).getByTestId('report-export-status'),
    ).toHaveAttribute('data-state', 'active');

    await act(async () => {
      resolveCreate?.({data: {id: 'export-preparing'}});
    });
    expect(
      await within(activityPopover).findByText('Generating'),
    ).toBeInTheDocument();
  });

  test('shows canceled exports as a distinct removable state', async () => {
    const gmp = createGmp();
    let status = 'running';
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-canceled'},
    });
    gmp.reportexport.getReportExport.mockImplementation(async () => ({
      data: [
        {
          id: 'export-canceled',
          status,
          progress: 'generating',
        },
      ],
    }));
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
    const activityPopover = await screen.findByTestId(
      'report-export-activity-popover',
    );
    await within(activityPopover).findByText('Generating');
    status = 'canceled';

    fireEvent.click(
      within(activityPopover).getByRole('button', {
        name: 'Cancel report export',
        hidden: true,
      }),
    );

    expect(
      await within(activityPopover).findByText('Canceled'),
    ).toBeInTheDocument();
    expect(
      within(activityPopover).getByTestId('report-export-status'),
    ).toHaveAttribute('data-state', 'canceled');
    expect(
      within(activityPopover).getByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    ).toBeInTheDocument();
  });

  test('does not apply cancellation to another report export', async () => {
    const gmp = createGmp();
    let exportCount = 0;
    const exportStatuses: Record<string, string> = {};
    gmp.reportexport.exportScanReport.mockImplementation(async () => {
      const id = `export-${++exportCount}`;
      exportStatuses[id] = 'running';
      return {data: {id}};
    });
    gmp.reportexport.getReportExport.mockImplementation(
      async ({reportExportId}: {reportExportId: string}) => ({
        data: [
          {
            id: reportExportId,
            status: exportStatuses[reportExportId],
            progress: 'generating',
          },
        ],
      }),
    );
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <CompletedExportStarter />
          <DifferentReportStarter />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(
      screen.getByRole('button', {name: 'Start completed export'}),
    );
    const activityPopover = await screen.findByTestId(
      'report-export-activity-popover',
    );
    await within(activityPopover).findByText('Generating');
    exportStatuses['export-1'] = 'canceled';
    fireEvent.click(
      within(activityPopover).getByRole('button', {
        name: 'Cancel report export',
        hidden: true,
      }),
    );
    await within(activityPopover).findByText('Canceled');

    fireEvent.click(
      screen.getByRole('button', {name: 'Start another report export'}),
    );
    expect(
      await within(activityPopover).findByText('Generating'),
    ).toBeInTheDocument();
    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(2);
    expect(within(activityPopover).getByText('Canceled')).toBeInTheDocument();
    expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1);
  });

  test('keeps progress and cancellation available after the report page unmounts', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-uuid'},
    });
    gmp.reportexport.getReportExport.mockResolvedValue({
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
    expect(screen.getByText('Generating')).toBeInTheDocument();

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
    expect(screen.getByText('Generating')).toBeInTheDocument();
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

  test('retains cancellation errors when activity closes during the request', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-1'},
    });
    gmp.reportexport.getReportExport.mockResolvedValue({
      data: [{id: 'export-1', status: 'running'}],
    });
    let rejectCancellation: ((error: Error) => void) | undefined;
    gmp.reportexport.cancelReportExport.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectCancellation = reject;
        }),
    );
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <ReportExportManager>
        <ReportExportActivity />
        <CompletedExportStarter />
      </ReportExportManager>,
    );
    fireEvent.click(screen.getByText('Start completed export'));
    await screen.findByText('Generating');
    fireEvent.click(
      screen.getByRole('button', {name: 'Cancel report export', hidden: true}),
    );
    await waitFor(() =>
      expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1),
    );
    fireEvent.click(
      screen.getByRole('button', {name: 'Close export activity', hidden: true}),
    );
    await act(async () => {
      rejectCancellation?.(new Error('Cancellation denied'));
    });
    await waitFor(() => expect(showErrorNotification).toHaveBeenCalledTimes(1));
    expect(showErrorNotification).toHaveBeenCalledWith('Cancellation denied');
    fireEvent.click(screen.getByTestId('report-export-activity-button'));
    expect(
      await screen.findByText('Cancellation failed: Cancellation denied'),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {name: 'Retry cancellation', hidden: true}),
    );
    await waitFor(() =>
      expect(
        screen.queryByText('Cancellation failed: Cancellation denied'),
      ).not.toBeInTheDocument(),
    );
    expect(showErrorNotification).toHaveBeenCalledTimes(1);
  });

  test('lists multiple report exports independently', async () => {
    const gmp = createGmp();
    let exportCount = 0;
    const createExport = testing.fn().mockImplementation(() => {
      exportCount += 1;
      return Promise.resolve({data: {id: `export-${exportCount}`}});
    });
    gmp.reportexport.exportScanReport = createExport;
    gmp.reportexport.getReportExport.mockImplementation(
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
      await screen.findByText('Report export: Report A (.xml)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Report export: Report B (.xml)'),
    ).toBeInTheDocument();
    const generatingStatus = await screen.findByText('Generating');
    expect(generatingStatus).toBeInTheDocument();
    expect(
      generatingStatus.closest('[data-testid="report-export-status"]'),
    ).toHaveAttribute('data-state', 'active');
    const queuedStatus = await screen.findByText('Queued');
    expect(
      queuedStatus.closest('[data-testid="report-export-status"]'),
    ).toHaveAttribute('data-state', 'queued');
    expect(createExport).toHaveBeenCalledTimes(2);
  });

  test('retains a completed export and its report link after browser handoff', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-completed'},
    });
    gmp.reportexport.getReportExport.mockResolvedValue({
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
    expect(
      screen.getByText('Report export: Completed report (.xml)'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    expect(
      screen
        .getByText('Downloading')
        .closest('[data-testid="report-export-status"]'),
    ).toHaveAttribute('data-state', 'downloading');
    expect(
      screen.getByRole('link', {name: 'View report details', hidden: true}),
    ).toHaveAttribute('href', '/report/report-uuid');
    expect(
      screen.queryByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Cancel report export',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });

    expect(showSuccessNotification).not.toHaveBeenCalled();
    expect(await screen.findByText('Complete')).toHaveAttribute(
      'data-state',
      'ready',
    );
    expect(
      screen.getByText('Report export: Completed report (.xml)'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'View report details', hidden: true}),
    ).toHaveAttribute('href', '/report/report-uuid');
    expect(
      screen.getByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByTestId('report-export-activity-button'),
      ).not.toBeInTheDocument(),
    );
  });

  test('notifies when a download starts while activity is closed', async () => {
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
    await waitFor(() => expect(gmp.report.download).toHaveBeenCalledTimes(1));

    const activityButton = screen.getByTestId('report-export-activity-button');
    fireEvent.click(activityButton);
    expect(activityButton).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });

    expect(showSuccessNotification).toHaveBeenCalledWith(
      '',
      'Report download started.',
    );
  });

  test('retains direct download activity after browser handoff', async () => {
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
      await screen.findByText('Report download: Direct report (.xml)'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    expect(
      screen
        .getByText('Downloading')
        .closest('[data-testid="report-export-status"]'),
    ).toHaveAttribute('data-state', 'downloading');
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
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();

    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });
    expect(await screen.findByText('Complete')).toHaveAttribute(
      'data-state',
      'ready',
    );
    expect(
      screen.getByText('Report download: Direct report (.xml)'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove from activity',
        hidden: true,
      }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId('report-export-activity-button')).toBeNull(),
    );
  });

  test('hides cancellation when the server does not advertise it', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-unsupported-cancel'},
    });
    gmp.reportexport.getReportExport.mockResolvedValue({
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
    await screen.findByText('Report export: Report A (.xml)');
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
    gmp.reportexport.getReportExport.mockResolvedValue({
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
