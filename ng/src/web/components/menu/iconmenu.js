/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {classes} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Icon from '../icon/icon.js';
import withIconCss from '../icon/withIconCss.js';
import withIconSize from '../icon/withIconSize.js';

const Div = glamorous.div({
  position: 'relative',
  display: 'none',
  '.icon-menu:hover &': {
    display: 'block',
  }
});

const List = glamorous.ul({
  position: 'absolute',
  margin: 0,
  padding: 0,
  left: 0,
  bottom: 0,
  zIndex: 5,
  listStyle: 'none',
  fontSize: '10px',
  width: '255px',
  '& .menu-entry': {
    width: '255px',
    borderLeft: '1px solid #3A3A3A',
    borderRight: '1px solid #3A3A3A',
  },
  '& .menu-entry:first-child': {
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '8px',
    borderTop: '1px solid #3A3A3A',
  },
  '& .menu-entry:last-child': {
    borderBottomRightRadius: '8px',
    borderBottomLeftRadius: '8px',
    borderBottom: '1px solid #3A3A3A',
  },
});

const IconMenuContainer = ({
  children,
  className,
  onClick,
  ...other
}) => {
  className = classes('icon-menu', className);

  return (
    <span className={className}>
      <Icon onClick={onClick} {...other}/>
      <Div>
        <List>
          {children}
        </List>
      </Div>
    </span>
  );
};

IconMenuContainer.propTypes = {
  img: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default withIconSize(withIconCss(IconMenuContainer));

// vim: set ts=2 sw=2 tw=80:
