/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import useLanguage from 'web/hooks/useLanguage';
import {rendererWith, wait} from 'web/utils/Testing';

describe('useLanguage', () => {
  test('should return the current language and setLanguage function from context', () => {
    const {renderHook} = rendererWith();

    const {result} = renderHook(() => useLanguage());

    expect(result.current[0]).toBe('en');
  });

  test('should call setLanguage when the setter function is invoked', async () => {
    const {renderHook} = rendererWith();

    const {result} = renderHook(() => useLanguage());

    const setLanguage = result.current[1];
    const newLanguage = 'fr';

    setLanguage(newLanguage);

    await wait();

    expect(result.current[0]).toBe(newLanguage);
  });
});
