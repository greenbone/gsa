/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import compose from '../../utils/compose.js';
import Theme from '../../utils/theme.js';

import withLayout from '../layout/withLayout.js';

import withChangeHandler from './withChangeHandler.js';

const StyledInput = glamorous.input({
  /* use font and line settings from parents not from browser default */
  fontamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  display: 'block',
  height: '22px',
  color: Theme.darkGray,
  backgroundColor: Theme.white,
  backgroundImage: 'none',
  border: '1px solid ' + Theme.inputBorderGray,
  borderRadius: '4px',
  padding: '1px 8px',
  // "hack" to overshadow default color in Chrome's autofilled input fields
  '&:-webkit-autofill': {
    boxShadow: '0 0 0 1000px white inset',
  },
}, ({disabled}) => disabled ? {cursor: 'not-allowed'} : null,
  ({disabled, readonly}) => readonly || disabled ? {
    backgroundColor: Theme.dialogGray,
    opacity: 1,
  } : null,
);

export default compose(
  withLayout(),
  withChangeHandler(),
)(StyledInput);

// vim: set ts=2 sw=2 tw=80:
