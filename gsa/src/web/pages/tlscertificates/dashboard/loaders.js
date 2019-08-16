/* Copyright (C) 2019 Greenbone Networks GmbH
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
