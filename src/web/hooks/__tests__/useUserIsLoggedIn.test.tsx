/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import {createSession} from 'gmp/testing';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';

const createGmp = ({
  isLoggedIn = undefined,
}: {isLoggedIn?: () => boolean} = {}) => ({
  session: createSession({isLoggedIn}),
});

describe('useUserIsLoggedIn tests', () => {
  test('should return the user logged-in state', () => {
    const {renderHook} = rendererWith({gmp: createGmp()});

    const {result} = renderHook(() => useUserIsLoggedIn());

    expect(result.current).toBe(true);
  });

  test('should return the user logged-out state', () => {
    const {renderHook} = rendererWith({
      gmp: createGmp({isLoggedIn: () => false}),
    });

    const {result} = renderHook(() => useUserIsLoggedIn());

    expect(result.current).toBe(false);
  });
});
