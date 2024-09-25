/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Model, {parseModelFromElement} from 'gmp/model';

class Permission extends Model {
  static entityType = 'permission';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(element.resource) && !isEmpty(element.resource._id)) {
      ret.resource = parseModelFromElement(
        element.resource,
        element.resource.type,
      );
    } else {
      delete ret.resource;
    }

    if (isDefined(element.subject) && !isEmpty(element.subject._id)) {
      ret.subject = parseModelFromElement(
        element.subject,
        element.subject.type,
      );
    } else {
      delete ret.subject;
    }
    return ret;
  }
}

export default Permission;

// vim: set ts=2 sw=2 tw=80:
