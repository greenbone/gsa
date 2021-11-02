/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
`;

export default GlobalStyles;
