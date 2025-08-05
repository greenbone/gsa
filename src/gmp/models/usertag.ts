/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {z} from 'zod';
import {BaseModelElementSchema} from 'gmp/models/basemodel';

export const UserTagElementSchema = BaseModelElementSchema.extend({
  _id: z.string(),
  comment: z.string().optional(),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
});

export type UserTagElement = z.infer<typeof UserTagElementSchema>;

export interface UserTagProperties {
  id: string;
  comment?: string;
  name: string;
  value: string;
}

/**
 * A condensed representation of a tags connected to an entity.
 */
class UserTag {
  readonly comment?: string;
  readonly entityType: string = 'tag';
  readonly id: string;
  readonly name: string;
  readonly value: string;

  constructor({comment, id, name, value}: UserTagProperties) {
    this.comment = comment;
    this.id = id;
    this.name = name;
    this.value = value;
  }

  static fromElement({_id, comment, name, value}: UserTagElement): UserTag {
    return new UserTag({
      id: _id,
      comment,
      name,
      value: String(value),
    });
  }
}

export default UserTag;
