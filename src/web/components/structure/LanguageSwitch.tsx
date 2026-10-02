/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {ActionIcon, Menu} from '@mantine/core';
import {DEFAULT_LANGUAGE} from 'gmp/locale/lang';
import Languages, {
  type LanguageCode,
  getLanguageCodes,
  isLanguageCode,
} from 'gmp/locale/languages';
import LanguageFlag from 'web/components/structure/LanguageFlag';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

const languageCodes = getLanguageCodes();

const LanguageSwitch = () => {
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
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const currentLanguage = isLanguageCode(language)
    ? language
    : DEFAULT_LANGUAGE;

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon
          aria-label={_('Select language')}
          color="neutral.0"
          loading={isChangingLanguage}
          title={_('Select language')}
          variant="transparent"
        >
          <LanguageFlag language={currentLanguage} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {languageCodes.map(code => (
          <Menu.Item
            key={code}
            leftSection={<LanguageFlag language={code} />}
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
