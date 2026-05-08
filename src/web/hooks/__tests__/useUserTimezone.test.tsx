/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, wait} from 'web/testing';
import {createSession} from 'gmp/testing';
import useTimezone from 'web/hooks/useUserTimezone';

const createGmp = () => ({
  session: createSession({
    timezone: 'initial-timezone',
  }),
});

describe('useUserTimezone tests', () => {
  test('should return the user timezone', () => {
    const gmp = createGmp();
    const {renderHook} = rendererWith({gmp});

    const {result} = renderHook(() => useTimezone());

    expect(result.current[0]).toBe('initial-timezone');
  });

  test('should allow to update the user timezone', async () => {
    const gmp = createGmp();
    const {renderHook} = rendererWith({gmp});

    const {result} = renderHook(() => useTimezone());
    const [timezone, setTimezone] = result.current;

    expect(timezone).toBe('initial-timezone');

    setTimezone('updated-timezone');

    await wait();

    expect(result.current[0]).toBe('updated-timezone');
  });
});
