/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

import InfoEntitiesCommand from './infoentities';
import InfoEntityCommand from './infoentity';

import registerCommand from 'gmp/command';

import Cpe from 'gmp/models/cpe';

const info_filter = info => isDefined(info.cpe);

class CpeCommand extends InfoEntityCommand {
  constructor(http) {
    super(http, 'cpe', Cpe);
  }
}

class CpesCommand extends InfoEntitiesCommand {
  constructor(http) {
    super(http, 'cpe', Cpe, info_filter);
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cpe',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cpe',
      group_column: 'severity',
      filter,
    });
  }
}

registerCommand('cpe', CpeCommand);
registerCommand('cpes', CpesCommand);

// vim: set ts=2 sw=2 tw=80:
