/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import Role from 'gmp/models/role';

class RolesCommand extends EntitiesCommand<Role> {
  constructor(http: Http) {
    super(http, 'role', Role);
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_roles.get_roles_response;
  }
}

export default RolesCommand;
