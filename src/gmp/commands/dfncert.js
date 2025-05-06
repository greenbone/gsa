/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import InfoEntitiesCommand from 'gmp/commands/infoentities';
import InfoEntityCommand from 'gmp/commands/infoentity';
import DfnCertAdv from 'gmp/models/dfncert';
import {isDefined} from 'gmp/utils/identity';

const info_filter = info => isDefined(info.dfn_cert_adv);

class DfnCertAdvCommand extends InfoEntityCommand {
  constructor(http) {
    super(http, 'dfn_cert_adv', DfnCertAdv);
  }
}

class DfnCertAdvsCommand extends InfoEntitiesCommand {
  constructor(http) {
    super(http, 'dfn_cert_adv', DfnCertAdv, info_filter);
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'dfn_cert_adv',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'dfn_cert_adv',
      group_column: 'severity',
      filter,
    });
  }
}

registerCommand('dfncert', DfnCertAdvCommand);
registerCommand('dfncerts', DfnCertAdvsCommand);
