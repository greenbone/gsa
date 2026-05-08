/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import {createSession} from 'gmp/testing';
import useUserName from 'web/hooks/useUserName';

const createGmp = () => ({
  session: createSession({
    username: 'foo',
  }),
});

describe('useUserName tests', () => {
  test('should return the users name', () => {
    const gmp = createGmp();
    const {renderHook} = rendererWith({gmp});

    const {result} = renderHook(() => useUserName());

    expect(result.current).toBe('foo');
  });
});
