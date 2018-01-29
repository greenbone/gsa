/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import glamorous from 'glamorous';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Link from '../link/link.js';

const DefaultEntry = glamorous.div('menu-default-entry', {
  display: 'flex',
  justifyContent: 'center',
  flexGrow: '1',

  '& a, & a:hover, & a:focus, & a:link': {
    color: '#FFFFFF',
    display: 'block',
    height: '35px',
    lineHeight: '35px',
    fontSize: '10px',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  '.menu:hover & a': {
    color: '#393637',
  },
});

const MenuPoint = glamorous.li('menu-point', {
  background: "url('/img/style/menu_pointy.png') no-repeat",
  display: 'block',
  height: '15px',
  marginTop: '-14px',
  marginLeft: '25px',
});

const StyledMenuEntry = glamorous.li('menu-entry', {
  '& a': {
    color: '#3A3A3A',
  },
  '&:last-child, &:last-child .menu-entry:last-child': {
    borderBottomRightRadius: '8px',
    borderBottomLeftRadius: '8px',
  },
  '& a, & a:hover, & a:focus, & a:link': {
    textDecoration: 'none',
    color: '#3A3A3A',
  },

  '& > .menu-section': {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    borderTop: '1px solid #b0b0b0',
  },
});

const MenuList = glamorous.ul('menu-list', {
  width: '255px',
  zIndex: '6',
  position: 'absolute',
  display: 'none',
  background: '#FAFAFA',
  border: '1px solid #3A3A3A',
  borderRadius: '0px 0px 8px 8px',

  '& .menu-entry': {
    display: 'flex',
    alignItems: 'stretch',
    textIndent: '12px',
    textAlign: 'left',
    color: '#3A3A3A',
    minHeight: '22px',
    fontSize: '10px',
    fontWeight: 'bold',
    width: '100%',
    backgroundColor: 'white',
  },
  '& .menu-entry:hover': {
    background: '#99CE48',
  },
});

const StyledMenu = glamorous.li('menu', {
  flexGrow: '1',
  flexShrink: '1',
  height: '35px',

  '&:hover': {
    backgroundColor: '#99ce48',
  },

  '&:hover > .menu-list': {
    display: 'block',
  },

  '& a': {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center', // center text vertically
  },

  '& a, & a:hover, & a:focus, & a:link': {
    background: 'none',
    textDecoration: 'none',
    color: '#3A3A3A',
  },
});

const Menu = ({
  children,
  title,
  to,
  ...props
}) => {
  let link;
  if (is_defined(to)) {
    link = <Link to={to}>{title}</Link>;
  }
  else if (is_defined(children) && children.length > 0) {
    const [child] = children;
    link = React.cloneElement(child, {title});
  }

  const menuentries = React.Children.map(children, child => (
    <StyledMenuEntry>
      {child}
    </StyledMenuEntry>
  ));

  return (
    <StyledMenu>
      <DefaultEntry>
        {link}
      </DefaultEntry>
      {is_defined(children) && children.length > 0 &&
        <MenuList>
          <MenuPoint/>
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
