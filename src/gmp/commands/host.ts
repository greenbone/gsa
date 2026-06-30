/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import Host, {type HostElement} from 'gmp/models/host';
import {type Element} from 'gmp/models/model';

interface HostCreateParams {
  name: string;
  comment?: string;
}

interface HostSaveParams {
  id: string;
  comment?: string;
}

interface HostDeleteIdentifierParams {
  id: string;
}

const log = logger.getLogger('gmp.commands.hosts');

class HostCommand extends EntityCommand<Host, HostElement> {
  constructor(http: Http) {
    super(http, 'asset', Host);
    this.setDefaultParam('asset_type', 'host');
  }

  create({name, comment = ''}: HostCreateParams) {
    log.debug('Creating host', {name, comment});
    return this.action({
      cmd: 'create_host',
      name,
      comment,
    });
  }

  save({id, comment = ''}: HostSaveParams) {
    log.debug('Saving host', {id, comment});
    return this.action({
      cmd: 'save_asset',
      asset_id: id,
      comment,
    });
  }

  async deleteIdentifier({id}: HostDeleteIdentifierParams) {
    log.debug('Deleting Host Identifier with id', id);
    await this.httpPostWithTransform({
      cmd: 'delete_asset',
      asset_id: id,
    });
  }

  getElementFromRoot(root: Element): HostElement {
    // @ts-expect-error
    return root.get_asset.get_assets_response.asset;
  }
}

export default HostCommand;
