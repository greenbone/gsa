/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {getLocale as getDateLocale} from 'gmp/locale/date';
import {_, setLocale, getLocale, onLanguageChange, _l} from 'gmp/locale/lang';
import {isFunction} from 'gmp/utils/identity';

describe('setLocale tests', () => {
  test('should change the i18n locale', () => {
    setLocale('en');
    expect(getLocale()).toEqual('en');

    setLocale('de');
    expect(getLocale()).toEqual('de');
  });

  test('should allow to use en-US for en', () => {
    setLocale('en');
    expect(getLocale()).toEqual('en');

    setLocale('de-CH');
    expect(getLocale()).toEqual('de-CH');
  });

  test('should fallback to en for unknown locales', () => {
    setLocale('en');
    expect(getLocale()).toEqual('en');

    setLocale('foo');
    expect(getLocale()).toEqual('en');
  });

  test('should notify language change listeners', () => {
    const callback = testing.fn();

    setLocale('en');
    expect(getLocale()).toEqual('en');

    const unsubscribe = onLanguageChange(callback);
    expect(isFunction(unsubscribe)).toEqual(true);

    setLocale('de');
    expect(getLocale()).toEqual('de');
    expect(callback).toHaveBeenCalledWith('de', false);
  });

  test('should not be notify when unsubscribed', () => {
    const callback = testing.fn();

    setLocale('en');
    expect(getLocale()).toEqual('en');

    const unsubscribe = onLanguageChange(callback);
    expect(isFunction(unsubscribe)).toEqual(true);

    setLocale('de');
    expect(getLocale()).toEqual('de');
    expect(callback).toHaveBeenCalledWith('de', false);

    callback.mockClear();

    unsubscribe();
    setLocale('en');
    expect(getLocale()).toEqual('en');
    expect(callback).not.toHaveBeenCalled();
  });

  test('should change the date locale too', () => {
    setLocale('en');
    expect(getLocale()).toEqual('en');
    expect(getDateLocale()).toEqual('en');

    setLocale('de');
    expect(getLocale()).toEqual('de');
    expect(getDateLocale()).toEqual('de');
  });
});

describe('translate tests', () => {
  test('should return english "translation"', () => {
    setLocale('en');

    expect(_('Foo')).toEqual('Foo');
  });
});

describe('translateLazy tests', () => {
  test('should lazy translate', () => {
    setLocale('en');

    expect(_l('Foo').toString).toBeDefined();
    expect(_l('Foo').toString()).toEqual('Foo');
    expect('' + _l('Foo')).toEqual('Foo');
    expect(`${_l('Foo')}`).toEqual('Foo');
  });
});
