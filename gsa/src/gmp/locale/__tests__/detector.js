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

  test('should return languages from fake navigator', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: jest.fn().mockImplementation(l => l),
      isWhitelisted: jest.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const languages = jest.fn().mockReturnValue(['lorem', 'ipsum']);
    Object.defineProperty(navigator, 'languages', {
      get: languages,
    });

    detector.init({languageUtils}, {storage, navigator}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('lorem');
    expect(languages).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('lorem');
    expect(languageUtils.isWhitelisted).toHaveBeenCalledTimes(1);
    expect(languageUtils.isWhitelisted).toHaveBeenCalledWith('lorem');
  });

  test('should return language from fake navigator', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: jest.fn().mockImplementation(l => l),
      isWhitelisted: jest.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const language = jest.fn().mockReturnValue('lorem');
    Object.defineProperty(navigator, 'language', {
      get: language,
    });

    detector.init({languageUtils}, {storage, navigator}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('lorem');
    expect(language).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('lorem');
    expect(languageUtils.isWhitelisted).toHaveBeenCalledTimes(1);
    expect(languageUtils.isWhitelisted).toHaveBeenCalledWith('lorem');
  });

  test('should return userLanguage from fake navigator', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: jest.fn().mockImplementation(l => l),
      isWhitelisted: jest.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const userLanguage = jest.fn().mockReturnValue('lorem');
    Object.defineProperty(navigator, 'userLanguage', {
      get: userLanguage,
    });

    detector.init({languageUtils}, {storage, navigator}, {fallbackLng: 'bar'});

    expect(detector.detect()).toEqual('lorem');
    expect(userLanguage).toHaveBeenCalled();
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledTimes(1);
    expect(languageUtils.formatLanguageCode).toHaveBeenCalledWith('lorem');
    expect(languageUtils.isWhitelisted).toHaveBeenCalledTimes(1);
    expect(languageUtils.isWhitelisted).toHaveBeenCalledWith('lorem');
  });

  test('should return fallback when navigator is not available', () => {
    const storage = {};
    const languageUtils = {
      formatLanguageCode: jest.fn().mockImplementation(l => l),
      isWhitelisted: jest.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    detector.init(
      {languageUtils},
      {storage, navigator: null},
      {fallbackLng: 'bar'},
    );

    expect(detector.detect()).toEqual('bar');
    expect(languageUtils.formatLanguageCode).not.toHaveBeenCalled();
    expect(languageUtils.isWhitelisted).not.toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
