/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

const DialogButton = glamorous.button({
  border: '1px solid #519032',
  fontWeight: 'bold',
  color: '#519032',
  cursor: 'pointer',
  background: '#87d050',
  borderRadius: '4px',
  padding: '0 15px',
  lineHeight: '30px',

  ':hover': {
    color: '#fff',
    background: '#519032',
  },
});

export default DialogButton;

// vim: set ts=2 sw=2 tw=80:
