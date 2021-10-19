/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {isFunction} from 'gmp/utils/identity';

import {getLocale as getDateLocale} from '../date';

import {_, setLocale, getLocale, onLanguageChange, _l} from '../lang';

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
    const callback = jest.fn();

    setLocale('en');
    expect(getLocale()).toEqual('en');

    const unsubscribe = onLanguageChange(callback);
    expect(isFunction(unsubscribe)).toEqual(true);

    setLocale('de');
    expect(getLocale()).toEqual('de');
    expect(callback).toHaveBeenCalledWith('de', false);
  });

  test('should not be notify when unsubscribed', () => {
    const callback = jest.fn();

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

// vim: set ts=2 sw=2 tw=80:
