/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model from 'gmp/model';
import {parseCsv} from 'gmp/parser';

class Group extends Model {
  static entityType = 'group';

  static parseElement(element) {
    const ret = super.parseElement(element);

    ret.users = parseCsv(element.users);

    return ret;
  }
}

export default Group;
