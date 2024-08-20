/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

import InfoEntitiesCommand from './infoentities';
import InfoEntityCommand from './infoentity';

import registerCommand from 'gmp/command';

import Cve from 'gmp/models/cve';

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

// vim: set ts=2 sw=2 tw=80:
