/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
