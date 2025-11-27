/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, wait} from 'web/testing';
import date from 'gmp/models/date';
import Model from 'gmp/models/model';
import useEntityDownload from 'web/entity/hooks/useEntityDownload';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';

describe('useEntityDownload', () => {
  test('should allow to download an entity', async () => {
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsDefaultResponse);
    const entity = new Model(
      {
        id: '123',
        name: 'foo',
        creationTime: date('2025-01-01T00:00:00Z'),
        modificationTime: date('2025-01-01T00:00:00Z'),
      },
      'task',
    );
    const downloadedData = {id: '123'};
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const exportFunc = testing.fn().mockResolvedValue({data: downloadedData});

    const gmp = {
      task: {
        export: exportFunc,
      },
      user: {currentSettings},
    };
    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useEntityDownload(exportFunc, {
        onDownloaded,
        onDownloadError,
      }),
    );
    await wait(); // wait for currentSettings to be resolved and put into the store
    expect(currentSettings).toHaveBeenCalledOnce();
    expect(result.current).toBeDefined();
    await result.current(entity);
    expect(onDownloaded).toHaveBeenCalledWith({
      filename: 'task-123.xml',
      data: downloadedData,
    });
    expect(onDownloadError).not.toHaveBeenCalled();
  });

  test('should call onDownloadError when downloading an entity fails', async () => {
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsDefaultResponse);
    const error = new Error('error');
    const entity = new Model({id: '123'});
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const exportFunc = testing.fn().mockRejectedValue(error);

    const gmp = {
      task: {export: exportFunc},
      user: {currentSettings},
    };
    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useEntityDownload(exportFunc, {
        onDownloaded,
        onDownloadError,
      }),
    );

    await wait(); // wait for currentSettings to be resolved and put into the store
    expect(result.current).toBeDefined();
    await result.current(entity);
    expect(onDownloadError).toHaveBeenCalledWith(error);
    expect(onDownloaded).not.toHaveBeenCalled();
  });

  test('should allow to pass optional arguments to gmp method', async () => {
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsDefaultResponse);
    const entity = new Model({id: '123'}, 'task');
    const downloadedData = {id: '123'};
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const exportFunc = testing.fn().mockResolvedValue({data: downloadedData});

    const gmp = {
      task: {
        export: exportFunc,
      },
      user: {currentSettings},
    };
    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useEntityDownload(exportFunc, {
        onDownloaded,
        onDownloadError,
      }),
    );
    await wait(); // wait for currentSettings to be resolved and put into the store
    expect(result.current).toBeDefined();
    const options = {foo: 'bar', resourceType: 'custom'};
    await result.current(entity, options);
    expect(exportFunc).toHaveBeenCalledWith(
      entity,
      // should pass options to gmp method
      options,
    );
    expect(onDownloaded).toHaveBeenCalledWith({
      filename: 'custom-123.xml',
      data: downloadedData,
    });
    expect(onDownloadError).not.toHaveBeenCalled();
  });
});
