/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntitiesCommand from 'gmp/commands/info-entities';
import type Http from 'gmp/http/http';
import Cve from 'gmp/models/cve';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';

const infoFilter = (info: Element) => isDefined(info.cve);

class CvesCommand extends InfoEntitiesCommand<Cve> {
  constructor(http: Http) {
    super(http, 'cve', Cve, infoFilter);
  }

  getCreatedAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cve',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cve',
      group_column: 'severity',
      filter,
    });
  }
}

export default CvesCommand;
