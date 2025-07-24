/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useLanguage from 'web/hooks/useLanguage';
import useTranslation, {I18n, TranslateFunc} from 'web/hooks/useTranslation';
import {updateDisplayName} from 'web/utils/displayName';

interface TranslationProps {
  _: TranslateFunc;
  i18n: I18n;
}

/**
 * Higher-Order Component that provides translation capabilities to class components
 * and ensures reactivity when the language changes
 *
 * @param WrappedComponent - The component to wrap with translation capabilities
 * @returns A new component with translation props injected
 */
const withTranslation = <TProps extends {} = {}>(
  WrappedComponent: React.ComponentType<TProps & TranslationProps>,
) => {
  const WithTranslation = (props: TProps) => {
    const [_, i18n] = useTranslation();
    const [language] = useLanguage();

    // Using language as a key forces re-render of the component when language changes
    return (
      <WrappedComponent
        {...props}
        key={`translation-wrapper-${language}`}
        _={_}
        i18n={i18n}
      />
    );
  };
  return updateDisplayName(
    WithTranslation,
    WrappedComponent,
    'withTranslation',
  );
};

export default withTranslation;
