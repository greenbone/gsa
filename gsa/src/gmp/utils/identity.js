/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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
export const {isArray} = global.Array;

export const isDefined = value => value !== undefined;

export const hasValue = value => value !== null && isDefined(value);

export const isObject = value => value !== null && typeof value === 'object';

export const isString = value => typeof value === 'string';

export const isNumber = value => typeof value === 'number';

export const isFunction = value => typeof value === 'function';

export const isJsDate = value =>
  Object.prototype.toString.call(value) === '[object Date]';

export const isModelElement = elem =>
  isDefined(elem) && isString(elem._id) && elem._id.length > 0;

// vim: set ts=2 sw=2 tw=80:
