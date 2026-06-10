/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import type {Element} from 'gmp/models/model';
import WebApplicationTarget from 'gmp/models/web-application-target';

class WebApplicationTargetCommand extends EntityCommand<WebApplicationTarget> {
  constructor(http: Http) {
    super(http, 'web_application_target', WebApplicationTarget);
  }

  getElementFromRoot(root: Element): Element {
    // @ts-expect-error
    return root.get_web_application_target
      .get_web_application_target_response.web_application_target;
  }
}

export default WebApplicationTargetCommand;
