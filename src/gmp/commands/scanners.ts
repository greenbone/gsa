/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import Scanner from 'gmp/models/scanner';

class ScannersCommand extends EntitiesCommand<Scanner> {
  constructor(http: Http) {
    super(http, 'scanner', Scanner);
  }

  getEntitiesResponse(root) {
    return root.get_scanners.get_scanners_response;
  }
}

export default ScannersCommand;
