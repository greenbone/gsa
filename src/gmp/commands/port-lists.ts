/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import PortList from 'gmp/models/port-list';

class PortListsCommand extends EntitiesCommand<PortList> {
  constructor(http: Http) {
    super(http, 'port_list', PortList);
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_port_lists.get_port_lists_response;
  }
}

export default PortListsCommand;
