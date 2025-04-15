/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  FlagDeIcon,
  FlagEnIcon,
} from '@greenbone/opensight-ui-components-mantinev7';
import {ActionIcon} from '@mantine/core';
import useGmp from 'web/hooks/useGmp';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

const LANGUAGES = {
  EN: 'en',
  DE: 'de',
};

const SETTING_ID_LOCALE = '6765549a-934e-11e3-b358-406186ea4fc5';

const getNextLanguage = language =>
  language === LANGUAGES.EN ? LANGUAGES.DE : LANGUAGES.EN;

const LanguageSwitch = () => {
  const [language, setLanguage] = useLanguage();
  const [_] = useTranslation();
  const gmp = useGmp();

  const nextLanguage = getNextLanguage(language);
  const titles = {
    en: _('Switch language to English'),
    de: _('Switch language to German'),
  };

  const handleLanguageChange = async () => {
    try {
      setLanguage(nextLanguage);

      await gmp.user.saveSetting(SETTING_ID_LOCALE, nextLanguage);

      gmp.setLocale(nextLanguage);
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <ActionIcon
      color="neutral.0"
      title={titles[nextLanguage]}
      variant="transparent"
      onClick={handleLanguageChange}
    >
      {language === LANGUAGES.EN ? <FlagEnIcon /> : <FlagDeIcon />}
    </ActionIcon>
  );
};

export default LanguageSwitch;
