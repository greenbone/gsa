/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {act, rendererWith, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import useReportExport from 'web/hooks/useReportExport';

const payload = {
  report_id: 'report-uuid',
  format_id: 'format-uuid',
};

const exportData = (status: string, progress = 'generating') => ({
  id: 'export-uuid',
  status,
  progress,
});

const createGmp = (exports: ReturnType<typeof exportData>[]) => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  reportexport: {
    getReportExports: testing
      .fn()
      .mockImplementation(async () => ({data: [exports.shift()]})),
    downloadReportExport: testing
      .fn()
      .mockResolvedValue({data: new ArrayBuffer(8)}),
    cancelReportExport: testing.fn().mockResolvedValue({}),
  },
});

describe('useReportExport', () => {
  test('downloads exactly once when the export is done', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const createExport = testing
      .fn()
      .mockResolvedValue({data: {id: 'export-uuid'}});
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({createExport, onDownload}),
    );

    await act(async () => {
      await result.current.start(payload);
    });
    await waitFor(() => expect(result.current.state.status).toBe('done'));
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  test('cancels an active export', async () => {
    const gmp = createGmp([exportData('running')]);
    const createExport = testing
      .fn()
      .mockResolvedValue({data: {id: 'export-uuid'}});
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({createExport, onDownload: testing.fn()}),
    );

    await act(async () => {
      await result.current.start(payload);
    });
    await waitFor(() => expect(result.current.state.status).toBe('running'));
    await act(async () => {
      await result.current.cancel();
    });
    expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledWith({
      reportExportId: 'export-uuid',
    });
    await waitFor(() =>
      expect(result.current.state.status).toBe('cancel_requested'),
    );
  });

  test('does not start a second export while one is active', async () => {
    const gmp = createGmp([exportData('running')]);
    const createExport = testing
      .fn()
      .mockResolvedValue({data: {id: 'export-uuid'}});
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({createExport, onDownload: testing.fn()}),
    );

    await act(async () => {
      await result.current.start(payload);
      await result.current.start(payload);
    });

    expect(createExport).toHaveBeenCalledTimes(1);
  });
});
