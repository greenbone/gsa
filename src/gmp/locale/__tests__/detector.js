/* Copyright (C) 2018-2022 Greenbone AG
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
      formatLanguageCode: vi.fn().mockReturnValue('foo'),
      isSupportedCode: vi.fn().mockReturnValue(true),
    };
    const storage = {};
    const locale = vi.fn().mockReturnValue('foo');
    Object.defineProperty(storage, 'locale', {
      get: locale,
    });

    const detector = new LanguageDetector();

    detector.init({languageUtils}, {storage});

    expect(detector.detect()).toEqual('foo');
    expect(locale).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('foo');
    expect(languageUtils.isSupportedCode).toHaveBeenCalledWith('foo');
  });

  test('should return fallback language', () => {
    const languageUtils = {
      formatLanguageCode: vi.fn().mockReturnValue('foo'),
      isSupportedCode: vi.fn().mockReturnValue(false),
    };
    const storage = {};
    const locale = vi.fn().mockReturnValue('foo');
    Object.defineProperty(storage, 'locale', {
      get: locale,
    });

    const detector = new LanguageDetector();

    detector.init({languageUtils}, {storage}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('bar');
    expect(locale).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('foo');
    expect(languageUtils.isSupportedCode).toHaveBeenCalledWith('foo');
  });

  test('should return language from navigator', () => {
    const storage = {};
    global.navigator = {language: 'en-US'};

    const languageUtils = {
      formatLanguageCode: vi.fn().mockImplementation(l => l),
      isSupportedCode: vi.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    detector.init({languageUtils}, {storage}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('en-US');
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('en-US');
    expect(languageUtils.isSupportedCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.isSupportedCode).toHaveBeenCalledWith('en-US');

    global.navigator = undefined;
  });

  test('should return languages from fake navigator', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: vi.fn().mockImplementation(l => l),
      isSupportedCode: vi.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const languages = vi.fn().mockReturnValue(['lorem', 'ipsum']);
    Object.defineProperty(navigator, 'languages', {
      get: languages,
    });

    detector.init({languageUtils}, {storage, navigator}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('lorem');
    expect(languages).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('lorem');
    expect(languageUtils.isSupportedCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.isSupportedCode).toHaveBeenCalledWith('lorem');
  });

  test('should return language from fake navigator', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: vi.fn().mockImplementation(l => l),
      isSupportedCode: vi.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const language = vi.fn().mockReturnValue('lorem');
    Object.defineProperty(navigator, 'language', {
      get: language,
    });

    detector.init({languageUtils}, {storage, navigator}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('lorem');
    expect(language).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('lorem');
    expect(languageUtils.isSupportedCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.isSupportedCode).toHaveBeenCalledWith('lorem');
  });

  test('should return userLanguage from fake navigator', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: vi.fn().mockImplementation(l => l),
      isSupportedCode: vi.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const userLanguage = vi.fn().mockReturnValue('lorem');
    Object.defineProperty(navigator, 'userLanguage', {
      get: userLanguage,
    });

    detector.init({languageUtils}, {storage, navigator}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('lorem');
    expect(userLanguage).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('lorem');
    expect(languageUtils.isSupportedCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.isSupportedCode).toHaveBeenCalledWith('lorem');
  });

  test('should return fallback when navigator is not available', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: vi.fn().mockImplementation(l => l),
      isSupportedCode: vi.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    detector.init(
      {languageUtils},
      {storage, navigator: null},
      {fallbackLng: 'bar'},
    );

    expect(detector.detect()).toEqual('bar');
    expect(languageUtils.formatLanguageCode).not.toHaveBeenCalled();
    expect(languageUtils.isSupportedCode).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
