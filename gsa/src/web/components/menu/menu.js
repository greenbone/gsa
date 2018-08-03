/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {isDefined, hasValue} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes.js';
import Theme from 'web/utils/theme.js';

import Link from 'web/components/link/link.js';

const StyledMenu = styled.li`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  margin: 1px;
  height: 35px;

  &:hover {
    border-bottom: 3px solid ${Theme.green};
  };

  & a {
    display: flex;
    flex-grow: 1;
    align-items: center; ${''/* center text vertically*/}
  };

  & a, & a:hover, & a:focus, & a:link {
    text-decoration: none;
  };
`;

const DefaultEntry = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;

  & a, & a:hover, & a:focus, & a:link {
    color: ${Theme.white};
    display: block;
    height: 35px;
    line-height: 35px;
    font-size: 10px;
    font-weight: bold;
    text-align: center;
  };
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
    color: ${Theme.darkGray};
  };

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
`;

const Menu = ({
  children,
  title,
  to,
  ...props
}) => {
  let link;
  if (isDefined(to)) {
    link = <Link to={to}>{title}</Link>;
  }
  else if (isDefined(children) && children.length > 0) {
    const [child] = children;
    link = React.cloneElement(child, {title});
  }

  const menuentries = React.Children.map(children, child => hasValue(child) ? (
    <StyledMenuEntry key={child.key}>
      {child}
    </StyledMenuEntry>
  ) : child);

  return (
    <StyledMenu>
      <DefaultEntry>
        {link}
      </DefaultEntry>
      {isDefined(children) && children.length > 0 &&
        <MenuList>
          {menuentries}
        </MenuList>
      }
    </StyledMenu>
  );
};

Menu.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string,
};

export default Menu;

// vim: set ts=2 sw=2 tw=80:
