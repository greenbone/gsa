/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  FlagDeIcon,
  FlagEnIcon,
} from '@greenbone/opensight-ui-components-mantinev7';
import {ActionIcon} from '@mantine/core';
import {useState} from 'react';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

const LANGUAGES = {
  EN: 'en',
  DE: 'de',
};

const getNextLanguage = language =>
  language === LANGUAGES.EN ? LANGUAGES.DE : LANGUAGES.EN;

const LanguageSwitch = () => {
  const [language, setLanguage] = useLanguage();
  const [_] = useTranslation();
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
      setIsChangingLanguage(true);
      setLanguage(nextLanguage);
    } catch (error) {
      throw new Error(error);
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
