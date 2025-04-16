/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  FlagDeIcon,
  FlagEnIcon,
} from '@greenbone/opensight-ui-components-mantinev7';
import {ActionIcon} from '@mantine/core';
import i18next from 'i18next';
import {useState} from 'react';
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
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const nextLanguage = getNextLanguage(language);
  const titles = {
    en: _('Switch language to English'),
    de: _('Switch language to German'),
  };

  const handleLanguageChange = async () => {
    if (isChangingLanguage) {
      return;
    }

    try {
      const newLanguage = nextLanguage;
      setIsChangingLanguage(true);

      await new Promise((resolve, reject) => {
        i18next.changeLanguage(newLanguage, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      gmp.setLocale(newLanguage);
      setLanguage(newLanguage);

      await gmp.user.saveSetting(SETTING_ID_LOCALE, newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChangingLanguage(false);
    }
  };

  return (
    <ActionIcon
      color="neutral.0"
      disabled={isChangingLanguage}
      title={titles[nextLanguage]}
      variant="transparent"
      onClick={handleLanguageChange}
    >
      {nextLanguage === LANGUAGES.DE ? <FlagEnIcon /> : <FlagDeIcon />}
    </ActionIcon>
  );
};

export default LanguageSwitch;
