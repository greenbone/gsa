/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {updateDisplayName} from 'web/utils/displayName';

/**
 * A higher-order component (HOC) that provides default props to a given component.
 * This function allows you to specify default values for props, which will be merged
 * with the props passed to the wrapped component.
 *
 * @template TProps - The type of the props for the wrapped component.
 * @param options - An object containing default values for the props. These defaults
 *                  will be overridden by any props explicitly passed to the component.
 *
 * @example
 * ```tsx
 * interface MyComponentProps {
 *   title?: string;
 *   count: number;
 * }
 *
 * const MyComponent = ({ title, count = 0 }: MyComponentProps) => (
 *   <div>
 *     <h1>{title}</h1>
 *     <p>Count: {count}</p>
 *   </div>
 * );
 *
 * const MyComponentWithDefaults = withComponentDefaults<MyComponentProps>({ title: 'Hello World' })(MyComponent);
 *
 * // Usage
 * <MyComponentWithDefaults count={5} /> // Renders with title "Hello World" and count 5
 * ```
 */
export function withComponentDefaults<TProps>(options: Partial<TProps> = {}) {
  return (Component: React.ComponentType<TProps>) => {
    const ComponentDefaultsWrapper = (props: TProps) => (
      <Component {...options} {...props} />
    );
    return updateDisplayName(
      ComponentDefaultsWrapper,
      Component,
      'withComponentDefaults',
    );
  };
}

export default withComponentDefaults;
