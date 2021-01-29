/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import Icon from 'web/components/icon/icon';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const IconMenu = styled.span`
  display: inline-flex;
  flex-direction: column;
`;

const Div = styled.div`
  position: relative;
  display: none;

  ${IconMenu}:hover & {
    display: block;
  }
`;

const List = styled.ul`
  position: absolute;
  margin: 0;
  padding: 0;
  left: 0;
  top: 0;
  z-index: ${Theme.Layers.onTop};
  list-style: none;
  font-size: 10px;
  width: 255px;
`;

const Entry = styled.li`
  height: 22px;
  width: 255px;
  border-left: 1px solid ${Theme.mediumGray};
  border-right: 1px solid ${Theme.mediumGray};
  display: flex;
  align-items: stretch;
  background-color: ${Theme.white};
  font-weight: bold;
  text-indent: 12px;
  text-align: left;

  &:first-child {
    border-top: 1px solid ${Theme.mediumGray};
  }
  &:last-child {
    border-bottom: 1px solid ${Theme.mediumGray};
  }
  &:hover {
    background: ${Theme.green};
    color: ${Theme.white};
  }

  & div {
    display: flex;
    align-items: center;
    flex-grow: 1;
    cursor: pointer;
  }
`;

const IconMenuContainer = ({children, icon, ...other}) => {
  const menuentries = React.Children.map(children, child => (
    <Entry>{child}</Entry>
  ));
  return (
    <IconMenu>
      {isDefined(icon) ? icon : <Icon {...other} />}
      <Div>
        <List>{menuentries}</List>
      </Div>
    </IconMenu>
  );
};

IconMenuContainer.propTypes = {
  icon: PropTypes.element,
};

export default IconMenuContainer;

// vim: set ts=2 sw=2 tw=80:
