/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import WebApplicationTarget from 'gmp/models/web-application-target';

class WebApplicationTargetsCommand extends EntitiesCommand<WebApplicationTarget> {
  constructor(http: Http) {
    super(http, 'web_application_target', WebApplicationTarget);
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_web_application_targets
      .get_web_application_targets_response;
  }
}

export default WebApplicationTargetsCommand;
