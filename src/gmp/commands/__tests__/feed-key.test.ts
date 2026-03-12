/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  testing,
  beforeEach,
  afterEach,
} from '@gsa/testing';
import FeedKeyCommand from 'gmp/commands/feed-key';
import {createHttp} from 'gmp/commands/testing';

const createMockSettings = (jwt?: string) =>
  ({
    jwt,
  }) as FeedKeyCommand['settings'];

describe('FeedKeyCommand', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('get', () => {
    test('should return key data when key exists', async () => {
      const mockResponse = {status: 'success', message: 'Key found'};
      globalThis.fetch = testing.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const fakeHttp = createHttp({});
      const settings = createMockSettings('test-jwt-token');
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      const result = await cmd.get();

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/service/feed-key/api/v1/key',
        {
          headers: {Authorization: 'Bearer test-jwt-token'},
        },
      );
    });

    test('should throw error when request fails', async () => {
      globalThis.fetch = testing.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const fakeHttp = createHttp({});
      const settings = createMockSettings('test-jwt-token');
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      await expect(cmd.get()).rejects.toThrow('Request failed: 500');
    });

    test('should throw error when not authenticated', async () => {
      const fakeHttp = createHttp({});
      const settings = createMockSettings();
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      await expect(cmd.get()).rejects.toThrow('Not authenticated');
    });
  });

  describe('delete', () => {
    test('should delete the feed key', async () => {
      const mockResponse = {
        message: 'Key deleted successfully',
        status: 'success',
      };
      globalThis.fetch = testing.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const fakeHttp = createHttp({});
      const settings = createMockSettings('test-jwt-token');
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      const result = await cmd.delete();

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/service/feed-key/api/v1/key',
        {
          method: 'DELETE',
          headers: {Authorization: 'Bearer test-jwt-token'},
        },
      );
    });

    test('should throw error with server message on failure', async () => {
      globalThis.fetch = testing.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({message: 'Permission denied'}),
      });

      const fakeHttp = createHttp({});
      const settings = createMockSettings('test-jwt-token');
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      await expect(cmd.delete()).rejects.toThrow('Permission denied');
    });

    test('should throw default message when server provides none', async () => {
      globalThis.fetch = testing.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const fakeHttp = createHttp({});
      const settings = createMockSettings('test-jwt-token');
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      await expect(cmd.delete()).rejects.toThrow('Key deletion failed');
    });

    test('should throw error when not authenticated', async () => {
      const fakeHttp = createHttp({});
      const settings = createMockSettings();
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      await expect(cmd.delete()).rejects.toThrow('Not authenticated');
    });
  });

  describe('save', () => {
    test('should upload a feed key file', async () => {
      const mockResponse = {
        message: 'Key uploaded successfully',
        status: 'success',
      };
      globalThis.fetch = testing.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const fakeHttp = createHttp({});
      const settings = createMockSettings('test-jwt-token');
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      const file = new File(['key-content'], 'feed.pem', {
        type: 'application/x-pem-file',
      });
      const result = await cmd.save(file);

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/service/feed-key/api/v1/key',
        expect.objectContaining({
          method: 'POST',
          headers: {Authorization: 'Bearer test-jwt-token'},
        }),
      );
    });

    test('should throw error with server message on failure', async () => {
      globalThis.fetch = testing.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({message: 'Invalid key data'}),
      });

      const fakeHttp = createHttp({});
      const settings = createMockSettings('test-jwt-token');
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      const file = new File(['bad-content'], 'feed.pem');

      await expect(cmd.save(file)).rejects.toThrow('Invalid key data');
    });

    test('should throw default message when server provides none', async () => {
      globalThis.fetch = testing.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const fakeHttp = createHttp({});
      const settings = createMockSettings('test-jwt-token');
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      const file = new File(['bad-content'], 'feed.pem');

      await expect(cmd.save(file)).rejects.toThrow('Key save failed');
    });

    test('should throw error when not authenticated', async () => {
      const fakeHttp = createHttp({});
      const settings = createMockSettings();
      const cmd = new FeedKeyCommand(fakeHttp, settings);

      const file = new File(['content'], 'feed.pem');

      await expect(cmd.save(file)).rejects.toThrow('Not authenticated');
    });
  });
});
