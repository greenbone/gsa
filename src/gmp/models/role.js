/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model from 'gmp/models/model';
import {parseCsv} from 'gmp/parser';

class Role extends Model {
  static entityType = 'role';

  static parseElement(element) {
    const ret = super.parseElement(element);

    ret.users = parseCsv(element.users);

    return ret;
  }
}

export default Role;
