/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {first} from './array';
import {isDefined, isString} from './identity';

export const hasId = model =>
  isDefined(model) && isString(model.id) && model.id.length > 0;

export const includesId = (list, id) => {
  for (const value of list) {
    if (value.id === id) {
      return true;
    }
  }
  return false;
};

export const selectSaveId = (list, id, empty_default) => {
  if (!isDefined(id) || !includesId(list, id)) {
    if (!isDefined(empty_default)) {
      return first(list).id;
    }
    return empty_default;
  }
  return id;
};

// vim: set ts=2 sw=2 tw=80:
