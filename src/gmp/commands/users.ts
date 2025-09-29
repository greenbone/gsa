/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import GmpHttp from 'gmp/http/gmp';
import {Element} from 'gmp/models/model';
import User from 'gmp/models/user';

class UsersCommand extends EntitiesCommand<User> {
  constructor(http: GmpHttp) {
    super(http, 'user', User);
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_users.get_users_response;
  }
}

export default UsersCommand;
