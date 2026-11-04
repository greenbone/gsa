/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {afterEach, describe, expect, test, testing} from '@gsa/testing';
import {renderHook, waitFor} from 'web/testing';
import useAgentControlInventory from 'web/hooks/useAgentControlInventory';

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
