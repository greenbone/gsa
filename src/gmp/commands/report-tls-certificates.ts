/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {parseFilter} from 'gmp/collection/parser';
import type {EntitiesMeta} from 'gmp/commands/entities';
import HttpCommand, {
  type HttpCommandInputParams,
  type HttpCommandOptions,
} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import type Response from 'gmp/http/response';
import type {XmlResponseData} from 'gmp/http/transform/fast-xml';
import type {FilterModelElement} from 'gmp/models/filter';
import ReportTLSCertificate, {
  type ReportTLSCertificateElement,
} from 'gmp/models/report/tls-certificate';
import {map} from 'gmp/utils/array';

interface TlsCertificatesElement {
  tls_certificate?: ReportTLSCertificateElement | ReportTLSCertificateElement[];
}

interface SslCertsElement {
  count?: number;
}

interface ReportTlsCertificatesResponseData extends XmlResponseData {
  get_report_tls_certificates?: {
    get_report_tls_certificates_response: {
      ssl_certs?: SslCertsElement;
      tls_certificates?: TlsCertificatesElement;
      filters?: FilterModelElement;
      [key: string]: unknown;
    };
  };
}

class ReportTlsCertificatesCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_report_tls_certificates'});
  }

  async get(
    params: HttpCommandInputParams = {},
    options?: HttpCommandOptions,
  ): Promise<Response<ReportTLSCertificate[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform(
      {details: 1, ...params},
      options,
    );

    const root = response.data as ReportTlsCertificatesResponseData;

    if (!root.get_report_tls_certificates) {
      throw new Error(
        'Invalid response: get_report_tls_certificates not found in response',
      );
    }

    const data =
      root.get_report_tls_certificates.get_report_tls_certificates_response;
    const certs = map(data.tls_certificates?.tls_certificate, tlsCert =>
      ReportTLSCertificate.fromElement(tlsCert),
    );

    // Keep payload-compatible behavior: split one certificate into one entry per port.
    const certsPerPort: ReportTLSCertificate[] = [];
    certs.forEach(cert => {
      cert.ports.forEach(port => {
        certsPerPort.push(cert.copy({port, ports: [port]}));
      });
    });

    const filteredCount = certsPerPort.length;
    const counts = new CollectionCounts({
      all: data.ssl_certs?.count ?? filteredCount,
      filtered: filteredCount,
      first: 1,
      length: filteredCount,
      rows: filteredCount,
    });

    const filter = parseFilter(data);

    return response.set<ReportTLSCertificate[], EntitiesMeta>(certsPerPort, {
      filter,
      counts,
    });
  }
}

export default ReportTlsCertificatesCommand;
