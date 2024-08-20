/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const exclude = (object, func) =>
  Object.keys(object)
    .filter(key => !func(key))
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});

export const excludeObjectProps = (object, exclude_array) =>
  exclude(object, key => exclude_array.includes(key));

// vim: set ts=2 sw=2 tw=80:
