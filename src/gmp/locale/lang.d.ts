/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

interface LazyTranslate {
  toString(): string;
}

interface TranslateOptions {
  [key: string]: string | number;
}

declare module 'gmp/locale/lang' {
  /**
   * Localizes a given string lazily.
   *
   * When using this function, the key will be localized when the string is actually used.
   * That means it will be localized when the returned object is used in a string context.
   * For example when it is concatenated with another string or when used inside a template string.
   *
   * @param key - The key to be localized.
   * @returns The localized string.
   */
  export function _l(key: string, options?: TranslateOptions): LazyTranslate;

  /**
   * Localizes a given string key.
   * @param key - The key to be localized.
   * @returns The localized string.
   */
  export function _(key: string, options?: TranslateOptions): string;

  /**
   * Gets the current locale.
   * @returns The current locale as a string.
   */
  export function getLocale(): string;

  /**
   * Subscribes to language change events.
   * @param listener - A callback function to handle language changes.
   * @returns A function to unsubscribe from the events.
   */
  export function onLanguageChange(
    listener: (newLang: string) => void,
  ): () => void;

  /**
   * Sets the current locale.
   * @param lang - The language code to set as the current locale.
   */
  export function setLocale(lang: string): void;
}
