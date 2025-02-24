/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import InfoEntitiesCommand from 'gmp/commands/infoentities';
import InfoEntityCommand from 'gmp/commands/infoentity';
import Cve from 'gmp/models/cve';
import {isDefined} from 'gmp/utils/identity';


const info_filter = info => isDefined(info.cve);

class CveCommand extends InfoEntityCommand {
  constructor(http) {
    super(http, 'cve', Cve);
  }
}

class CvesCommand extends InfoEntitiesCommand {
  constructor(http) {
    super(http, 'cve', Cve, info_filter);
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cve',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cve',
      group_column: 'severity',
      filter,
    });
  }
}

registerCommand('cve', CveCommand);
registerCommand('cves', CvesCommand);
