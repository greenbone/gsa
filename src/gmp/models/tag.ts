/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseInt} from 'gmp/parser';
import {ApiType, EntityType, normalizeType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface TagElement extends ModelElement {
  resources?: {
    type: ApiType;
    count: {
      total: number;
    };
  };
  value?: string | number;
}

interface TagProperties extends ModelProperties {
  resourceCount?: number;
  resourceType?: EntityType;
  value?: string;
}

class Tag extends Model {
  static readonly entityType = 'tag';

  readonly resourceCount?: number;
  readonly resourceType?: string;
  readonly value?: string;

  constructor({
    resourceCount = 0,
    resourceType,
    value,
    ...properties
  }: TagProperties = {}) {
    super(properties);

    this.resourceCount = resourceCount;
    this.resourceType = resourceType;
    this.value = value;
  }

  static fromElement(element: TagElement = {}): Tag {
    return new Tag(this.parseElement(element));
  }

  static parseElement(element: TagElement): TagProperties {
    const ret = super.parseElement(element) as TagProperties;

    if (isDefined(element.resources)) {
      ret.resourceType = normalizeType(element.resources.type);
      ret.resourceCount = parseInt(element.resources.count.total);
    } else {
      ret.resourceCount = 0;
    }
    const value = isDefined(element.value) ? String(element.value) : undefined;
    ret.value = isEmpty(value) ? undefined : value;

    return ret;
  }
}

export default Tag;
