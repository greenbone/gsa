/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseCsv} from 'gmp/parser';

interface GroupElement extends ModelElement {
  users?: string;
}

interface GroupProperties extends ModelProperties {
  users?: string[];
}

class Group extends Model {
  static entityType = 'group';

  readonly users: string[];

  constructor({users = [], ...properties}: GroupProperties = {}) {
    super(properties);

    this.users = users;
  }

  static fromElement(element: GroupElement = {}): Group {
    return new Group(this.parseElement(element));
  }

  static parseElement(element: GroupElement = {}): GroupProperties {
    const ret = super.parseElement(element) as GroupProperties;

    ret.users = parseCsv(element.users);

    return ret;
  }
}

export default Group;
