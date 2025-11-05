/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

interface ResourceNameElement {
  _id?: string;
  name?: string;
}

interface ResourceNameProperties {
  id: string;
  name: string;
  type: string;
}

class ResourceName {
  readonly id: string;
  readonly name: string;
  readonly type: string;

  constructor({id, name, type}: ResourceNameProperties) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  static fromElement(element: ResourceNameElement, type: string): ResourceName {
    const {_id, name} = element;

    return new ResourceName({
      id: isDefined(_id) ? _id : '',
      name: isDefined(name) ? name : '',
      type: type,
    });
  }
}

export default ResourceName;
