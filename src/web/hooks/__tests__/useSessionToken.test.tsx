/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import useSessionToken from 'web/hooks/useSessionToken';

describe('useSessionToken tests', () => {
  test('should return the user session token', () => {
    const gmp = {
      settings: {
        session: {
          token: 'mock-token',
          subscribeToChanges: () => () => {},
        },
      },
    };
    const {renderHook} = rendererWith({gmp});

    const {result} = renderHook(() => useSessionToken());

    expect(result.current).toBe('mock-token');
  });
});
