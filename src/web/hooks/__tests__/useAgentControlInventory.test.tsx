/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  testing,
} from '@gsa/testing';
import {act, renderHook, waitFor} from 'web/testing';
import type UseAgentControlInventory from 'web/hooks/useAgentControlInventory';

let useAgentControlInventory: typeof UseAgentControlInventory;

beforeEach(async () => {
  testing.resetModules();
  useAgentControlInventory = (
    await import('web/hooks/useAgentControlInventory')
  ).default;
});

afterEach(() => {
  testing.restoreAllMocks();
});

describe('useAgentControlInventory', () => {
  test.each([
    new Response('', {status: 502}),
    new Response('<html>GSA fallback page</html>'),
    Response.json({
      version: 2,
      script: '/inventory.js',
      elementName: 'ac-inventory',
    }),
    Response.json({version: 1}),
  ])(
    'should finish discovery with an error for an unusable response %#',
    async response => {
      testing.spyOn(globalThis, 'fetch').mockResolvedValue(response);
      const {result} = renderHook(() => useAgentControlInventory());
      expect(result.current).toBeUndefined();
      await waitFor(() => expect(result.current).toBeNull());
    },
  );

  test('should finish discovery with an error when the gateway is unreachable', async () => {
    testing
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Connection refused'));
    const {result} = renderHook(() => useAgentControlInventory());
    await waitFor(() => expect(result.current).toBeNull());
  });
});

const manifest = {
  version: 1,
  script: '/inventory.js',
  elementName: 'ac-inventory',
  domains: [{id: 'network', label: 'Network'}],
};

test('shares discovery, survives consumer unmount, and caches success', async () => {
  let finish!: (response: Response) => void;
  const fetchMock = testing.spyOn(globalThis, 'fetch').mockReturnValue(
    new Promise<Response>(resolve => {
      finish = resolve;
    }),
  );
  const first = renderHook(() => useAgentControlInventory());
  const second = renderHook(() => useAgentControlInventory());
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  first.unmount();
  await act(async () => {
    finish(Response.json(manifest));
  });
  await waitFor(() =>
    expect(second.result.current?.domains).toEqual(manifest.domains),
  );
  const third = renderHook(() => useAgentControlInventory());
  expect(third.result.current).toBe(second.result.current);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('a later mount retries failure and updates persistent consumers', async () => {
  const fetchMock = testing
    .spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new Error('Temporary failure'))
    .mockResolvedValueOnce(Response.json(manifest));
  const menu = renderHook(() => useAgentControlInventory());
  const page = renderHook(() => useAgentControlInventory());
  await waitFor(() => {
    expect(menu.result.current).toBeNull();
    expect(page.result.current).toBeNull();
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const retry = renderHook(() => useAgentControlInventory());
  await waitFor(() =>
    expect(retry.result.current?.script).toBe(manifest.script),
  );
  expect(menu.result.current).toBe(retry.result.current);
  expect(page.result.current).toBe(retry.result.current);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
