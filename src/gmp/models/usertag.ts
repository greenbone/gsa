/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {z} from 'zod';
import {BaseModelElement} from 'gmp/models/basemodel';
import {validateAndCreate} from 'gmp/utils/zodModelValidation';

export type UserTagElement = z.infer<typeof UserTagElementSchema> &
  BaseModelElement;

export type UserTagProperties = z.infer<typeof UserTagSchema>;

export const UserTagElementSchema = z.object({
  _id: z.string(),
  comment: z.string().optional(),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
});

const UserTagSchema = z.object({
  id: z.string(),
  comment: z.string().optional(),
  name: z.string(),
  value: z.string(),
});

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

  static fromElement(element: UserTagElement): UserTag {
    const parsedElement = {
      id: element._id,
      comment: element.comment,
      name: element.name,
      value: String(element.value),
    };

    return validateAndCreate({
      schema: UserTagSchema,
      parsedElement,
      originalElement: element,
      modelName: 'usertag',
      ModelClass: UserTag,
    });
  }
}

export default UserTag;
