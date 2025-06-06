/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo} from 'react';
import i18next from 'i18next';
import _ from 'gmp/locale';
import useLanguage from 'web/hooks/useLanguage';

type TranslationHook = {
  t: typeof _;
  i18n: typeof i18next;
  ready: boolean;
} & [typeof _, typeof i18next, boolean];

/**
 * Hook to get the translation function, an i18next instance and a boolean
 * indicating if the translations are ready. Currently, the ready status is
 * always true.
 *
 * The return value can be used as in array or object.
 *
 * @example
 *
 * const [_, i18n, ready] = useTranslation();
 *
 * or
 *
 * const {t, i18n, ready} = useTranslation();
 *
 * @returns Array|Object with the translation function, i18next instance and ready status
 */
const useTranslation = (): TranslationHook => {
  const [language] = useLanguage();

  return useMemo(() => {
    // provide same interface as useTranslation from i18next
    // this will allow to use react-i18next in future if required
    const ret = [_, i18next, true] as TranslationHook;
    ret.t = _;
    ret.i18n = i18next;
    ret.ready = true;
    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);
};

export default useTranslation;
