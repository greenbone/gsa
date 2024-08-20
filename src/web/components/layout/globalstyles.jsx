/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {createGlobalStyle} from 'styled-components';

import Theme from 'web/utils/theme';

const GlobalStyles = createGlobalStyle`
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
  }

  a:link {
    color: ${Theme.blue};
    text-decoration: none;
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
`;

export default GlobalStyles;
