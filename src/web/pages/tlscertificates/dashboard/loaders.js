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
import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

const TLS_CERTIFICATES_STATUS = 'tls-certificates-status';
const TLS_CERTIFICATES_MODIFIED = 'tls-certificates-modification-time';

const tlsCertificatesStatusLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.tlscertificates
      .getAll({
        filter,
      })
      .then(r => r.data),
  TLS_CERTIFICATES_STATUS,
);

export const TlsCertificatesStatusLoader = ({children, filter}) => (
  <Loader
    dataId={TLS_CERTIFICATES_STATUS}
    filter={filter}
    load={tlsCertificatesStatusLoader}
    subscriptions={['tlscertificates.timer', 'tlscertificates.changed']}
  >
    {children}
  </Loader>
);

TlsCertificatesStatusLoader.propTypes = loaderPropTypes;

export const tlsCertificatesModifiedLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.tlscertificates
      .getModifiedAggregates({
        filter,
      })
      .then(r => r.data),
  TLS_CERTIFICATES_MODIFIED,
);

export const TlsCertificatesModifiedLoader = ({filter, children}) => (
  <Loader
    dataId={TLS_CERTIFICATES_MODIFIED}
    filter={filter}
    load={tlsCertificatesModifiedLoader}
    subscriptions={['tlscertificates.timer', 'tlscertificates.changed']}
  >
    {children}
  </Loader>
);

TlsCertificatesModifiedLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
