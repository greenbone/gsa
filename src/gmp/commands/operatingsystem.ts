/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import OperatingSystem, {type OperatingSystemElement} from 'gmp/models/os';

class OperatingSystemCommand extends EntityCommand<
  OperatingSystem,
  OperatingSystemElement
> {
  constructor(http: Http) {
    super(http, 'asset', OperatingSystem);
    this.setDefaultParam('asset_type', 'os');
  }

  getElementFromRoot(root: Element): OperatingSystemElement {
    // @ts-expect-error
    return root.get_asset.get_assets_response.asset;
  }
}

export default OperatingSystemCommand;
