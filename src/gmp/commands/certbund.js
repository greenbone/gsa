/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import CertBundAdv from 'gmp/models/certbund';
import {isDefined} from 'gmp/utils/identity';

import InfoEntitiesCommand from './infoentities';
import InfoEntityCommand from './infoentity';

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
