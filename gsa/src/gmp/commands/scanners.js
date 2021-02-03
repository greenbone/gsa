/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import logger from 'gmp/log';

import registerCommand from 'gmp/command';

import Scanner from 'gmp/models/scanner';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.scanners');

class ScannersCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'scanner', Scanner);
  }

  getEntitiesResponse(root) {
    return root.get_scanners.get_scanners_response;
  }
}

class ScannerCommand extends EntityCommand {
  constructor(http) {
    super(http, 'scanner', Scanner);
  }

  getElementFromRoot(root) {
    return root.get_scanner.get_scanners_response.scanner;
  }

  create({name, ca_pub, comment = '', credential_id, host, port, type}) {
    const data = {
      cmd: 'create_scanner',
      name,
      comment,
      credential_id,
      scanner_host: host,
      scanner_type: type,
      port,
      ca_pub,
    };
    log.debug('Creating new scanner', data);
    return this.action(data);
  }

  save({
    id,
    name,
    ca_pub = '',
    comment = '',
    credential_id,
    host,
    port,
    type,
    which_cert,
  }) {
    const data = {
      cmd: 'save_scanner',
      ca_pub,
      comment,
      credential_id,
      id,
      name,
      port,
      scanner_host: host,
      scanner_type: type,
      which_cert,
    };
    log.debug('Saving scanner', data);
    return this.action(data);
  }

  verify({id}) {
    return this.httpPost({
      cmd: 'verify_scanner',
      id,
    });
  }
}

registerCommand('scanner', ScannerCommand);
registerCommand('scanners', ScannersCommand);

// vim: set ts=2 sw=2 tw=80:
