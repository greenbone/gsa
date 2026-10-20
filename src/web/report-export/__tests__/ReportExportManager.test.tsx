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
import {
  showErrorNotification,
  showSuccessNotification,
} from '@greenbone/ui-lib';
import type * as UiLib from '@greenbone/ui-lib';
import {vi} from 'vitest';
import Capabilities from 'gmp/capabilities/capabilities';
import date from 'gmp/models/date';
import {
  createGmp,
  exportPayload,
} from 'web/report-export/__fixtures__/report-export-mocks';
import {ReportExportActivity} from 'web/report-export/ReportExportActivity';
import ReportExportManager, {
  useReportExportManager,
} from 'web/report-export/ReportExportManager';

vi.mock('@greenbone/ui-lib', async importOriginal => ({
  ...(await importOriginal<typeof UiLib>()),
  showSuccessNotification: vi.fn<typeof showSuccessNotification>(),
  showErrorNotification: vi.fn<typeof showErrorNotification>(),
}));

const MultiExportStarter = ({
  reports = [
    {reportTitle: 'Report A', filename: 'Report A.xml'},
    {reportTitle: 'Report B', filename: 'Report B.xml'},
  ],
}) => {
  const {exportReport} = useReportExportManager();
  return (
    <button
      onClick={() => {
        void Promise.all(
          reports.map(({reportTitle, filename}) =>
            exportReport({
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
  const {exportReport} = useReportExportManager();
  return (
    <button
      onClick={() => {
        void exportReport({
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
  const {exportReport} = useReportExportManager();
  return (
    <button
      onClick={() =>
        void exportReport({
          kind: 'scan',
          payload: {...exportPayload, reportId: 'other-report-uuid'},
          filename: 'other-report.xml',
          reportTitle: 'Other report',
        })
      }
    >
      Start another report export
    </button>
  );
};

const DeltaExportStarter = () => {
  const {exportReport} = useReportExportManager();
  return (
    <button
      onClick={() =>
        void exportReport({
          kind: 'delta_scan',
          payload: {
            reportId: 'report-uuid',
            reportFormatId: 'format-uuid',
            reportConfigId: 'config-uuid',
            deltaReportId: 'delta-uuid',
          },
          filename: 'report.xml',
          reportTitle: 'Direct report',
          reportUrl: '/report/report-uuid',
        })
      }
    >
      Start delta export
    </button>
  );
};

const ReportPage = ({onStarted}: {onStarted: () => void}) => {
  const {exportReport} = useReportExportManager();

  return (
    <button
      onClick={async () => {
        const started = await exportReport({
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
  beforeEach(() => testing.clearAllMocks());

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
      const gmp = createGmp([]);
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
    ['expired', 'Unavailable'],
    ['canceled', 'Canceled'],
  ])(
    'terminal %s takes precedence over queued progress',
    async (status, label) => {
      const gmp = createGmp([
        {
          id: 'export-1',
          status,
          progress: 'queued',
          errorMessage: 'Generation detail',
          owner: {name: 'test-user'},
          extension: 'xml',
        },
      ]);
      gmp.reportexport.exportScanReport.mockResolvedValue({
        data: {id: 'export-1'},
      });
      const {render} = rendererWith({gmp, capabilities: true});
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

  test('groups title, status and creation time above the action zone', async () => {
    const gmp = createGmp([
      {
        id: 'generating-export',
        status: 'running',
        progress: 'generating',
        owner: {name: 'test-user'},
        extension: 'pdf',
        creationTime: date('2026-10-15T11:00:00Z'),
      },
      {
        id: 'failed-export',
        status: 'error',
        errorMessage: 'Report failed',
        owner: {name: 'test-user'},
        extension: 'pdf',
        creationTime: date('2026-10-15T10:00:00Z'),
      },
    ]);
    gmp.reportexport.exportScanReport
      .mockResolvedValueOnce({data: {id: 'generating-export'}})
      .mockResolvedValueOnce({data: {id: 'failed-export'}});
    const {render} = rendererWith({gmp});
    render(
      <ReportExportManager>
        <ReportExportActivity />
        <MultiExportStarter
          reports={[
            {reportTitle: 'Unnamed', filename: 'report.pdf'},
            {reportTitle: 'Unnamed', filename: 'report.xml'},
          ]}
        />
      </ReportExportManager>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Start two exports'}));
    await screen.findByText('Generating');
    await screen.findByText('Export failed');
    const firstRow = screen.getAllByTestId('report-export-job')[0];
    const content = within(firstRow).getByTestId('report-export-content');
    expect(content.children[0]).toHaveAttribute(
      'data-testid',
      'report-export-metadata',
    );
    expect(content.children[1]).toHaveAttribute(
      'data-testid',
      'report-export-title',
    );
    expect(
      within(content).getByTestId('report-export-title'),
    ).toHaveTextContent('Report export:');
    expect(
      within(firstRow).getByTestId('report-export-metadata'),
    ).toContainElement(within(firstRow).getByTestId('report-export-status'));
    expect(
      within(firstRow).getByTestId('report-export-metadata'),
    ).toContainElement(
      within(firstRow).getByTestId('report-export-created-at'),
    );
    expect(
      within(firstRow).getByTestId('report-export-created-at'),
    ).toHaveStyle({marginLeft: 'auto'});
    expect(
      within(firstRow).getByTestId('report-export-created-at').firstChild,
    ).toHaveAttribute('aria-hidden', 'true');
    const failedRow = screen.getAllByTestId('report-export-job')[1];
    const failedFooter = within(failedRow).getByTestId('report-export-footer');
    expect(failedFooter.previousSibling).toHaveAttribute(
      'data-testid',
      'report-export-divider',
    );
    expect(
      within(failedFooter).getByTestId('report-export-actions'),
    ).toBeInTheDocument();
    expect(
      within(failedFooter).getByTestId('report-export-actions'),
    ).toBeInTheDocument();
    // the footer row spreads its content; Mantine Flex applies justify via
    // a CSS variable, so assert the computed style
    expect(failedFooter).toHaveComputedStyle(
      'justify-content',
      'space-between',
    );
    expect(
      within(failedFooter).getByLabelText('Remove from activity'),
    ).toBeInTheDocument();
    expect(
      within(failedRow).getByTestId('report-export-created-at'),
    ).toBeInTheDocument();
  });

  test('keeps completed rows and the total count visible while the activity is open', async () => {
    const gmp = createGmp([
      {
        id: 'export-uuid-1',
        status: 'running',
        owner: {name: 'test-user'},
        extension: 'xml',
      },
    ]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-uuid-1'},
    });
    const {render} = rendererWith({gmp});
    render(
      <ReportExportManager>
        <ReportExportActivity />
        <CompletedExportStarter />
      </ReportExportManager>,
    );
    fireEvent.click(screen.getByText('Start completed export'));
    // the in-flight export opens the activity
    expect(await screen.findByText('Generating')).toBeInTheDocument();

    // the export finishes while the activity is open and is downloaded
    // automatically
    gmp.inventory.exports[0] = {
      id: 'export-uuid-1',
      status: 'done',
      owner: {name: 'test-user'},
      extension: 'xml',
    };
    await waitFor(
      () =>
        expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1),
      {timeout: 7000},
    );

    // the completed row and the total count stay visible while open
    expect(await screen.findByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Report exports (1)')).toBeInTheDocument();
  }, 15000);

  test('keeps the activity visible after closing a completed download', async () => {
    const gmp = createGmp([
      {
        id: 'export-1',
        status: 'done',
        owner: {name: 'test-user'},
        extension: 'xml',
      },
    ]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-1'},
    });
    // the export row is no longer listed after the download (e.g. removed
    // by the server's retention cleanup)
    gmp.reportexport.downloadReportExport.mockImplementation(async () => {
      gmp.inventory.exports = [];
      return {data: new ArrayBuffer(8)};
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

    // the completed export keeps the activity visible after closing
    const activityButton = screen.getByTestId('report-export-activity-button');
    expect(activityButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(activityButton);
    expect(await screen.findByText('Report exports (1)')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();

    view.unmount();
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
  });

  test('clears finished rows and keeps in-flight exports on Clear completed', async () => {
    const gmp = createGmp();
    let createCount = 0;
    gmp.reportexport.exportScanReport.mockImplementation(async () => {
      createCount += 1;
      const id = `export-uuid-${createCount}`;
      gmp.inventory.exports.push({
        id,
        status:
          createCount === 1 ? 'done' : createCount === 2 ? 'error' : 'running',
        progress: 'generating',
        owner: {name: 'test-user'},
        extension: 'xml',
        errorMessage: createCount === 2 ? 'Report failed' : undefined,
      });
      return {data: {id}};
    });
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <ReportExportManager>
        <ReportExportActivity />
        <MultiExportStarter
          reports={[
            {reportTitle: 'Report A', filename: 'Report A.xml'},
            {reportTitle: 'Report B', filename: 'Report B.xml'},
            {reportTitle: 'Report C', filename: 'Report C.xml'},
          ]}
        />
      </ReportExportManager>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Start two exports'}));
    await screen.findByText('Complete');
    await screen.findByText('Export failed');
    await screen.findByText('Generating');

    fireEvent.click(screen.getByTestId('report-export-clear-completed'));

    // only the in-flight export remains
    expect(await screen.findByText('Report exports (1)')).toBeInTheDocument();
    expect(screen.getByText('Generating')).toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    expect(screen.queryByText('Export failed')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('report-export-clear-completed'),
    ).not.toBeInTheDocument();
  });

  test('distinguishes exports of the same report by extension', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: false});

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
    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(2);
  });

  test('shows a preparing state while export creation is pending', async () => {
    const gmp = createGmp([
      {
        id: 'export-preparing',
        status: 'running',
        progress: 'generating',
        owner: {name: 'test-user'},
      },
    ]);
    let resolveCreate: ((response: {data: {id: string}}) => void) | undefined;
    gmp.reportexport.exportScanReport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    );
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
    gmp.inventory.exports.push({
      id: 'export-canceled',
      get status() {
        return status;
      },
      progress: 'generating',
      owner: {name: 'test-user'},
    });
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-canceled'},
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

  test('uses async export for XML without report capability', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportDeltaScanReport.mockResolvedValue({
      data: {id: 'delta-export-id'},
    });
    const {render} = rendererWith({gmp, capabilities: false});

    render(
      <ReportExportManager>
        <>
          <ReportExportActivity />
          <DeltaExportStarter />
        </>
      </ReportExportManager>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Start delta export'}));
    await waitFor(() =>
      expect(gmp.reportexport.exportDeltaScanReport).toHaveBeenCalledTimes(1),
    );
  });

  test('does not apply cancellation to another report export', async () => {
    const gmp = createGmp();
    let exportCount = 0;
    gmp.reportexport.exportScanReport.mockImplementation(async () => {
      const id = `export-${++exportCount}`;
      // the created export is listed by gvmd right away
      gmp.inventory.exports.push({
        id,
        status: 'running',
        progress: 'generating',
        owner: {name: 'test-user'},
      });
      return {data: {id}};
    });
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
    gmp.inventory.exports[0].status = 'canceled';
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
    const gmp = createGmp([
      {
        id: 'export-uuid',
        status: 'running',
        progress: 'generating',
        owner: {name: 'test-user'},
      },
    ]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-uuid'},
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
    const gmp = createGmp([
      {id: 'export-1', status: 'running', owner: {name: 'test-user'}},
    ]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-1'},
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
    gmp.inventory.exports.push(
      {
        id: 'export-1',
        status: 'running',
        progress: 'generating',
        owner: {name: 'test-user'},
      },
      {
        id: 'export-2',
        status: 'pending',
        progress: 'queued',
        owner: {name: 'test-user'},
      },
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
    const reportJobs = screen.getAllByTestId('report-export-job');
    expect(
      within(reportJobs[0]).getByText('Report export: Report B (.xml)'),
    ).toBeInTheDocument();
    expect(
      within(reportJobs[1]).getByText('Report export: Report A (.xml)'),
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
    const gmp = createGmp([
      {
        id: 'export-completed',
        status: 'done',
        progress: 'completed',
        owner: {name: 'test-user'},
      },
    ]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-completed'},
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
      'complete',
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

  test('allows cancellation for users with report export access', async () => {
    const gmp = createGmp([
      {
        id: 'export-unsupported-cancel',
        status: 'running',
        owner: {name: 'test-user'},
      },
    ]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-unsupported-cancel'},
    });
    const {render} = rendererWith({
      gmp,
      capabilities: new Capabilities(['get_report_exports']),
    });

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
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Cancel report export',
        hidden: true,
      }),
    );
    await waitFor(() =>
      expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1),
    );
  });

  test('labels terminal-row removal separately from closing activity', async () => {
    const gmp = createGmp([
      {
        id: 'export-failed',
        status: 'error',
        errorMessage: 'Export failed',
        owner: {name: 'test-user'},
      },
    ]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-failed'},
    });
    const {render} = rendererWith({gmp, capabilities: false});

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
