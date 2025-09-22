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
  ca_pub?: string;
  comment?: string;
  credential_id?: string;
  host: string;
  port: string;
  type: ScannerType;
}

interface ScannerCommandSaveParams {
  id: string;
  name: string;
  ca_pub?: string;
  comment?: string;
  credential_id?: string;
  host: string;
  port: string;
  type: ScannerType;
  which_cert?: string;
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ca_pub,
    comment = '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    credential_id,
    host,
    port,
    type,
  }: ScannerCommandCreateParams) {
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ca_pub = '',
    comment = '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    credential_id,
    host,
    port,
    type,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    which_cert,
  }: ScannerCommandSaveParams) {
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

  verify({id}: ScannerCommandVerifyParams) {
    return this.httpPost({
      cmd: 'verify_scanner',
      id,
    });
  }
}

export default ScannerCommand;
