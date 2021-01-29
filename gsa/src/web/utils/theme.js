/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const Theme = {
  /* source styleguide */
  lightGreen: '#87d050',
  green: '#66c430',

  lightGray: '#c8d3d9', // used by: disabled inputs
  mediumGray: '#787878',
  darkGray: '#393637',

  goldYellow: '#fdc300',
  redBrown: '#a54317',

  /* source own */
  white: '#fff',
  offWhite: '#fefefe', // used by: Login-background
  dialogGray: '#eeeeee', // used by: dialog and dashboard display backgrounds
  inputBorderGray: '#aaaaaa', // used by: form field, (Multi-)Select, ProgressBar
  black: '#000',

  lightRed: '#f2dede', // used by: dialog errors background
  mediumLightRed: '#ebccd1', // used by: dialog errors border
  warningRed: '#d83636', // used for warning font color at login dialog
  darkRed: '#a94442', // used by: dialog errors font
  errorRed: '#c83814', // used by: progressbar

  lightBlue: '#bce8f1', // used by InfoPanel and dashboard hovering
  mediumBlue: '#5897fb', // used by active/hovered items in Select
  blue: '#0000ff', // used by: links
  severityLowBlue: '#4f91c7', // used by: progressbar

  severityWarnYellow: '#f0a519', // used by: progressbar

  statusNewGreen: '#99be48', // used by: progressbar
  statusRunGreen: '#70c000', // used by: progressbar

  paleGreen: '#99BE48', // used by: compliance status bar

  /* source ? */
  darkGreen: '#519032', // RGB: 81, 144, 50
  darkGreenTransparent: 'rgba(81, 144, 50, 0.8)', // corresponds to darkGreen

  Layers: {
    menu: 600,
    aboveAll: 500,
    onTop: 100,
    belowAll: -100,
    higher: 1,
    default: 0,
  },

  Font: {
    default: 'Verdana, sans-serif',
    dialog: 'Trebuchet MS, Tahoma, Verdana, Arial, sans-serif',
    defaultSize: '12px',
  },
};

export default Theme;

// vim: set ts=2 sw=2 tw=80:
