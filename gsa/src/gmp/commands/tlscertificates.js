/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import registerCommand from '../command';

import TlsCertificate from '../models/tlscertificate';

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
