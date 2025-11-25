/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import Credential from 'gmp/models/credential';

class CredentialsCommand extends EntitiesCommand<Credential> {
  constructor(http: Http) {
    super(http, 'credential', Credential);
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_credentials.get_credentials_response;
  }
}

export default CredentialsCommand;
