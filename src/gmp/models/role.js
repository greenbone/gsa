/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseCsv} from 'gmp/parser';

import Model from 'gmp/model';

class Role extends Model {
  static entityType = 'role';

  static parseElement(element) {
    const ret = super.parseElement(element);

    ret.users = parseCsv(element.users);

    return ret;
  }
}

export default Role;

// vim: set ts=2 sw=2 tw=80:
