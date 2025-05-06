/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {first} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';

interface Model {
  id: string;
}

export const hasId = (model: unknown) =>
  isDefined(model) &&
  isString((model as Model).id) &&
  (model as Model).id.length > 0;

export const includesId = (list: Model[] | undefined, id: string) => {
  if (!isDefined(list)) {
    return false;
  }
  for (const value of list) {
    if (value.id === id) {
      return true;
    }
  }
  return false;
};

export const selectSaveId = (
  list: Model[] | undefined,
  id: string,
  emptyDefault: string,
) => {
  if (!isDefined(id) || !includesId(list, id)) {
    if (!isDefined(emptyDefault)) {
      return (first(list) as Model).id;
    }
    return emptyDefault;
  }
  return id;
};
