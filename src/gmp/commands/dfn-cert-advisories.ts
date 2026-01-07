/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntitiesCommand from 'gmp/commands/info-entities';
import type Http from 'gmp/http/http';
import DfnCertAdv from 'gmp/models/dfn-cert';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';

const infoFilter = (info: Element) => isDefined(info.dfn_cert_adv);

class DfnCertAdvisoriesCommand extends InfoEntitiesCommand<DfnCertAdv> {
  constructor(http: Http) {
    super(http, 'dfn_cert_adv', DfnCertAdv, infoFilter);
  }

  getCreatedAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'dfn_cert_adv',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'dfn_cert_adv',
      group_column: 'severity',
      filter,
    });
  }
}

export default DfnCertAdvisoriesCommand;
