/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import GmpHttp from 'gmp/http/gmp';
import logger from 'gmp/log';
import {Element} from 'gmp/models/model';
import Scanner, {ScannerElement, ScannerType} from 'gmp/models/scanner';

interface ScannerCommandCreateParams {
  name: string;
  caPub?: File;
  comment?: string;
  credentialId?: string;
  host: string;
  port: number;
  type: ScannerType;
}

interface ScannerCommandSaveParams {
  id: string;
  name: string;
  caPub?: File;
  comment?: string;
  credentialId?: string;
  host: string;
  port: number;
  type: ScannerType;
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
    caPub,
    comment = '',
    credentialId,
    host,
    port,
    type,
  }: ScannerCommandCreateParams) {
    const data = {
      cmd: 'create_scanner',
      name,
      comment,
      credential_id: credentialId,
      scanner_host: host,
      scanner_type: type,
      port,
      ca_pub: caPub,
    };
    log.debug('Creating new scanner', data);
    return this.action(data);
  }

  save({
    id,
    name,
    caPub,
    comment = '',
    credentialId,
    host,
    port,
    type,
  }: ScannerCommandSaveParams) {
    const data = {
      cmd: 'save_scanner',
      ca_pub: caPub,
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
