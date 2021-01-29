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

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

const StyledDiv = styled.div`
  font-size: 16px;
  display: flex;
  align-items: start;
  flex-grow: 1;
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 2px;
  padding-top: 2px;

  border-left: ${props =>
    props.active
      ? '1px solid ' + Theme.dialogGray
      : '1px solid ' + Theme.white};
  border-right: 1px solid ${Theme.lightGray};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  background-color: ${props => (props.active ? Theme.dialogGray : undefined)};
  border-bottom: ${props =>
    props.active ? '1px solid ' + Theme.dialogGray : undefined};
  margin-bottom: ${props => (props.active ? '-2px' : undefined)};
  border-top: ${props =>
    props.active
      ? '2px solid ' + Theme.lightGreen
      : '2px solid ' + Theme.white};
  :hover {
    border-top: ${props =>
      props.active ? undefined : '2px solid ' + Theme.lightGray};
  }
  :first-child {
    border-left: ${props =>
      props.active
        ? '1px solid ' + Theme.lightGray
        : '1px solid ' + Theme.white};
  }
`;

const Tab = ({
  isActive = false,
  children,
  className,
  disabled = false,
  onActivate,
}) => (
  <StyledDiv
    active={isActive}
    className={className}
    onClick={disabled ? undefined : onActivate}
  >
    {children}
  </StyledDiv>
);

Tab.propTypes = {
  disabled: PropTypes.bool,
  isActive: PropTypes.bool,
  onActivate: PropTypes.func,
};

export default Tab;

// vim: set ts=2 sw=2 tw=80:
