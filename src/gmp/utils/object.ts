/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

type ExcludeFunc = (key: string) => boolean;

export const exclude = (object: {}, func: ExcludeFunc) =>
  Object.keys(object)
    .filter(key => !func(key))
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});

export const excludeObjectProps = (
  object: {},
  excludeArray: readonly string[],
) => exclude(object, key => excludeArray.includes(key));
