/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {type ApiType, normalizeType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export type SubjectType = 'user' | 'group' | 'role';

interface PermissionElement extends ModelElement {
  resource?: {
    _id?: string;
    type?: ApiType;
  };
  subject?: {
    _id?: string;
    type?: SubjectType;
  };
}

interface PermissionProperties extends ModelProperties {
  resource?: Model;
  subject?: Model;
}

class Permission extends Model {
  static readonly entityType = 'permission';

  readonly resource?: Model;
  readonly subject?: Model;

  constructor({resource, subject, ...properties}: PermissionProperties = {}) {
    super(properties);

    this.resource = resource;
    this.subject = subject;
  }

  static fromElement(element: PermissionElement = {}): Permission {
    return new Permission(this.parseElement(element));
  }

  static parseElement(element: PermissionElement = {}): PermissionProperties {
    const ret = super.parseElement(element) as PermissionProperties;

    if (isDefined(element.resource) && !isEmpty(element.resource._id)) {
      ret.resource = Model.fromElement(
        element.resource,
        normalizeType(element.resource.type),
      );
    } else {
      delete ret.resource;
    }

    if (isDefined(element.subject) && !isEmpty(element.subject._id)) {
      ret.subject = Model.fromElement(element.subject, element.subject.type);
    } else {
      delete ret.subject;
    }
    return ret;
  }
}

export default Permission;
