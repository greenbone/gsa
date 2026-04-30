/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import useUserName from 'web/hooks/useUserName';

describe('useUserName tests', () => {
  test('should return the users name', () => {
    const gmp = {
      settings: {
        session: {
          username: 'foo',
          subscribeToChanges: () => () => {},
        },
      },
    };
    const {renderHook} = rendererWith({gmp});

    const {result} = renderHook(() => useUserName());

    expect(result.current).toBe('foo');
  });
});
