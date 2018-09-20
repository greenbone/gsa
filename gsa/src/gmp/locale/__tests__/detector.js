/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {isFunction} from '../../utils/identity';

import LanguageDetector from '../detector';

describe('LanguageDetector tests', () => {

  test('should be a i18next language detector', () => {
    expect(LanguageDetector.type).toEqual('languageDetector');

    const detector = new LanguageDetector();
    expect(isFunction(detector.cacheUserLanguage)).toEqual(true);
    expect(isFunction(detector.detect)).toEqual(true);
    expect(isFunction(detector.init)).toEqual(true);
  });

  test('should detect language from store', () => {
    const languageUtils = {
      formatLanguageCode: jest.fn().mockReturnValue('foo'),
      isWhitelisted: jest.fn().mockReturnValue(true),
    };
    const storage = {};
    const locale = jest.fn().mockReturnValue('foo');
    Object.defineProperty(storage, 'locale', {
      get: locale,
    });

    const detector = new LanguageDetector();

    detector.init({languageUtils}, {storage});

    expect(detector.detect()).toEqual('foo');
    expect(locale).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('foo');
    expect(languageUtils.isWhitelisted).toHaveBeenCalledWith('foo');
  });

  test('should return fallback language', () => {
    const languageUtils = {
      formatLanguageCode: jest.fn().mockReturnValue('foo'),
      isWhitelisted: jest.fn().mockReturnValue(false),
    };
    const storage = {};
    const locale = jest.fn().mockReturnValue('foo');
    Object.defineProperty(storage, 'locale', {
      get: locale,
    });

    const detector = new LanguageDetector();

    detector.init({languageUtils}, {storage}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('bar');
    expect(locale).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('foo');
    expect(languageUtils.isWhitelisted).toHaveBeenCalledWith('foo');
  });

  test('should return language from navigator', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: jest.fn().mockImplementation(l => l),
      isWhitelisted: jest.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    // JSDom returns ['en-US', 'en'] for navigatior.languages
    // navigator and navigator.languages has been freezed

    detector.init({languageUtils}, {storage}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('en-US');
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('en-US');
    expect(languageUtils.isWhitelisted).toHaveBeenCalledTimes(1);
    expect(languageUtils.isWhitelisted).toHaveBeenCalledWith('en-US');
  });

});

// vim: set ts=2 sw=2 tw=80:
