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

import withIconSize, {
  ICON_SIZE_SMALL_PIXELS,
} from 'web/components/icon/withIconSize';

import PropTypes from 'web/utils/proptypes';

const Styled = styled.span`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  margin: 1px;
  user-select: none;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

const Loading = styled.span`
  height: ${ICON_SIZE_SMALL_PIXELS + 'px'};
  width: ${ICON_SIZE_SMALL_PIXELS + 'px'};
  background: url(/img/loading.gif) center center no-repeat;
`;

const ArrowIcon = ({down = false, isLoading = false, ...props}) => (
  <Styled {...props}>{isLoading ? <Loading /> : down ? '▼' : '▲'}</Styled>
);

ArrowIcon.propTypes = {
  down: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default withIconSize()(ArrowIcon);

// vim: set ts=2 sw=2 tw=80:
