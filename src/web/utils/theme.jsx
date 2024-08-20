/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


const Theme = {
  /* source styleguide */
  lightGreen: '#A1DDBA',
  green: '#11ab51',

  lightGray: '#e5e5e5', // used by: disabled inputs
  mediumDarkGray: '#c2c2c2',
  mediumGray: '#7F7F7F',
  darkGray: '#4C4C4C',

  /* source own */
  white: '#fff',
  dialogGray: '#f3f3f3', // used by: dialog and dashboard display backgrounds
  inputBorderGray: '#bfbfbf', // used by: form field, (Multi-)Select, ProgressBar
  black: '#000',
  loginButtonGray: '#4c4c4d', // used by: login button
  loginButtonHover: '#212121', // used by: login button at hover

  lightRed: '#fdf2f2', // used by: dialog errors background
  mediumLightRed: '#f4b1b2', // used by: dialog errors border
  warningRed: '#e5393d', // used for warning font color at login dialog
  darkRed: '#c12c30', // used by: dialog errors font
  errorRed: '#c83814', // used by: progressbar

  lightBlue: '#d6e6fd', // used by InfoPanel and dashboard hovering
  mediumBlue: '#77acf7', // used by active/hovered items in Select
  blue: '#0a53b8', // used by: links
  severityLowBlue: '#4f91c7', // used by: progressbar

  severityWarnYellow: '#f0a519', // used by: progressbar

  statusNewGreen: '#99be48', // used by: progressbar
  statusRunGreen: '#70c000', // used by: progressbar

  paleGreen: '#99BE48', // used by: compliance status bar

  /* source ? */
  darkGreen: '#074320', // RGB: 7, 67, 32
  darkGreenTransparent: 'rgba(7, 67, 32, 0.8)', // corresponds to darkGreen

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
