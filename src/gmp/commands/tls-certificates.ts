/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import TlsCertificate from 'gmp/models/tls-certificate';

interface TlsCertificateAggregatesParams {
  filter?: Filter | string;
}

class TlsCertificatesCommand extends EntitiesCommand<TlsCertificate> {
  constructor(http: Http) {
    super(http, 'tls_certificate', TlsCertificate);
  }

  getTimeStatusAggregates({filter}: TlsCertificateAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'tls_certificate',
      group_column: 'time_status',
      filter,
    });
  }

  getModifiedAggregates({filter}: TlsCertificateAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'tls_certificate',
      group_column: 'modified',
      filter,
    });
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_tls_certificates.get_tls_certificates_response;
  }
}

export default TlsCertificatesCommand;
