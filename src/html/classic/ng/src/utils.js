/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import d3 from 'd3';

const x2js = new window.X2JS();

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

export function is_empty(value) {
  if (!has_value(value)) {
    return true;
  }
  if (is_string(value)) {
    return value.trim().length === 0;
  }

  if (is_array(value)) {
    return value.length === 0;
  }
  return false;
}

export function shallow_copy(source) {
  return Object.assign({}, source);
}

export function extend(dest, ...sources) {
  return Object.assign(dest, ...sources);
}

export function includes(array, value) {
  if (!Array.prototype.includes) {
    return array.indexOf(value) !== -1;
  }
  return array.includes(value);
}

export class PromiseFactory {
  constructor(promise) {
    this.promise = promise || Promise;
  }

  create(func) {
    if (is_object(this.promise)) {
      return this.promise(func);
    }
    return new this.promise(func);
  }
}

export function xml2json(...args) {
  return x2js.xml2json(...args);
}

export function for_each(array, func) {
  if (!has_value(array)) {
    return;
  }

  if (is_defined(array.forEach)) {
    array.forEach(func);
    return;
  }

  if (!is_array(array)) {
    array = [array];
  }
  array.forEach(func);
}

export function map(array, func, empty = []) {
  if (!has_value(array) || !is_defined(func)) {
    return empty;
  }

  if (is_defined(array.map)) {
    return array.map(func);
  }

  if (is_defined(array.forEach)) { // support array like objects e.g. Set and Map
    let result = [];

    array.forEach(entry => result.push(func(entry)));

    if (result.length === 0) {
      return empty;
    }
    return result;
  }

  if (!is_array(array)) {
    array = [array];
  }
  return array.map(func);
}

export const KeyCode = {
  ESC: 27,
  BACKSPACE: 8,
  COMMA: 188,
  DELETE: 46,
  DOWN: 40,
  END: 35,
  ENTER: 13,
  HOME: 36,
  LEFT: 37,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  PERIOD: 190,
  RIGHT: 39,
  SPACE: 32,
  TAB: 9,
  UP: 38,
  SUBTRACT: 109,
  MINUS: 173,
};

export function classes(...args) {
  let css = [];
  for (let arg of args) {
    if (is_array(arg)) {
      css.push(classes(...arg));
    }
    else if (is_string(arg) || is_number(arg)) {
      css.push(arg);
    }
  }
  return css.join(' ');
}

export function parse_int(value) {
  let val = parseInt(value, 10);
  if (isNaN(val)) {
    val = undefined;
  }
  return val;
}

export function parse_float(value) {
  return parseFloat(value);
}

const bind_exclude_methods = [
  'constructor',
  'getChildContext',
  'render',
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount',
];

export function autobind(instance, options) {
  if (!is_defined(instance)) {
    return;
  }

  let include = is_array(options) ? options : undefined;
  let startswith = is_string(options) ? options : undefined;

  let proto = Object.getPrototypeOf(instance);
  let props = include || Object.getOwnPropertyNames(proto);

  for (let key of props) {
    let func = proto[key];
    if (!includes(bind_exclude_methods, key) && is_function(func) &&
      (!is_defined(startswith) || key.startsWith(startswith)) &&
      proto.hasOwnProperty(key)) {
      instance[key] = func.bind(instance);
    }
  }
}

export function first(array, non = {}) {
  if (is_empty(array)) {
    return non;
  }
  return array[0];
}

export function includes_id(list, id) {
  for (let value of list) {
    if (value.id === id) {
      return true;
    }
  }
  return false;
}

export function select_save_id(list, id, empty_default) {
  if (is_empty(id) || !includes_id(list, id)) {
    if (!is_defined(empty_default)) {
      return first(list).id;
    }
    return empty_default;
  }
  return id;
}

export function convert_data(prefix, data, fields) {
  let converted = {};
  for (let name of fields) {
    if (data.hasOwnProperty(name)) {
      converted[prefix + ':' + name] = data[name];
    }
  }
  return converted;
}


export function get_severity_levels(type) {
  if (type === 'classic') {
    return {
      max_high: 10.0,
      min_high: 5.1,
      max_medium: 5.0,
      min_medium: 2.1,
      max_low: 2.0,
      min_low: 0.1,
      max_log: 0.0,
    };
  }
  if (type === 'pci-dss') {
    return {
      max_high: 10.0,
      min_high: 4.0,
      max_medium: 3.9,
      min_medium: 3.9,
      max_low: 3.9,
      min_low: 3.9,
      max_log: 3.9,
    };
  }

  return {
    max_high: 10.0,
    min_high: 7.0,
    max_medium: 6.9,
    min_medium: 4.0,
    max_low: 3.9,
    min_low: 0.1,
    max_log: 0.0,
  };
}

export function capitalize_first_letter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const cvss_number_format = d3.format('0.1f');

// vim: set ts=2 sw=2 tw=80:
