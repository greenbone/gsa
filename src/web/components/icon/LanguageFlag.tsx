/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ItalianFlag from 'web/components/icon/flags/ItalianFlag';
import JapaneseFlag from 'web/components/icon/flags/JapaneseFlag';
import SimplifiedChineseFlag from 'web/components/icon/flags/SimplifiedChineseFlag';
import TraditionalChineseFlag from 'web/components/icon/flags/TraditionalChineseFlag';

type LanguageFlagProps = {
  language: 'ja' | 'zh_CN' | 'zh_TW' | 'it';
};

const LanguageFlag = ({language}: LanguageFlagProps) => {
  const testId = `language-flag-${language}`;

  const flags = {
    ja: JapaneseFlag,
    zh_CN: SimplifiedChineseFlag,
    zh_TW: TraditionalChineseFlag,
    it: ItalianFlag,
  };

  const Flag = flags[language];
  return <Flag testId={testId} />;
};

export default LanguageFlag;
