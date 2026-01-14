/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import Alert from 'gmp/models/alert';
import {type Element} from 'gmp/models/model';

class AlertsCommand extends EntitiesCommand<Alert> {
  constructor(http: Http) {
    super(http, 'alert', Alert);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_alerts.get_alerts_response;
  }
}

export default AlertsCommand;
