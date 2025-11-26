/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntitiesCommand from 'gmp/commands/info-entities';
import type Http from 'gmp/http/http';
import Cpe from 'gmp/models/cpe';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';

const infoFilter = (info: Element) => isDefined(info.cpe);

class CpesCommand extends InfoEntitiesCommand<Cpe> {
  constructor(http: Http) {
    super(http, 'cpe', Cpe, infoFilter);
  }

  getCreatedAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cpe',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cpe',
      group_column: 'severity',
      filter,
    });
  }
}

export default CpesCommand;
