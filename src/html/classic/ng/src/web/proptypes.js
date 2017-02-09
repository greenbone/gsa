/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import React from 'react';

export const component = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.object,
]);

export const componentOrFalse = React.PropTypes.oneOfType([
  component,
  React.PropTypes.oneOf([false]),
]);

export const componentOrElement = React.PropTypes.oneOfType([
  component,
  React.PropTypes.element,
]);

export const number = React.PropTypes.oneOfType([
  React.PropTypes.number,
  React.PropTypes.string,
]);

export const icon =  React.PropTypes.oneOfType([
  React.PropTypes.string,
  React.PropTypes.element,
]);

export const yesno = React.PropTypes.oneOf([
  "1", "0", 1, 0,
]);

export const id = React.PropTypes.string; // TODO improve checking for uuid

export const stringOrFalse = React.PropTypes.oneOfType([
  React.PropTypes.string,
  React.PropTypes.oneOf([false]),
]);

export default {
  component,
  componentOrFalse,
  componentOrElement,
  number,
  icon,
  id,
  stringOrFalse,
  yesno,
};

// vim: set ts=2 sw=2 tw=80:
