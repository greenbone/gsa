/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import Group from 'gmp/models/group';
import {type Element} from 'gmp/models/model';

class GroupsCommand extends EntitiesCommand<Group> {
  constructor(http: Http) {
    super(http, 'group', Group);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_groups.get_groups_response;
  }
}

export default GroupsCommand;
