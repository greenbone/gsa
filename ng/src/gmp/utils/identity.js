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
export const is_array = Array.isArray;

export function is_defined(value) {
  return value !== undefined;
}

export function has_value(value) {
  return value !== null && is_defined(value);
}

export function is_object(value) {
  return value !== null && typeof value === 'object';
}

export function is_string(value) {
  return typeof value === 'string';
}

export function is_number(value) {
  return typeof value === 'number';
}

export function is_function(value) {
  return typeof value === 'function';
}

export function is_date(value) {
  return Object.prototype.toString.call(value) === '[object Date]';
}

export const is_model_element = elem => is_defined(elem) &&
  is_defined(elem._id);

// vim: set ts=2 sw=2 tw=80:
