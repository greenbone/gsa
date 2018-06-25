/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import Theme from '../../utils/theme';

/**
* Can be used as link anchor. Offsets the target so that it doesn't hide
* behind the top menu bar.
*
* @module components/link/target.js
*
* @exports {glamorous}
*/

const Target = glamorous.div({
  content: '',
  display: 'block',
  height: '35px',
  zIndex: Theme.Layers.belowAll,
  margin: '-35px 0 0 0',
  position: 'relative', // needs to be set for z-index to work in Firefox
});

export default Target;
