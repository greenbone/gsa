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

import glamorous from 'glamorous';

import PropTypes from '../../utils/proptypes';
import Theme from '../../utils/theme';

import ArrowIcon from '../icon/arrowicon';

const Div = glamorous.div('display-menu-container', {
  display: 'none',
});

const Menu = glamorous.div('display-menu', {
  padding: '1px 0',
  cursor: 'pointer',

  '&:hover': {
    '& .display-menu-container': {
      display: 'block',
    },
    '& .arrow-icon': {
      color: Theme.darkGreen,
    },
  },
});

const List = glamorous.ul('display-menu-list', {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  position: 'absolute',
  padding: '1px 0 0 0',
  margin: 0,
  left: 0,
  top: '100%',
  marginTop: '-1px',
  zIndex: Theme.Layers.onTop,
  listStyle: 'none',
  fontSize: '10px',
  width: '255px',
});

const Entry = glamorous.li('display-menu-entry', {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  flexGrow: 1,
  cursor: 'pointer',
  height: '22px',
  width: '255px',
  borderLeft: `1px solid ${Theme.mediumGray}`,
  borderRight: `1px solid ${Theme.mediumGray}`,
  backgroundColor: Theme.white,
  fontWeight: 'bold',
  textIndent: '12px',
  textAlign: 'left',
  color: Theme.black,

  '&:last-child': {
    borderBottomRightRadius: '4px',
    borderBottomLeftRadius: '4px',
    borderBottom: `1px solid ${Theme.mediumGray}`,
  },
  '&:hover': {
    background: Theme.green,
    color: Theme.white,
  },
});

const DisplayMenu = ({
  children,
}) => (
  <Menu>
    <ArrowIcon down={true}/>
    <Div>
      <List>
        {React.Children.map(children, child => (
          <Entry>
            {child}
          </Entry>
        ))}
      </List>
    </Div>
  </Menu>
);

DisplayMenu.propTypes = {
  children: PropTypes.func.isRequired,
};

export default DisplayMenu;

// vim: set ts=2 sw=2 tw=80:
