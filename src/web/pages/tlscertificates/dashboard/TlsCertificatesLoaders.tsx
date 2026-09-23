/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type TlsCertificate from 'gmp/models/tls-certificate';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';

export type TlsCertificatesData = TlsCertificate[];

interface TlsCertificatesModifiedGroup {
  value: string;
  count: number;
  c_count: number;
}

export interface TlsCertificateModifiedData {
  groups?: TlsCertificatesModifiedGroup[];
}

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

export const TlsCertificatesStatusLoader = ({
  children,
  filter,
}: DisplayLoaderProps<TlsCertificatesData>) => (
  <Loader
    dataId={TLS_CERTIFICATES_STATUS}
    filter={filter}
    load={tlsCertificatesStatusLoadFunc}
    subscriptions={['tlscertificates.timer', 'tlscertificates.changed']}
  >
    {children}
  </Loader>
);
const tlsCertificatesModifiedLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.tlscertificates
      .getModifiedAggregates({
        filter,
      })
      .then(r => r.data),
  TLS_CERTIFICATES_MODIFIED,
);

export const TlsCertificatesModifiedLoader = ({
  filter,
  children,
}: DisplayLoaderProps<TlsCertificateModifiedData>) => (
  <Loader
    dataId={TLS_CERTIFICATES_MODIFIED}
    filter={filter}
    load={tlsCertificatesModifiedLoadFunc}
    subscriptions={['tlscertificates.timer', 'tlscertificates.changed']}
  >
    {children}
  </Loader>
);
