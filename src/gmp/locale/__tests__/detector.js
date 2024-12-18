/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

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
      formatLanguageCode: testing.fn().mockReturnValue('foo'),
      isSupportedCode: testing.fn().mockReturnValue(true),
    };
    const storage = {};
    const locale = testing.fn().mockReturnValue('foo');
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
      formatLanguageCode: testing.fn().mockReturnValue('foo'),
      isSupportedCode: testing.fn().mockReturnValue(false),
    };
    const storage = {};
    const locale = testing.fn().mockReturnValue('foo');
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
      formatLanguageCode: testing.fn().mockImplementation(l => l),
      isSupportedCode: testing.fn().mockReturnValue(true),
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
      formatLanguageCode: testing.fn().mockImplementation(l => l),
      isSupportedCode: testing.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const languages = testing.fn().mockReturnValue(['lorem', 'ipsum']);
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
      formatLanguageCode: testing.fn().mockImplementation(l => l),
      isSupportedCode: testing.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const language = testing.fn().mockReturnValue('lorem');
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
      formatLanguageCode: testing.fn().mockImplementation(l => l),
      isSupportedCode: testing.fn().mockReturnValue(true),
    };

    const detector = new LanguageDetector();

    const navigator = {};
    const userLanguage = testing.fn().mockReturnValue('lorem');
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
      formatLanguageCode: testing.fn().mockImplementation(l => l),
      isSupportedCode: testing.fn().mockReturnValue(true),
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
