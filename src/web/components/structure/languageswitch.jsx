/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {FlagDeIcon, FlagEnIcon} from '@greenbone/opensight-ui-components';
import {ActionIcon} from '@mantine/core';

import useLocale from 'web/hooks/useLocale';
import useTranslation from 'web/hooks/useTranslation';

const getNextLanguage = language => (language === 'en' ? 'de' : 'en');

const LanguageSwitch = () => {
  const [language, changeLanguage] = useLocale();
  const [_] = useTranslation();

  const nextLanguage = getNextLanguage(language);
  const titles = {
    en: _('Switch language to English'),
    de: _('Switch language to German'),
  };

  const handleLanguageChange = () => {
    changeLanguage(nextLanguage);
  };
  return (
    <ActionIcon
      variant="transparent"
      onClick={handleLanguageChange}
      title={titles[nextLanguage]}
      color="neutral.0"
    >
      {language === 'en' ? <FlagEnIcon /> : <FlagDeIcon />}
    </ActionIcon>
  );
};

export default LanguageSwitch;
