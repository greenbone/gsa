/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  FlagDeIcon,
  FlagEnIcon,
} from '@greenbone/opensight-ui-components-mantinev7';
import {ActionIcon} from '@mantine/core';
import {DEFAULT_LANGUAGE} from 'gmp/locale/lang';
import {useState} from 'react';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

type LanguageCode = 'en' | 'de';

interface Languages {
  EN: LanguageCode;
  DE: LanguageCode;
}

const LANGUAGES: Languages = {
  EN: DEFAULT_LANGUAGE as LanguageCode,
  DE: 'de',
};

const getNextLanguage = (language: LanguageCode): LanguageCode =>
  language === LANGUAGES.EN ? LANGUAGES.DE : LANGUAGES.EN;

const LanguageSwitch: React.FC = () => {
  const [language, setLanguage] = useLanguage();
  const [_] = useTranslation();
  const [isChangingLanguage, setIsChangingLanguage] = useState<boolean>(false);

  const nextLanguage: LanguageCode = getNextLanguage(language as LanguageCode);
  const titles: Record<LanguageCode, string> = {
    en: _('Switch language to English'),
    de: _('Switch language to German'),
  };

  const handleLanguageChange = async (): Promise<void> => {
    if (isChangingLanguage) {
      return;
    }

    try {
      setIsChangingLanguage(true);
      await setLanguage(nextLanguage);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
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
