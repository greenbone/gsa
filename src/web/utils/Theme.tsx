/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

interface ThemeLayer {
  menu: number;
  aboveAll: number;
  onTop: number;
  belowAll: number;
  higher: number;
  default: number;
}

interface ThemeFont {
  default: string;
  dialog: string;
  defaultSize: string;
}

interface ThemeInterface {
  lightGreen: string;
  green: string;
  lightGray: string;
  mediumDarkGray: string;
  mediumGray: string;
  darkGray: string;
  white: string;
  dialogGray: string;
  inputBorderGray: string;
  black: string;
  loginButtonGray: string;
  loginButtonHover: string;
  lightRed: string;
  mediumLightRed: string;
  warningRed: string;
  darkRed: string;
  errorRed: string;
  complianceYes: string;
  complianceNo: string;
  complianceIncomplete: string;
  complianceUndefined: string;
  lightBlue: string;
  mediumBlue: string;
  blue: string;
  severityLowBlue: string;
  severityWarnYellow: string;
  severityClassLog: string;
  severityClassLow: string;
  severityClassMedium: string;
  severityClassHigh: string;
  severityClassCritical: string;
  statusNewGreen: string;
  statusRunGreen: string;
  paleGreen: string;
  darkGreen: string;
  darkGreenTransparent: string;
  pieLabel: string;
  Layers: ThemeLayer;
  Font: ThemeFont;
}

const isTest =
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test');

const color = (cssVar: string, fallbackHex: string): string =>
  isTest ? fallbackHex : `var(${cssVar})`;

const Theme: ThemeInterface = {
  /* source styleguide */
  lightGreen: color('--gsa-lightGreen', '#A1DDBA'),
  green: color('--gsa-green', '#11ab51'),

  lightGray: color('--gsa-lightGray', '#e5e5e5'), // used by: disabled inputs
  mediumDarkGray: color('--gsa-mediumDarkGray', '#c2c2c2'),
  mediumGray: color('--gsa-mediumGray', '#7F7F7F'),
  darkGray: color('--gsa-darkGray', '#4C4C4C'),

  /* source own */
  white: color('--gsa-white', '#fff'),
  dialogGray: color('--gsa-dialogGray', '#f3f3f3'), // used by: dialog and dashboard display backgrounds
  inputBorderGray: color('--gsa-inputBorderGray', '#bfbfbf'), // used by: form field, (Multi-)Select, ProgressBar
  black: color('--gsa-black', '#000'),
  loginButtonGray: color('--gsa-loginButtonGray', '#4c4c4d'), // used by: login button
  loginButtonHover: color('--gsa-loginButtonHover', '#212121'), // used by: login button at hover

  lightRed: color('--gsa-lightRed', '#fdf2f2'), // used by: dialog errors background
  mediumLightRed: color('--gsa-mediumLightRed', '#f4b1b2'), // used by: dialog errors border
  warningRed: color('--gsa-warningRed', '#e5393d'), // used for warning font color at login dialog
  darkRed: color('--gsa-darkRed', '#c12c30'), // used by: dialog errors font
  errorRed: color('--gsa-errorRed', '#c83814'), // used by: progressbar

  complianceYes: color('--gsa-complianceYes', '#4cb045'),
  complianceNo: color('--gsa-complianceNo', '#D80000'),
  complianceIncomplete: color('--gsa-complianceIncomplete', 'orange'),
  complianceUndefined: color('--gsa-complianceUndefined', 'silver'),

  lightBlue: color('--gsa-lightBlue', '#d6e6fd'), // used by InfoPanel and dashboard hovering
  mediumBlue: color('--gsa-mediumBlue', '#77acf7'), // used by active/hovered items in Select
  blue: color('--gsa-blue', '#0a53b8'), // used by: links
  severityLowBlue: color('--gsa-severityLowBlue', '#4f91c7'), // used by: progressbar

  severityWarnYellow: color('--gsa-severityWarnYellow', '#f0a519'), // used by: progressbar

  severityClassLog: color('--gsa-severityClassLog', '#DDDDDD'),
  severityClassLow: color('--gsa-severityClassLow', '#A0C5F9'),
  severityClassMedium: color('--gsa-severityClassMedium', '#F3B865'),
  severityClassHigh: color('--gsa-severityClassHigh', '#F0868A'),
  severityClassCritical: color('--gsa-severityClassCritical', '#C12C30'),

  statusNewGreen: color('--gsa-statusNewGreen', '#99be48'), // used by: progressbar
  statusRunGreen: color('--gsa-statusRunGreen', '#70c000'), // used by: progressbar

  paleGreen: color('--gsa-paleGreen', '#99BE48'), // used by: compliance status bar

  /* source ? */
  darkGreen: color('--gsa-darkGreen', '#074320'), // RGB: 7, 67, 32
  darkGreenTransparent: color('--gsa-darkGreenTransparent', 'rgba(7, 67, 32, 0.8)'), // corresponds to darkGreen
  pieLabel: color('--gsa-pieLabel', '#f3f3f3'),

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
    defaultSize: 'var(--mantine-font-size-md)',
  },
};

export default Theme;
