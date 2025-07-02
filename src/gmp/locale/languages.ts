/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const BROWSER_LANGUAGE = 'Browser Language';

export const getLanguageCodes = () => Object.keys(Languages);

export type Language = {
  readonly name: string;
  readonly native_name: string;
};

export type LanguagesType = {
  readonly [code: string]: Language;
};

const Languages: LanguagesType = {
  de: {
    name: 'German',
    native_name: 'Deutsch',
  },
  en: {
    name: 'English',
    native_name: 'English',
  },
  zh_TW: {
    name: 'Traditional Chinese',
    native_name: '繁體中文',
  },
} as const;

export default Languages;
