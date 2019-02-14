/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import Layout from './layout';

const DEFAULT_MARGIN = '5px';

const DividerComponent = styled(Layout)`
  & > * {
    display: inline-flex;
  }
  ${props => {
    const edge = props.flex === 'column' ? 'Top' : 'Left';
    return {
      // try to fix flex-wrap indentation at second line and beyond by using a
      // negative outer margin
      ['margin' + edge]: '-' + props.margin,

      '& > *': {
        ['margin' + edge]: props.margin,
      },
    };
  }}
`;

DividerComponent.displayName = 'DividerComponent';

const DividerContainer = styled(Layout)`
  display: inline-flex;
`;

DividerContainer.displayName = 'DividerContainer';

const Divider = ({margin = DEFAULT_MARGIN, grow, ...props}) => {
  // put Divider into a container div to allow dividers in dividers
  return (
    <DividerContainer grow={grow}>
      <DividerComponent margin={margin} grow={grow} {...props} />
    </DividerContainer>
  );
};

Divider.propTypes = {
  grow: PropTypes.oneOfType([PropTypes.bool, PropTypes.numberOrNumberString]),
  margin: PropTypes.string,
};

export default Divider;

// vim: set ts=2 sw=2 tw=80:
