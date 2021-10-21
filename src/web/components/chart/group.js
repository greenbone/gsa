/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

const StyledGroup = styled.g`
  ${props =>
    isDefined(props.onClick)
      ? {
          cursor: 'pointer',
        }
      : undefined};
`;

const Group = ({left = 0, top = 0, scale = 1, ...props}) => (
  <StyledGroup
    transform={`translate(${left}, ${top}),scale(${scale})`}
    {...props}
  />
);

Group.propTypes = {
  left: PropTypes.number,
  scale: PropTypes.number,
  top: PropTypes.number,
};

export default Group;

// vim: set ts=2 sw=2 tw=80:
