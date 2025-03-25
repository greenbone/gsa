/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import hoistStatics from 'hoist-non-react-statics';
import React from 'react';
import SvgIcon, {
  SvgIconProps,
  SvgIconRenderProps,
} from 'web/components/icon/SvgIcon';

interface SvgIconWrapperProps {
  [key: string]: unknown;
}

interface TitleComponent {
  title?: string;
}

const withSvgIcon =
  <T,>(defaults: SvgIconProps<T> = {}) =>
  (Component: React.ComponentType<TitleComponent>) => {
    const SvgIconWrapper: React.FC<SvgIconWrapperProps> = props => (
      <SvgIcon {...defaults} {...props}>
        {(svgProps: SvgIconRenderProps) => <Component {...svgProps} />}
      </SvgIcon>
    );
    return hoistStatics(SvgIconWrapper, Component);
  };

export default withSvgIcon;
