/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {ActionIcon, Menu} from '@mantine/core';
import {FlagDeIcon, FlagEnIcon} from '@greenbone/ui-lib';
import {DEFAULT_LANGUAGE} from 'gmp/locale/lang';
import Languages, {getLanguageCodes} from 'gmp/locale/languages';
import LanguageFlag from 'web/components/icon/LanguageFlag';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

type LanguageCode = 'de' | 'en' | 'ja' | 'zh_CN' | 'zh_TW' | 'it';
type LocalFlagLanguage = 'ja' | 'zh_CN' | 'zh_TW' | 'it';
const languageCodes = getLanguageCodes() as LanguageCode[];

const getLanguageFlag = (language: string): React.ReactNode => {
  if (language === DEFAULT_LANGUAGE) {
    return <FlagEnIcon />;
  }

  if (language === 'de') {
    return <FlagDeIcon />;
  }

  if (['ja', 'zh_CN', 'zh_TW', 'it'].includes(language)) {
    return <LanguageFlag language={language as LocalFlagLanguage} />;
  }

  return <FlagDeIcon />;
};

const LanguageSwitch: React.FC = () => {
  const [language, setLanguage] = useLanguage();
  const [_] = useTranslation();
  const [isChangingLanguage, setIsChangingLanguage] = useState<boolean>(false);

  const handleLanguageChange = async (
    newLanguage: LanguageCode,
  ): Promise<void> => {
    if (isChangingLanguage) {
      return;
    }

    try {
      setIsChangingLanguage(true);
      await setLanguage(newLanguage);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsChangingLanguage(false);
    }
  };

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon
          aria-label={_('Select language')}
          color="neutral.0"
          disabled={isChangingLanguage}
          style={{
            backgroundColor: isChangingLanguage ? Theme.black : undefined,
            opacity: isChangingLanguage ? 1 : undefined,
          }}
          title={_('Select language')}
          variant="transparent"
        >
          {getLanguageFlag(language)}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {languageCodes.map(code => (
          <Menu.Item
            key={code}
            leftSection={getLanguageFlag(code)}
            onClick={() => void handleLanguageChange(code)}
          >
            {Languages[code].native_name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageSwitch;
