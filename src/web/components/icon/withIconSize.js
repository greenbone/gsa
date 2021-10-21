/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import styled from 'styled-components';

import hoistStatics from 'hoist-non-react-statics';

import {isArray} from 'gmp/utils/identity';

import {IconSizeContext} from 'web/components/provider/iconsizeprovider';

import PropTypes from 'web/utils/proptypes';

export const ICON_SIZE_LARGE_PIXELS = '50px';
export const ICON_SIZE_MEDIUM_PIXELS = '24px';
export const ICON_SIZE_SMALL_PIXELS = '16px';

const withIconSize = (defaultSize = 'small') => Component => {
  const IconSize = styled(Component)`
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
