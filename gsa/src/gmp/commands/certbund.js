/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import {isDefined} from '../utils/identity';

import InfoEntitiesCommand from './infoentities.js';
import InfoEntityCommand from './infoentity.js';

import registerCommand from '../command.js';

import CertBundAdv from '../models/certbund.js';

const info_filter = info => isDefined(info.cert_bund_adv);

class CertBundCommand extends InfoEntityCommand {
  constructor(http) {
    super(http, 'cert_bund_adv', CertBundAdv);
  }
}

class CertBundsCommand extends InfoEntitiesCommand {
  constructor(http) {
    super(http, 'cert_bund_adv', CertBundAdv, info_filter);
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cert_bund_adv',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cert_bund_adv',
      group_column: 'severity',
      filter,
    });
  }
}

registerCommand('certbund', CertBundCommand);
registerCommand('certbunds', CertBundsCommand);

// vim: set ts=2 sw=2 tw=80:
