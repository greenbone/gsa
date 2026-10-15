/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {QueryClient} from '@tanstack/react-query';
import {createSession} from 'gmp/testing';
import {createReportExportController} from 'web/report-export/controller';
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
  const controller = createReportExportController({
    // @ts-expect-error partial gmp mock
    gmp,
    queryClient,
    token: 'token',
    username: 'user',
    callbacks: {onDownload, onError},
    mutations,
  });
  return {
    controller,
    gmp,
    mutations,
    queryClient,
    onError,
    resolve: (id: string) => resolveCreate?.({data: {id}}),
  };
};

describe('createReportExportController', () => {
  beforeEach(() => window.sessionStorage.clear());

  test('does nothing before activation', async () => {
    const {controller, gmp} = setup();
    expect(await controller.start(params)).toBe(false);
    expect(controller.startDirect(params)).toBe(false);
    expect(gmp.reportexport.exportScanReport).not.toHaveBeenCalled();
  });

  test('tracks a created export and persists its intent', async () => {
    const {controller, resolve} = setup();
    controller.activate();
    const started = controller.start(params);
    expect(controller.store.getSnapshot()[0].phase.stage).toBe('creating');
    resolve('export-1');
    expect(await started).toBe(true);
    expect(controller.store.getSnapshot()[0]).toMatchObject({
      exportId: 'export-1',
      phase: {stage: 'tracking'},
    });
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:user'),
    ).toContain('export-1');
  });

  test('does not write the ledger during unchanged synchronization', async () => {
    const {controller, resolve} = setup();
    controller.activate();
    const started = controller.start(params);
    resolve('export-1');
    await started;

    const setItem = testing.spyOn(window.sessionStorage, 'setItem');
    controller.sync();
    controller.sync();
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  test('persists a remote terminal status as an abandoned intent', async () => {
    const {controller, queryClient, resolve} = setup();
    controller.activate();
    const started = controller.start(params);
    resolve('export-1');
    await started;
    queryClient.setQueryData(['get_report_export', 'token', 'export-1'], {
      id: 'export-1',
      status: 'expired',
    });

    controller.sync();

    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:user'),
    ).toContain('"disposition":"abandoned"');
  });

  test('ignores a create response that arrives after dispose', async () => {
    const {controller, onError, resolve} = setup();
    controller.activate();
    const started = controller.start(params);
    controller.dispose();
    resolve('export-1');
    expect(await started).toBe(false);
    expect(controller.store.getSnapshot()[0].exportId).toBeUndefined();
    expect(onError).not.toHaveBeenCalled();
  });
});
