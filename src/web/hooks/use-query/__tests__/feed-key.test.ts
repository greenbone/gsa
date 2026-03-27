/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, wait, waitFor} from 'web/testing';
import {
  useGetKey,
  useDeleteKey,
  useUploadKey,
} from 'web/hooks/use-query/feed-key';

describe('feed-key hooks', () => {
  describe('useGetKey', () => {
    test('should fetch key data when jwt is available', async () => {
      const get = testing
        .fn()
        .mockResolvedValue({status: 'success', message: 'Key found'});

      const gmp = {
        feedkey: {
          get,
          delete: testing.fn(),
          save: testing.fn(),
        },
        settings: {
          jwt: 'test-jwt-token',
        },
      };

      const {renderHook} = rendererWith({gmp});
      const {result} = renderHook(() => useGetKey());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        status: 'success',
        message: 'Key found',
      });
      expect(get).toHaveBeenCalled();
    });

    test('should not fetch when jwt is not available', async () => {
      const get = testing.fn();

      const gmp = {
        feedkey: {
          get,
          delete: testing.fn(),
          save: testing.fn(),
        },
        settings: {
          jwt: undefined,
        },
      };

      const {renderHook} = rendererWith({gmp});
      const {result} = renderHook(() => useGetKey());

      await wait();

      expect(result.current.isFetching).toBe(false);
      expect(get).not.toHaveBeenCalled();
    });

    test('should handle error from get', async () => {
      const get = testing.fn().mockRejectedValue(new Error('Server error'));

      const gmp = {
        feedkey: {
          get,
          delete: testing.fn(),
          save: testing.fn(),
        },
        settings: {
          jwt: 'test-jwt-token',
        },
      };

      const {renderHook} = rendererWith({gmp});
      const {result} = renderHook(() => useGetKey());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Server error');
    });
  });

  describe('useDeleteKey', () => {
    test('should call delete on the feedkey command', async () => {
      const deleteFn = testing
        .fn()
        .mockResolvedValue({status: 'success', message: 'ok'});

      const gmp = {
        feedkey: {
          get: testing.fn().mockResolvedValue({status: 'success'}),
          delete: deleteFn,
          save: testing.fn(),
        },
        settings: {
          jwt: 'test-jwt-token',
        },
      };

      const {renderHook} = rendererWith({gmp});
      const {result} = renderHook(() => useDeleteKey());

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(deleteFn).toHaveBeenCalled();
    });

    test('should handle delete error', async () => {
      const deleteFn = testing
        .fn()
        .mockRejectedValue(new Error('Delete failed'));

      const gmp = {
        feedkey: {
          get: testing.fn().mockResolvedValue({status: 'success'}),
          delete: deleteFn,
          save: testing.fn(),
        },
        settings: {
          jwt: 'test-jwt-token',
        },
      };

      const {renderHook} = rendererWith({gmp});
      const {result} = renderHook(() => useDeleteKey());

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Delete failed');
    });
  });

  describe('useUploadKey', () => {
    test('should call renewSession and save with a file', async () => {
      const saveFn = testing
        .fn()
        .mockResolvedValue({status: 'success', message: 'ok'});
      const renewSessionFn = testing
        .fn()
        .mockResolvedValue({data: {timeout: 123, jwt: 'renewed-jwt'}});

      const gmp = {
        feedkey: {
          get: testing.fn().mockResolvedValue(null),
          delete: testing.fn(),
          save: saveFn,
        },
        user: {
          renewSession: renewSessionFn,
        },
        settings: {
          jwt: 'test-jwt-token',
        },
      };

      const {renderHook} = rendererWith({gmp});
      const {result} = renderHook(() => useUploadKey());

      const file = new File(['key-content'], 'feed.pem', {
        type: 'application/x-pem-file',
      });

      result.current.mutate(file);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(renewSessionFn).toHaveBeenCalled();
      expect(saveFn.mock.calls[0][0]).toBe(file);
    });

    test('should handle upload error', async () => {
      const saveFn = testing.fn().mockRejectedValue(new Error('Upload failed'));
      const renewSessionFn = testing
        .fn()
        .mockResolvedValue({data: {timeout: 123, jwt: 'renewed-jwt'}});

      const gmp = {
        feedkey: {
          get: testing.fn().mockResolvedValue(null),
          delete: testing.fn(),
          save: saveFn,
        },
        user: {
          renewSession: renewSessionFn,
        },
        settings: {
          jwt: 'test-jwt-token',
        },
      };

      const {renderHook} = rendererWith({gmp});
      const {result} = renderHook(() => useUploadKey());

      const file = new File(['bad-content'], 'feed.pem');

      result.current.mutate(file);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Upload failed');
    });
  });
});
