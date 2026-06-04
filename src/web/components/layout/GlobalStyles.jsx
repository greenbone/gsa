/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {createGlobalStyle} from 'styled-components';
import Theme from 'web/utils/Theme';

const GlobalStyles = createGlobalStyle`
  :root, html {
    --gsa-lightGreen: #A1DDBA;
    --gsa-green: #11ab51;
    --gsa-lightGray: #e5e5e5;
    --gsa-mediumDarkGray: #c2c2c2;
    --gsa-mediumGray: #7F7F7F;
    --gsa-darkGray: #4C4C4C;
    --gsa-white: #fff;
    --gsa-dialogGray: #f3f3f3;
    --gsa-inputBorderGray: #bfbfbf;
    --gsa-black: #000;
    --gsa-loginButtonGray: #4c4c4d;
    --gsa-loginButtonHover: #212121;
    --gsa-lightRed: #fdf2f2;
    --gsa-mediumLightRed: #f4b1b2;
    --gsa-warningRed: #e5393d;
    --gsa-darkRed: #c12c30;
    --gsa-errorRed: #c83814;
    --gsa-complianceYes: #4cb045;
    --gsa-complianceNo: #D80000;
    --gsa-complianceIncomplete: orange;
    --gsa-complianceUndefined: silver;
    --gsa-lightBlue: #d6e6fd;
    --gsa-mediumBlue: #77acf7;
    --gsa-blue: #0a53b8;
    --gsa-severityLowBlue: #4f91c7;
    --gsa-severityWarnYellow: #f0a519;
    --gsa-severityClassLog: #DDDDDD;
    --gsa-severityClassLow: #A0C5F9;
    --gsa-severityClassMedium: #F3B865;
    --gsa-severityClassHigh: #F0868A;
    --gsa-severityClassCritical: #C12C30;
    --gsa-statusNewGreen: #99be48;
    --gsa-statusRunGreen: #70c000;
    --gsa-paleGreen: #99BE48;
    --gsa-darkGreen: #074320;
    --gsa-darkGreenTransparent: rgba(7, 67, 32, 0.8);
    --gsa-darkEmptyColor: #b5b5b5;
    --gsa-lightGray-darker: #c5c5c5;
    --gsa-shadowColor: rgba(0, 0, 0, 0.15);
  }

  html[data-mantine-color-scheme="dark"] {
    --gsa-lightGreen: #2d8253;
    --gsa-green: #1ebd60;
    --gsa-lightGray: #2b2c30;
    --gsa-mediumDarkGray: #45474f;
    --gsa-mediumGray: #a6a7ab;
    --gsa-darkGray: #dcdcdc;
    --gsa-white: #1A1B1E;
    --gsa-dialogGray: #101113;
    --gsa-inputBorderGray: #373A40;
    --gsa-black: #C1C2C5;
    --gsa-loginButtonGray: #2C2E33;
    --gsa-loginButtonHover: #373A40;
    --gsa-lightRed: #2c0e0e;
    --gsa-mediumLightRed: #722c2c;
    --gsa-warningRed: #ff6b6b;
    --gsa-darkRed: #fa5252;
    --gsa-errorRed: #fa5252;
    --gsa-complianceYes: #2b8a3e;
    --gsa-complianceNo: #e03131;
    --gsa-complianceIncomplete: #e8590c;
    --gsa-complianceUndefined: #495057;
    --gsa-lightBlue: #182438;
    --gsa-mediumBlue: #1c7ed6;
    --gsa-blue: #4dabf7;
    --gsa-severityLowBlue: #1c7ed6;
    --gsa-severityWarnYellow: #fcc419;
    --gsa-severityClassLog: #373a40;
    --gsa-severityClassLow: #228be6;
    --gsa-severityClassMedium: #f76707;
    --gsa-severityClassHigh: #e03131;
    --gsa-severityClassCritical: #c92a2a;
    --gsa-statusNewGreen: #37b24d;
    --gsa-statusRunGreen: #2b8a3e;
    --gsa-paleGreen: #5c7cfa;
    --gsa-darkGreen: #09341c;
    --gsa-darkGreenTransparent: rgba(9, 52, 28, 0.8);
    --gsa-darkEmptyColor: #141416;
    --gsa-lightGray-darker: #1e1f22;
    --gsa-shadowColor: rgba(0, 0, 0, 0.6);
  }

  html[data-mantine-color-scheme="dark"] [data-testid="login-logo"] {
    filter: invert(1) brightness(2);
  }

  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body {
    margin: 0;
    font-family: ${Theme.Font.default};
    font-size: ${Theme.Font.defaultSize};
    color: ${Theme.black};
    background-color: ${Theme.dialogGray};
  }

  a:link {
    color: ${Theme.blue};
    text-decoration: none;
  }

  a:visited {
    color: revert;  
  }

  a:hover, a:focus {
    color: blue;
    text-decoration: underline;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  img {
    border: 0;
  }

  svg {
    overflow: hidden;
  }

  h1 {
    font-size: 20px;
  }

  h2 {
    font-size: 18px;
  }

  h3 {
    font-size: 16px;
  }

  h4 {
    font-size: 14px;
    margin-bottom: 0;
  }

  p {
    margin: 0 0 10px;
  }

  .axis-label {
    fill: ${Theme.darkGray}
  }

  .axis-line, .axis-tick line {
    shape-rendering: 'crispEdges';
    stroke: ${Theme.mediumGray};
    stroke-width: 0.99;
  }

  .mantine-Notifications-root.width-before-scroll-bar[data-position='top-right'] {
  top: calc(var(--header-height) + var(--mantine-spacing-md)); 
}
`;

export default GlobalStyles;
