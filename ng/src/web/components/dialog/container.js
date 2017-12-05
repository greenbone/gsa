/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {is_defined} from 'gmp/utils.js';

const DialogContainer = glamorous.div(
  {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    margin: '10% auto',
    border: 0,
    outline: '0',
  },
  ({width}) => ({
    width: is_defined(width) ? width : '400px',
  }),
  ({height}) => ({
    height: is_defined(height) ? height : 'auto',
  }),
  ({posX, posY}) => (is_defined(posX) || is_defined(posY) ? {
    position: 'absolute',
    top: posY,
    left: posX,
    margin: 0,
  } : undefined),
);

DialogContainer.displayName = 'DialogContainer';

export default DialogContainer;

// vim: set ts=2 sw=2 tw=80:
