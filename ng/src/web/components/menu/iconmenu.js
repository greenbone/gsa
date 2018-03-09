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

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import Theme from '../../utils/theme.js';

import Icon from '../icon/icon.js';

const IconMenu = glamorous.span('icon-menu', {
  display: 'inline-flex',
  flexDirection: 'column',
});

const Div = glamorous.div({
  position: 'relative',
  display: 'none',

  '.icon-menu:hover &': {
    display: 'block',
  },
});

const List = glamorous.ul({
  position: 'absolute',
  margin: 0,
  padding: 0,
  left: 0,
  top: 0,
  zIndex: Theme.Layers.menuEntry,
  listStyle: 'none',
  fontSize: '10px',
  width: '255px',
});

const Entry = glamorous.li('menu-entry', {
  height: '22px',
  width: '255px',
  borderLeft: '1px solid #3A3A3A',
  borderRight: '1px solid #3A3A3A',
  display: 'flex',
  alignItems: 'stretch',
  backgroundColor: '#FFFFFF',
  fontWeight: 'bold',
  textIndent: '12px',
  textAlign: 'left',

  '&:first-child': {
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '8px',
    borderTop: '1px solid #3A3A3A',
  },
  '&:last-child': {
    borderBottomRightRadius: '8px',
    borderBottomLeftRadius: '8px',
    borderBottom: '1px solid #3A3A3A',
  },
  '&:hover': {
    background: '#99CE48',
  },

  '& div': {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    cursor: 'pointer',
  },
});

const IconMenuContainer = ({
  children,
  icon,
  ...other
}) => {
  const menuentries = React.Children.map(children, child => (
    <Entry>
      {child}
    </Entry>
  ));
  return (
    <IconMenu>
      {is_defined(icon) ?
        icon :
        <Icon {...other}/>
      }
      <Div>
        <List>
          {menuentries}
        </List>
      </Div>
    </IconMenu>
  );
};

IconMenuContainer.propTypes = {
  icon: PropTypes.element,
};

export default IconMenuContainer;

// vim: set ts=2 sw=2 tw=80:
