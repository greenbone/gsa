/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
