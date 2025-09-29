/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Capabilities, {Capability} from 'gmp/capabilities/capabilities';
import BaseModel, {
  BaseModelElement,
  BaseModelProperties,
  parseBaseModelProperties,
} from 'gmp/models/basemodel';
import {Date as GmpDate} from 'gmp/models/date';
import UserTag, {UserTagElement} from 'gmp/models/usertag';
import {
  NO_VALUE,
  parseBoolean,
  parseDate,
  parseText,
  parseToString,
  parseYesNo,
  YES_VALUE,
  YesNo,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {EntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export interface Owner {
  name: string;
}

export interface EntityModelPermissionElement {
  name: string;
}

export interface EntityModelElement extends BaseModelElement {
  name?: string;
  end_time?: string;
  timestamp?: string;
  permissions?: {
    permission: EntityModelPermissionElement | EntityModelPermissionElement[];
  };
  user_tags?: {
    tag: UserTagElement | UserTagElement[];
  };
  writable?: YesNo;
  orphan?: YesNo;
  active?: YesNo;
  trash?: YesNo;
  in_use?: YesNo;
  owner?: Owner;
  summary?: string;
  comment?: string;
}

export interface EntityModelProperties extends BaseModelProperties {
  active?: YesNo;
  comment?: string;
  endTime?: GmpDate;
  inUse?: boolean;
  name?: string;
  orphan?: YesNo;
  owner?: Owner;
  summary?: string;
  timestamp?: GmpDate;
  trash?: YesNo;
  userCapabilities?: Capabilities;
  userTags?: UserTag[];
  writable?: YesNo;
}

/**
 * A model representing an entity
 */
class EntityModel extends BaseModel {
  static readonly entityType: EntityType;

  readonly active?: YesNo;
  readonly comment?: string;
  readonly endTime?: GmpDate;
  readonly entityType: EntityType;
  readonly inUse?: boolean;
  readonly name?: string;
  readonly orphan?: YesNo;
  readonly owner?: Owner;
  readonly summary?: string;
  readonly timestamp?: GmpDate;
  readonly trash?: YesNo;
  readonly userCapabilities: Capabilities;
  readonly userTags: UserTag[];
  readonly writable?: YesNo;

  constructor(
    {
      _type,
      active,
      comment,
      creationTime,
      endTime,
      id,
      inUse,
      modificationTime,
      name,
      orphan,
      owner,
      summary,
      timestamp,
      trash,
      userCapabilities,
      userTags = [],
      writable,
    }: EntityModelProperties = {},
    entityType?: EntityType,
  ) {
    super({id, creationTime, modificationTime, _type});

    const defaultEntityType = (this.constructor as typeof EntityModel)
      .entityType;
    this.entityType = entityType ?? defaultEntityType;

    this.active = active;
    this.comment = comment;
    this.endTime = endTime;
    this.inUse = inUse;
    this.name = name;
    this.orphan = orphan;
    this.owner = owner;
    this.summary = summary;
    this.timestamp = timestamp;
    this.trash = trash;
    this.userCapabilities = userCapabilities ?? new Capabilities();
    this.userTags = userTags;
    this.writable = writable;
  }

  isActive() {
    return this.active !== NO_VALUE;
  }

  isInTrash() {
    return this.trash === YES_VALUE;
  }

  isInUse() {
    return this.inUse === true;
  }

  isOrphan() {
    return this.orphan === YES_VALUE;
  }

  isWritable() {
    return this.writable !== NO_VALUE;
  }

  static fromElement(
    element: EntityModelElement = {},
    entityType?: EntityType,
  ): EntityModel {
    return new this(parseEntityModelProperties(element), entityType);
  }
}

export const parseEntityModelProperties = (
  element: EntityModelElement = {},
): EntityModelProperties => {
  // in future parseDefaultProperties should only return known properties
  // and not the whole object
  // for now we need to delete the properties we don't want
  const copy = parseBaseModelProperties(element) as EntityModelProperties;

  if (isDefined(element.name)) {
    copy.name = parseToString(element.name);
  }

  if (isDefined(element.end_time)) {
    if (element.end_time.length > 0) {
      copy.endTime = parseDate(element.end_time);
    }
    // @ts-expect-error
    delete copy.end_time;
  }

  if (isDefined(element.timestamp)) {
    if (element.timestamp.length > 0) {
      copy.timestamp = parseDate(element.timestamp);
    }
  }

  if (isDefined(element.permissions)) {
    // these are the permissions the current user has on the entity
    const caps = map(
      element.permissions.permission,
      perm => perm.name,
    ) as Capability[];
    copy.userCapabilities = new Capabilities(caps);
    // @ts-expect-error
    delete copy.permissions;
  } else {
    copy.userCapabilities = new Capabilities();
  }

  if (isDefined(element.user_tags)) {
    copy.userTags = map(element.user_tags.tag, tag => {
      return UserTag.fromElement(tag);
    });
    // @ts-expect-error
    delete copy.user_tags;
  } else {
    copy.userTags = [];
  }

  const yesNoProps = ['writable', 'orphan', 'active', 'trash'];

  for (const name of yesNoProps) {
    const prop = element[name];
    if (isDefined(prop)) {
      copy[name] = parseYesNo(prop);
    }
  }

  if (isDefined(element.in_use)) {
    copy.inUse = parseBoolean(element.in_use);
    // @ts-expect-error
    delete copy.in_use;
  }

  copy.owner =
    isDefined(element.owner) && !isEmpty(element.owner.name)
      ? {
          name: parseToString(element.owner.name) as string,
        }
      : undefined;

  copy.summary = parseText(element.summary);

  if (isEmpty(element.summary)) {
    delete copy.summary;
  }

  copy.comment = parseText(element.comment);

  if (isEmpty(element.comment)) {
    delete copy.comment;
  }

  return copy;
};

export default EntityModel;
