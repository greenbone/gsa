/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseCsv} from 'gmp/parser';

export interface RoleElement extends ModelElement {
  users?: string;
}

interface RoleProperties extends ModelProperties {
  users?: string[];
}

class Role extends Model {
  static entityType = 'role';

  readonly users: string[];

  constructor({users = [], ...properties}: RoleProperties = {}) {
    super(properties);

    this.users = users;
  }

  static fromElement(element?: RoleElement): Role {
    return new Role(this.parseElement(element));
  }

  static parseElement(element: RoleElement = {}): RoleProperties {
    const ret = super.parseElement(element) as RoleProperties;

    ret.users = parseCsv(element.users);

    return ret;
  }
}

export default Role;
