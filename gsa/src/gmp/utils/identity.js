/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
export const {isArray} = global.Array;

export const isDefined = value => value !== undefined;

export const hasValue = value => value !== null && value !== undefined;

export const isObject = value => value !== null && typeof value === 'object';

export const isString = value => typeof value === 'string';

export const isNull = value => value === null;

export const isNumber = value => typeof value === 'number';

export const isFunction = value => typeof value === 'function';

export const isJsDate = value =>
  Object.prototype.toString.call(value) === '[object Date]';

export const isModelElement = elem =>
  isDefined(elem) && isString(elem._id) && elem._id.length > 0;

// vim: set ts=2 sw=2 tw=80:
