/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

const TLS_CERTIFICATES_STATUS = 'tls-certificates-status';
const TLS_CERTIFICATES_MODIFIED = 'tls-certificates-modification-time';

const tlsCertificatesStatusLoadFunc = createLoadFunc(
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
    load={tlsCertificatesStatusLoadFunc}
    subscriptions={['tlscertificates.timer', 'tlscertificates.changed']}
  >
    {children}
  </Loader>
);

export const tlsCertificatesModifiedLoadFunc = createLoadFunc(
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
    load={tlsCertificatesModifiedLoadFunc}
    subscriptions={['tlscertificates.timer', 'tlscertificates.changed']}
  >
    {children}
  </Loader>
);
