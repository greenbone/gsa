/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import CredentialStore from 'gmp/models/credential-store';

class CredentialStoresCommand extends EntitiesCommand<CredentialStore> {
  constructor(http: Http) {
    super(http, 'credential_store', CredentialStore);
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_credential_stores.get_credential_stores_response;
  }
}

export default CredentialStoresCommand;
