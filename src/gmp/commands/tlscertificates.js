/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import registerCommand from 'gmp/command';

import TlsCertificate from 'gmp/models/tlscertificate';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

export class TlsCertificateCommand extends EntityCommand {
  constructor(http) {
    super(http, 'tls_certificate', TlsCertificate);
  }

  getElementFromRoot(root) {
    return root.get_tls_certificate.get_tls_certificates_response
      .tls_certificate;
  }
}

export class TlsCertificatesCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'tls_certificate', TlsCertificate);
  }

  getTimeStatusAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'tls_certificate',
      group_column: 'time_status',
      filter,
    });
  }

  getModifiedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'tls_certificate',
      group_column: 'modified',
      filter,
    });
  }
  getEntitiesResponse(root) {
    return root.get_tls_certificates.get_tls_certificates_response;
  }
}

registerCommand('tlscertificate', TlsCertificateCommand);
registerCommand('tlscertificates', TlsCertificatesCommand);

// vim: set ts=2 sw=2 tw=80:
