/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {css as glamorcss} from 'glamor';

import Theme from './theme';

const css = (styles = {}) => {
  for (const [name, style] of Object.entries(styles)) {
    glamorcss.global(name, style);
  }
};

css({
  html: {
    boxSizing: 'border-box',
  },

  '*, *:before, *:after': {
    boxSizing: 'inherit',
  },

  body: {
    margin: '0',
    fontFamily: Theme.Font.default,
    fontSize: '12px',
    color: Theme.black,
  },

  'a:link': {
    color: Theme.blue,
    textDecoration: 'none',
  },

  'a:hover, a:focus': {
    color: 'blue',
    textDecoration: 'underline',
  },

  pre: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },

  img: {
    border: 0,
  },

  svg: {
    overflow: 'hidden',
  },

  h1: {
    fontSize: '20px',
  },

  h2: {
    fontSize: '18px',
  },

  h3: {
    fontSize: '16px',
  },

  h4: {
    fontSize: '14px',
    marginBottom: 0,
  },

  p: {
    margin: '0 0 10px',
  },
});

export default css;

// vim: set ts=2 sw=2 tw=80:
