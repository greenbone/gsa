/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {QueryClient} from '@tanstack/react-query';
import {createSession} from 'gmp/testing';
import {createReportExportController} from 'web/report-export/controller';

const params = {
  kind: 'scan' as const,
  payload: {report_id: 'report-uuid', format_id: 'format-uuid'},
  filename: 'report.pdf',
  reportTitle: 'Report',
};

const setup = () => {
  let resolveCreate: ((response: {data: {id: string}}) => void) | undefined;
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
  const onDownload = testing.fn();
  const onError = testing.fn();
  const controller = createReportExportController({
    // @ts-expect-error partial gmp mock
    gmp,
    queryClient: new QueryClient(),
    token: 'token',
    username: 'user',
    callbacks: {onDownload, onError},
  });
  return {
    controller,
    gmp,
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
    controller.sync();
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:user'),
    ).toContain('export-1');
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
