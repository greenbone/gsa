/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import {createSession} from 'gmp/testing';
import useSessionToken from 'web/hooks/useSessionToken';

const createGmp = () => ({
  session: createSession({token: 'mock-token'}),
});

describe('useSessionToken tests', () => {
  test('should return the user session token', () => {
    const {renderHook} = rendererWith({gmp: createGmp()});

    const {result} = renderHook(() => useSessionToken());

    expect(result.current).toBe('mock-token');
  });
});
