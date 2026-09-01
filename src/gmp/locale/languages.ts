/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const BROWSER_LANGUAGE = 'Browser Language';

export const LANGUAGE_CODES = [
  'en',
  'de',
  'ja',
  'zh_TW',
  'zh_CN',
  'it',
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const isLanguageCode = (value: string): value is LanguageCode =>
  LANGUAGE_CODES.includes(value as LanguageCode);

export type Language = {
  readonly name: string;
  readonly native_name: string;
};

export type LanguagesType = Record<LanguageCode, Language>;

const Languages = {
  de: {
    name: 'German',
    native_name: 'Deutsch',
  },
  en: {
    name: 'English',
    native_name: 'English',
  },
  ja: {
    name: 'Japanese',
    native_name: '日本語',
  },
  zh_CN: {
    name: 'Simplified Chinese',
    native_name: '简体中文',
  },
  zh_TW: {
    name: 'Traditional Chinese',
    native_name: '繁體中文',
  },
  it: {
    name: 'Italian',
    native_name: 'Italiano',
  },
} as const satisfies LanguagesType;

export const getLanguageCodes = (): LanguageCode[] => [...LANGUAGE_CODES];

export default Languages;
