/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

const Theme = {
  /* source styleguide */
  green: '#66c430',
  lightGreen: '#87d050',

  darkGray: '#393637',
  mediumGray: '#787878',
  lightGray: '#c8d3d9', // used by: disabled inputs

  goldYellow: '#fdc300',
  redBrown: '#a54317',

  /* source own */
  black: '#000',
  white: '#fff',
  offWhite: '#fefefe', // used by: Login-background
  lightRed: '#f2dede', // used by: dialog errors background
  mediumLightRed: '#ebccd1', // used by: dialog errors border
  darkRed: '#a94442', // used by: dialog errors font
  blue: '#0000ff', // used by: links
  dialogGray: '#eeeeee', // used by: dialog and dashboard display backgrounds
  inputBorderGray: '#aaaaaa', // used by: form field, (Multi-)Select
  mediumBlue: '#5897fb', // used by active/hovered items in Select

  /* source ? */
  darkGreen: '#519032',

  Layers: {
    aboveAll: 500,
    onTop: 100,
    belowAll: -100,
    higher: 1,
    default: 0,
  },
};

export default Theme;

// vim: set ts=2 sw=2 tw=80:
