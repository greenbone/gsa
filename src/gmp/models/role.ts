/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {z} from 'zod';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseCsv} from 'gmp/parser';
import {validateAndCreate} from 'gmp/utils/zodModelValidation';

type RoleElement = z.infer<typeof RoleElementSchema> & ModelElement;

type RoleProperties = z.infer<typeof RoleSchema> & ModelProperties;

export const RoleElementSchema = z.object({
  users: z.string().optional(),
});

const RoleSchema = z.object({
  users: z.array(z.string()).optional(),
});

class Role extends Model {
  static readonly entityType = 'role';

  readonly users: string[];

  constructor(
    {users = [], ...properties}: RoleProperties = {} as RoleProperties,
  ) {
    super(properties);

    this.users = users;
  }

  static fromElement(element: RoleElement = {}): Role {
    const parsedElement = this.parseElement(element);

    return validateAndCreate({
      schema: RoleSchema,
      parsedElement,
      originalElement: element,
      modelName: 'role',
      ModelClass: Role,
    });
  }

  static parseElement(element: RoleElement = {}): RoleProperties {
    const ret = super.parseElement(element) as RoleProperties;

    ret.users = parseCsv(element.users);

    return ret;
  }
}

export default Role;
