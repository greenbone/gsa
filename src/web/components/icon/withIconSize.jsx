/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import hoistStatics from 'hoist-non-react-statics';

import {isArray} from 'gmp/utils/identity';

import {IconSizeContext} from 'web/components/provider/iconsizeprovider';

import PropTypes from 'web/utils/proptypes';
import {styledExcludeProps} from 'web/utils/styledConfig';

export const ICON_SIZE_LARGE_PIXELS = '50px';
export const ICON_SIZE_MEDIUM_PIXELS = '24px';
export const ICON_SIZE_SMALL_PIXELS = '16px';

const withIconSize =
  (defaultSize = 'small') =>
  Component => {
    const IconSize = styledExcludeProps(styled(Component), ['iconSize'])`
      ${props => {
        const {iconSize = defaultSize, size = iconSize} = props;

        let width;
        let height;

        if (size === 'small') {
          height = width = ICON_SIZE_SMALL_PIXELS;
        } else if (size === 'medium') {
          height = width = ICON_SIZE_MEDIUM_PIXELS;
        } else if (size === 'large') {
          height = width = ICON_SIZE_LARGE_PIXELS;
        } else if (size === 'tiny') {
          height = width = '11px';
        } else if (isArray(size)) {
          width = size[0];
          height = size[1];
        }

        return {
          height,
          width,
          lineHeight: height,
          '& *': {
            height: 'inherit',
            width: 'inherit',
          },
        };
      }}
    `;

    const IconSizeWrapper = props => (
      <IconSizeContext.Consumer>
        {iconSize => <IconSize {...props} iconSize={iconSize} />}
      </IconSizeContext.Consumer>
    );

    IconSizeWrapper.displayName = 'withIconSize';

    IconSizeWrapper.propTypes = {
      iconSize: PropTypes.iconSize,
      size: PropTypes.iconSize,
    };

    return hoistStatics(IconSizeWrapper, Component);
  };

export default withIconSize;

// vim: set ts=2 sw=2 tw=80:
