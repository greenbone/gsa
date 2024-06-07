/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

export class ResourceName {
  constructor({id, name, type}) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  static fromElement(element, type) {
    const {_id, name} = element;

    return new ResourceName({
      id: isDefined(_id) ? _id : '',
      name: isDefined(name) ? name : '',
      type: type,
    });
  }
}

export default ResourceName;
