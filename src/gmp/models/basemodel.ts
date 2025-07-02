/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Date as GmpDate} from 'gmp/models/date';
import {parseDate} from 'gmp/parser';
import {isDefined, isString} from 'gmp/utils/identity';

/**
 * Represents the data returned by the backend
 */
export interface BaseModelElement {
  _id?: string;
  creation_time?: string;
  modification_time?: string;
  type?: string | number;
}

/**
 * Represents the properties to create a BaseModel instance.
 */
export interface BaseModelProperties {
  _type?: string;
  creationTime?: GmpDate;
  id?: string;
  modificationTime?: GmpDate;
}

export const parseBaseModelProperties = (
  element: BaseModelElement = {},
): BaseModelProperties => {
  // in future the function should only return known properties
  // and not the whole object
  // for now we need to return the whole object
  // to not break existing code
  const copy = {...element} as BaseModelProperties; // create shallow copy

  if (isString(element._id) && element._id.length > 0) {
    // only set id if it id defined
    copy.id = element._id;
  }

  if (isDefined(element.creation_time)) {
    copy.creationTime = parseDate(element.creation_time);
    // @ts-expect-error
    delete copy.creation_time;
  }
  if (isDefined(element.modification_time)) {
    copy.modificationTime = parseDate(element.modification_time);
    // @ts-expect-error
    delete copy.modification_time;
  }

  if (isDefined(element.type)) {
    // type should not be used directly
    copy._type = String(element.type);
    // @ts-expect-error
    delete copy.type;
  }

  return copy;
};

class BaseModel {
  readonly _type?: string;
  readonly creationTime?: GmpDate;
  readonly id?: string;
  readonly modificationTime?: GmpDate;

  constructor({
    id,
    creationTime,
    modificationTime,
    _type,
  }: BaseModelProperties = {}) {
    this.id = id;
    this.creationTime = creationTime;
    this.modificationTime = modificationTime;
    this._type = _type;
  }

  static fromElement(element: BaseModelElement = {}): BaseModel {
    return new BaseModel(parseBaseModelProperties(element));
  }
}

export default BaseModel;
