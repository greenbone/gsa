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

import styled, {keyframes} from 'styled-components';

import {isDefined, hasValue} from 'gmp/utils/identity';

import Link from 'web/components/link/link';

import MenuSection from 'web/components/menu/menusection';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const StyledMenu = styled.li`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  margin: 1px;
  height: 35px;

  &:hover {
    border-bottom: 3px solid ${Theme.green};
  }

  & a {
    display: flex;
    flex-grow: 1;
    align-items: center ${'' /* center text vertically*/};
  }

  & a,
  & a:hover,
  & a:focus,
  & a:link {
    text-decoration: none;
    color: ${Theme.black};
  }
`;

const DefaultEntry = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;

  & a,
  & a:hover,
  & a:focus,
  & a:link {
    color: ${Theme.white};
    display: block;
    height: 35px;
    line-height: 35px;
    font-size: 10px;
    font-weight: bold;
    text-align: center;
  }
`;

export const StyledMenuEntry = styled.li`
  display: flex;
  list-style: none;
  background: ${Theme.white};
  text-indent: 12px;
  text-align: left;
  color: ${Theme.darkGray};
  min-height: 22px;
  font-size: 10px;
  font-weight: bold;

  & a {
    line-height: 22px;
    color: ${Theme.darkGray};
  }

  & a:hover {
    color: ${Theme.white};
    background: ${Theme.green};
  }
`;

const MenuList = styled.ul`
  width: 255px;
  z-index: ${Theme.Layers.menu};
  position: absolute;
  display: none;
  background: ${Theme.green};
  border-top: 1px solid ${Theme.mediumGray};
  border-left: 1px solid ${Theme.mediumGray};
  border-right: 1px solid ${Theme.mediumGray};
  border-bottom: 1px solid ${Theme.mediumGray};
  list-style: none;
  padding-left: 0px;
  margin-left: -1px;

  ${StyledMenu}:hover & {
    display: block;
  }
  animation: ${keyframes({
      '0%': {
        transform: 'scale(0.9)',
        transformOrigin: 'top',
        opacity: 0,
        translateY: '0px',
      },
      '100%': {
        transform: 'scale(1.0)',
        transformOrigin: 'top',
        opacity: 1,
        translate: 0,
      },
    })}
    0.1s ease-in;
`;

const getFirstMenuEntry = child => {
  // return menu entries without the MenuSection
  if (child.type === MenuSection) {
    return React.Children.toArray(child.props.children).find(chil => !!chil);
  }
  return child;
};

const Menu = ({children, title, to, ...props}) => {
  let link;
  children = React.Children.toArray(children).filter(hasValue);

  if (isDefined(to)) {
    link = <Link to={to}>{title}</Link>;
  } else if (isDefined(children) && children.length > 0) {
    let [child] = children;
    child = getFirstMenuEntry(child);
    link = React.cloneElement(child, {title});
  }

  const menuentries = children.map(child => (
    <StyledMenuEntry key={child.key}>{child}</StyledMenuEntry>
  ));
  return (
    <StyledMenu>
      <DefaultEntry>{link}</DefaultEntry>
      {isDefined(children) && children.length > 0 && (
        <MenuList>{menuentries}</MenuList>
      )}
    </StyledMenu>
  );
};

Menu.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string,
};

export default Menu;

// vim: set ts=2 sw=2 tw=80:
