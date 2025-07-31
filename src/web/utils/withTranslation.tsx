/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useLanguage from 'web/hooks/useLanguage';
import useTranslation, {I18n, TranslateFunc} from 'web/hooks/useTranslation';
import {updateDisplayName} from 'web/utils/displayName';

export interface WithTranslationComponentProps {
  _: TranslateFunc;
  i18n: I18n;
}

type WithTranslationProps<TProps> = Omit<TProps, '_' | 'i18n'>;

/**
 * Higher-Order Component that provides translation capabilities to class components
 * and ensures reactivity when the language changes
 *
 * @param Component - The component to wrap with translation capabilities
 * @returns A new component with translation props injected
 */
const withTranslation = <TProps extends WithTranslationComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  const WithTranslation = (props: WithTranslationProps<TProps>) => {
    const [_, i18n] = useTranslation();
    const [language] = useLanguage();

    // Using language as a key forces re-render of the component when language changes
    return (
      <Component
        {...(props as TProps)}
        key={`translation-wrapper-${language}`}
        _={_}
        i18n={i18n}
      />
    );
  };
  return updateDisplayName(WithTranslation, Component, 'withTranslation');
};

export default withTranslation;
