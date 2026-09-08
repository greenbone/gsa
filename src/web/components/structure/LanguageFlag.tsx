/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {FlagDeIcon, FlagEnIcon} from '@greenbone/ui-lib';
import {type LanguageCode} from 'gmp/locale/languages';
import ItalianFlag from 'web/components/icon/flags/ItalianFlag';
import JapaneseFlag from 'web/components/icon/flags/JapaneseFlag';
import {type LanguageFlagProps} from 'web/components/icon/flags/LanguageFlagFrame';
import SimplifiedChineseFlag from 'web/components/icon/flags/SimplifiedChineseFlag';
import TraditionalChineseFlag from 'web/components/icon/flags/TraditionalChineseFlag';

type LanguageFlagComponentProps = {
  language: LanguageCode;
};

const EnFlag = ({testId}: LanguageFlagProps) => (
  <FlagEnIcon data-testid={testId} />
);

const DeFlag = ({testId}: LanguageFlagProps) => (
  <FlagDeIcon data-testid={testId} />
);

const flags = {
  en: EnFlag,
  de: DeFlag,
  ja: JapaneseFlag,
  zh_CN: SimplifiedChineseFlag,
  zh_TW: TraditionalChineseFlag,
  it: ItalianFlag,
} satisfies Record<LanguageCode, React.ComponentType<LanguageFlagProps>>;

const LanguageFlag = ({language}: LanguageFlagComponentProps) => {
  const Flag = flags[language];
  return <Flag testId={`language-flag-${language}`} />;
};

export default LanguageFlag;
