/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import Target from 'gmp/models/target';

class TargetsCommand extends EntitiesCommand<Target> {
  constructor(http: Http) {
    super(http, 'target', Target);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_targets.get_targets_response;
  }
}

export default TargetsCommand;
