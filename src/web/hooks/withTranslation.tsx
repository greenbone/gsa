/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import hoistStatics from 'hoist-non-react-statics';
import i18next from 'i18next';
import React from 'react';
import useTranslation from 'web/hooks/useTranslation';

// Type for the translation props provided to the wrapped component
interface TranslationProps {
  _: (text: string, params?: {[key: string]: string | number}) => string;
  t: (text: string, params?: {[key: string]: string | number}) => string;
  i18n: typeof i18next;
  ready: boolean;
}

/**
 * Higher-Order Component (HOC) that provides translation capabilities
 * to class components. This HOC uses the useTranslation hook and passes
 * translation-related props to the wrapped component.
 *
 * @example
 *
 * class MyComponent extends React.Component {
 *   render() {
 *     const { _ } = this.props;
 *     return <div>{_('Hello World')}</div>;
 *   }
 * }
 *
 * export default withTranslation(MyComponent);
 *
 * @param Component The component to wrap
 * @returns A new component with translation props
 */
export function withTranslation<P extends object>(
  Component: React.ComponentType<P & TranslationProps>,
): React.ComponentType<Omit<P, keyof TranslationProps>> {
  const WithTranslation = (props: Omit<P, keyof TranslationProps>) => {
    const [translator, i18nInstance, isReady] = useTranslation();

    return (
      <Component
        {...(props as unknown as P)}
        _={translator}
        i18n={i18nInstance}
        ready={isReady}
        t={translator}
      />
    );
  };

  return hoistStatics(WithTranslation, Component);
}

export default withTranslation;
