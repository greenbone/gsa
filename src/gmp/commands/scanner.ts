/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type GmpHttp from 'gmp/http/gmp';
import logger from 'gmp/log';
import {type Element} from 'gmp/models/model';
import Scanner, {
  type ScannerElement,
  type ScannerType,
} from 'gmp/models/scanner';

interface ScannerCommandCreateParams {
  name: string;
  caCertificate?: File;
  comment?: string;
  credentialId?: string;
  host: string;
  port: number;
  type: ScannerType;
}

interface ScannerCommandSaveParams extends ScannerCommandCreateParams {
  id: string;
}

interface ScannerCommandVerifyParams {
  id: string;
}

const log = logger.getLogger('gmp.commands.scanner');

class ScannerCommand extends EntityCommand<Scanner, ScannerElement> {
  constructor(http: GmpHttp) {
    super(http, 'scanner', Scanner);
  }

  getElementFromRoot(root: Element): ScannerElement {
    // @ts-expect-error
    return root.get_scanner.get_scanners_response.scanner;
  }

  create({
    name,
    caCertificate,
    comment = '',
    credentialId,
    host,
    port,
    type,
  }: ScannerCommandCreateParams) {
    const data = {
      cmd: 'create_scanner',
      ca_pub: caCertificate,
      comment,
      credential_id: credentialId,
      name,
      port,
      scanner_host: host,
      scanner_type: type,
    };
    log.debug('Creating new scanner', data);
    return this.action(data);
  }

  save({
    id,
    name,
    caCertificate,
    comment = '',
    credentialId,
    host,
    port,
    type,
  }: ScannerCommandSaveParams) {
    const data = {
      cmd: 'save_scanner',
      ca_pub: caCertificate,
      comment,
      credential_id: credentialId,
      id,
      name,
      port,
      scanner_host: host,
      scanner_type: type,
    };
    log.debug('Saving scanner', data);
    return this.action(data);
  }

  verify({id}: ScannerCommandVerifyParams) {
    return this.action({
      cmd: 'verify_scanner',
      id,
    });
  }
}

export default ScannerCommand;
