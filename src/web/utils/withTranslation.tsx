/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useTranslation from 'web/hooks/useTranslation';

/**
 * Higher-Order Component that provides translation capabilities to class components
 * and ensures reactivity when the language changes
 *
 * @param WrappedComponent - The component to wrap with translation capabilities
 * @returns A new component with translation props injected
 */
const withTranslation = WrappedComponent => {
  const WithTranslation = props => {
    const [_, i18n, ready] = useTranslation();

    // Using i18n.language as a key forces re-render of the component when language changes
    return (
      <WrappedComponent
        {...props}
        key={`translation-wrapper-${i18n.language}`}
        _={_}
        i18n={i18n}
        ready={ready}
      />
    );
  };

  WithTranslation.displayName = `withTranslation(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithTranslation;
};

export default withTranslation;
