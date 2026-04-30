/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';

describe('useUserIsLoggedIn tests', () => {
  test('should return the user logged-in state', () => {
    const gmp = {
      settings: {
        session: {
          isLoggedIn: () => true,
          subscribeToChanges: () => () => {},
        },
      },
    };
    const {renderHook} = rendererWith({gmp});

    const {result} = renderHook(() => useUserIsLoggedIn());

    expect(result.current).toBe(true);
  });
});
