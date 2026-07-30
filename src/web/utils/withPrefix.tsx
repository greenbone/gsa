/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import {updateDisplayName} from 'web/utils/display-name';

export interface WithPrefixComponentProps {
  prefix?: string;
}

const withPrefix = <TProps extends WithPrefixComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  const ComponentPrefixWrapper = ({prefix, ...props}: TProps) => {
    const componentPrefix = isDefined(prefix) ? `${prefix}_` : '';
    const componentProps = {
      ...props,
      prefix: componentPrefix,
    } as TProps;

    return <Component {...componentProps} />;
  };
  return updateDisplayName(ComponentPrefixWrapper, Component, 'withPrefix');
};

export default withPrefix;
