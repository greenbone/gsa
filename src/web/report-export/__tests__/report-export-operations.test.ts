/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {QueryClient} from '@tanstack/react-query';
import {createSession} from 'gmp/testing';
import {createReportExportOperations} from 'web/report-export/report-export-operations';
import {type ReportExportMutations} from 'web/report-export/useReportExportMutations';

const params = {
  kind: 'scan' as const,
  payload: {reportId: 'report-uuid', reportFormatId: 'format-uuid'},
  filename: 'report.pdf',
  reportTitle: 'Report',
};

const setup = () => {
  let resolveCreate: ((response: {data: {id: string}}) => void) | undefined;
  const queryClient = new QueryClient();
  const gmp = {
    session: createSession({token: 'token', username: 'user'}),
    reportexport: {
      exportScanReport: testing.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            resolveCreate = resolve;
          }),
      ),
    },
  };
  const mutations: ReportExportMutations = {
    create: testing.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    ),
    cancel: testing.fn().mockResolvedValue({}),
    download: testing.fn().mockResolvedValue({data: new ArrayBuffer(8)}),
    direct: testing.fn().mockResolvedValue(new ArrayBuffer(8)),
  };
  const onDownload = testing.fn();
  const onError = testing.fn();
  const operations = createReportExportOperations({
    // @ts-expect-error partial gmp mock
    gmp,
    queryClient,
    token: 'token',
    username: 'user',
    sessionScope: 'test-session',
    callbacks: {onDownload, onError},
    mutations,
  });
  return {
    operations,
    gmp,
    mutations,
    queryClient,
    onError,
    resolve: (id: string) => resolveCreate?.({data: {id}}),
  };
};

describe('createReportExportOperations', () => {
  beforeEach(() => window.sessionStorage.clear());

  test('does nothing before activation', async () => {
    const {operations, gmp} = setup();
    expect(await operations.start(params)).toBe(false);
    expect(operations.startDirect(params)).toBe(false);
    expect(gmp.reportexport.exportScanReport).not.toHaveBeenCalled();
  });

  test('tracks a created export and persists its activity', async () => {
    const {operations, resolve} = setup();
    operations.activate();
    const started = operations.start(params);
    expect(operations.store.getSnapshot()[0].phase.stage).toBe('creating');
    resolve('export-1');
    expect(await started).toBe(true);
    expect(operations.store.getSnapshot()[0]).toMatchObject({
      exportId: 'export-1',
      phase: {stage: 'tracking'},
    });
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:user'),
    ).toContain('export-1');
  });

  test('does not write the ledger during unchanged synchronization', async () => {
    const {operations, resolve} = setup();
    operations.activate();
    const started = operations.start(params);
    resolve('export-1');
    await started;

    const setItem = testing.spyOn(window.sessionStorage, 'setItem');
    operations.sync();
    operations.sync();
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  test('persists a remote terminal status as abandoned activity', async () => {
    const {operations, queryClient, resolve} = setup();
    operations.activate();
    const started = operations.start(params);
    resolve('export-1');
    await started;
    queryClient.setQueryData(
      ['get_report_export', 'user', 'test-session', 'export-1'],
      {id: 'export-1', status: 'expired'},
    );

    operations.sync();

    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:user'),
    ).toContain('"disposition":"abandoned"');
  });

  test('ignores a create response that arrives after dispose', async () => {
    const {operations, onError, resolve} = setup();
    operations.activate();
    const started = operations.start(params);
    operations.dispose();
    resolve('export-1');
    expect(await started).toBe(false);
    expect(operations.store.getSnapshot()[0].exportId).toBeUndefined();
    expect(onError).not.toHaveBeenCalled();
  });
});
