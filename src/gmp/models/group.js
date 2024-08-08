/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseCsv} from 'gmp/parser';

import Model from 'gmp/model';

class Group extends Model {
  static entityType = 'group';

  static parseElement(element) {
    const ret = super.parseElement(element);

    ret.users = parseCsv(element.users);

    return ret;
  }
}

export default Group;

// vim: set ts=2 sw=2 tw=80:
