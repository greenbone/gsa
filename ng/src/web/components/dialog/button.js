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

import Button from '../form/button.js';

const DialogButton = glamorous(Button)({
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
},
  ({loading}) => {
    if (loading) {
      return {
        background: '#87d050 url(/img/loading.gif) center center no-repeat',
        color: 'rgba(0, 0, 0, 0.0)',

        // when loading, :hover needs to be overwritten explicitly
        ':hover': {
          background: '#87d050 url(/img/loading.gif) center center no-repeat',
          color: 'rgba(0, 0, 0, 0.0)',
        },
      };
    }
  }
);

export default DialogButton;

// vim: set ts=2 sw=2 tw=80:
