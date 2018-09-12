/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import Theme from 'web/utils/theme';

import ArrowIcon from 'web/components/icon/arrowicon';

const Div = styled.div`
  display: none;
`;

const Menu = styled.div`
  padding: 1px 0;
  cursor: pointer;

  &:hover {
    ${Div} {
      display: block;
    };
  };
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: absolute;
  padding: 1px 0 0 0;
  margin: 0;
  left: 0;
  top: 100%;
  margin-top: -1px;
  z-index: ${Theme.Layers.onTop};
  list-style: none;
  font-size: 10px;
  width: 255px;
`;

const Entry = styled.li`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-grow: 1;
  cursor: pointer;
  height: 22px;
  width: 255px;
  border-left: 1px solid ${Theme.mediumGray};
  border-right: 1px solid ${Theme.mediumGray};
  background-color: ${Theme.white};
  font-weight: bold;
  text-indent: 12px;
  text-align: left;
  color: ${Theme.black};

  &:last-child {
    border-bottom: 1px solid ${Theme.mediumGray};
  };
  &:hover {
    background: ${Theme.green};
    color: ${Theme.white};
  };
`;

const DisplayMenu = ({
  children,
}) => (
  <Menu>
    <ArrowIcon down={true}/>
    <Div>
      <List>
        {React.Children.map(children, child => (
          child ? (
            <Entry>
              {child}
            </Entry>
          ) : null
        ))}
      </List>
    </Div>
  </Menu>
);

DisplayMenu.propTypes = {
  children: PropTypes.array.isRequired,
};

export default DisplayMenu;

// vim: set ts=2 sw=2 tw=80:
