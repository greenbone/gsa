/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import useManualURL from 'web/hooks/useManualURL';
import {setLocale} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/Testing';


const gmp = {settings: {manualUrl: 'http://localhost/manual'}};

describe('useManualURL', () => {
  test('should return the manual URL for the default language', () => {
    const {renderHook} = rendererWith({
      store: true,
      gmp,
    });
    const {result} = renderHook(() => useManualURL());

    expect(result.current).toBe('http://localhost/manual/en');
  });

  test('should return the manual URL for the German language', () => {
    const {renderHook} = rendererWith({
      store: true,
      gmp,
    });
    const {result} = renderHook(() => useManualURL('de'));

    expect(result.current).toBe('http://localhost/manual/de');
  });

  test('should return the manual URL for the users language', () => {
    const {renderHook, store} = rendererWith({
      store: true,
      gmp,
    });
    store.dispatch(setLocale('de'));
    const {result} = renderHook(() => useManualURL());

    expect(result.current).toBe('http://localhost/manual/de');
  });

  test('should return the en manual URL for unknown language', () => {
    const {renderHook} = rendererWith({
      store: true,
      gmp,
    });
    const {result} = renderHook(() => useManualURL('foo'));

    expect(result.current).toBe('http://localhost/manual/en');
  });

  test('should return the en manual URL considering the lanuage mapping', () => {
    const {renderHook, store} = rendererWith({
      store: true,
      gmp: {
        settings: {
          ...gmp.settings,
          manualLanguageMapping: {
            fr: 'foo',
          },
        },
      },
    });
    store.dispatch(setLocale('fr'));
    const {result} = renderHook(() => useManualURL());

    expect(result.current).toBe('http://localhost/manual/foo');
  });
});
