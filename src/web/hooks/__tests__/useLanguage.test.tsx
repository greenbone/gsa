/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import useLanguage from 'web/hooks/useLanguage';

describe('useLanguage', () => {
  test('should return the current language and setLanguage function from context', () => {
    const mockLanguage = 'en';
    const mockSetLanguage = testing.fn();

    const {renderHook} = rendererWith({
      language: {
        language: mockLanguage,
        setLanguage: mockSetLanguage,
      },
    });

    const {result} = renderHook(() => useLanguage());

    expect(result.current[0]).toBe(mockLanguage);
    expect(result.current[1]).toBe(mockSetLanguage);
  });

  test('should call setLanguage when the setter function is invoked', async () => {
    const mockSetLanguage = testing.fn().mockResolvedValue(undefined);

    const {renderHook} = rendererWith({
      language: {
        language: 'en',
        setLanguage: mockSetLanguage,
      },
    });

    const {result} = renderHook(() => useLanguage());

    const [, setLanguage] = result.current;
    await setLanguage('fr');

    expect(mockSetLanguage).toHaveBeenCalledWith('fr');
  });
});
