/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import {createSession} from 'gmp/testing';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';

describe('useUserIsLoggedIn tests', () => {
  test('should return the user logged-in state', () => {
    const session = createSession();
    const gmp = {
      settings: {
        session,
      },
    };
    const {renderHook} = rendererWith({gmp});

    const {result} = renderHook(() => useUserIsLoggedIn());

    expect(result.current).toBe(true);
  });

  test('should return the user logged-out state', () => {
    const session = createSession({isLoggedIn: () => false});
    const gmp = {
      settings: {
        session,
      },
    };
    const {renderHook} = rendererWith({gmp});

    const {result} = renderHook(() => useUserIsLoggedIn());

    expect(result.current).toBe(false);
  });
});
