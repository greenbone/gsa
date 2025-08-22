/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Dayjs} from 'dayjs';
import {z} from 'zod';
import Capabilities from 'gmp/capabilities/capabilities';
import BaseModel, {
  BaseModelPropertiesSchema,
  parseBaseModelProperties,
  BaseModelElementSchema,
} from 'gmp/models/basemodel';
import dayjs, {Date as GmpDate} from 'gmp/models/date';
import UserTag, {UserTagElementSchema} from 'gmp/models/usertag';
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
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export type Owner = z.infer<typeof ownerSchema>;

export type EntityModelPermissionElement = z.infer<
  typeof EntityModelPermissionElementSchema
>;

export type EntityModelElement = z.infer<typeof EntityModelElementSchema>;

export type EntityModelProperties = z.infer<typeof EntityModelPropertiesSchema>;

export const ownerSchema = z.object({
  name: z.string(),
});

export const EntityModelPermissionElementSchema = z.object({
  name: z.string(),
});

export const EntityModelElementSchema = BaseModelElementSchema.extend({
  name: z.string().optional(),
  end_time: z.string().optional(),
  timestamp: z.string().optional(),
  permissions: z
    .object({
      permission: z.union([
        EntityModelPermissionElementSchema,
        z.array(EntityModelPermissionElementSchema),
      ]),
    })
    .optional(),
  user_tags: z
    .object({
      tag: z.union([UserTagElementSchema, z.array(UserTagElementSchema)]),
    })
    .optional(),
  writable: z.custom<YesNo>().optional(),
  orphan: z.custom<YesNo>().optional(),
  active: z.custom<YesNo>().optional(),
  trash: z.custom<YesNo>().optional(),
  in_use: z.custom<YesNo>().optional(),
  owner: ownerSchema.optional(),
  summary: z.string().optional(),
  comment: z.string().optional(),
});

export const EntityModelPropertiesSchema = BaseModelPropertiesSchema.extend({
  active: z.union([z.literal(YES_VALUE), z.literal(NO_VALUE)]).optional(),
  creationTime: z.instanceof(dayjs as unknown as typeof Dayjs).optional(),
  endTime: z.instanceof(dayjs as unknown as typeof Dayjs).optional(),
  comment: z.string().optional(),
  inUse: z.boolean().optional(),
  name: z.string().optional(),
  orphan: z.union([z.literal(YES_VALUE), z.literal(NO_VALUE)]).optional(),
  owner: ownerSchema.optional(),
  summary: z.string().optional(),
  timestamp: z.instanceof(dayjs as unknown as typeof Dayjs).optional(),
  trash: z.union([z.literal(YES_VALUE), z.literal(NO_VALUE)]).optional(),
  userCapabilities: z.instanceof(Capabilities).optional(),
  userTags: z.array(z.instanceof(UserTag)).optional(),
  writable: z.union([z.literal(YES_VALUE), z.literal(NO_VALUE)]).optional(),
});

/**
 * A model representing an entity
 */
class EntityModel extends BaseModel {
  static readonly entityType: string = 'unknown';

  readonly active?: YesNo;
  readonly comment?: string;
  readonly endTime?: GmpDate;
  readonly entityType: string;
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
    entityType?: string,
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
    element: Partial<
      EntityModelElement & {
        _id?: string;
        creation_time?: string;
        modification_time?: string;
        type?: string | number;
      }
    > = {},
    entityType?: string,
  ): EntityModel {
    return new this(
      parseEntityModelProperties(element as EntityModelElement),
      entityType,
    );
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
    const caps = map(element.permissions.permission, perm => perm.name);
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
