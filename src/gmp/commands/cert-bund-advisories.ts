/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntitiesCommand from 'gmp/commands/info-entities';
import type Http from 'gmp/http/http';
import CertBundAdv from 'gmp/models/cert-bund';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';

const infoFilter = (info: Element) => isDefined(info.cert_bund_adv);

class CertBundAdvisoriesCommand extends InfoEntitiesCommand<CertBundAdv> {
  constructor(http: Http) {
    super(http, 'cert_bund_adv', CertBundAdv, infoFilter);
  }

  getCreatedAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cert_bund_adv',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cert_bund_adv',
      group_column: 'severity',
      filter,
    });
  }
}

export default CertBundAdvisoriesCommand;
