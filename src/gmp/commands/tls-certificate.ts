/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import TlsCertificate, {
  type TlsCertificateElement,
} from 'gmp/models/tls-certificate';

class TlsCertificateCommand extends EntityCommand<
  TlsCertificate,
  TlsCertificateElement
> {
  constructor(http: Http) {
    super(http, 'tls_certificate', TlsCertificate);
  }

  getElementFromRoot(root: Element): TlsCertificateElement {
    // @ts-expect-error
    return root.get_tls_certificate.get_tls_certificates_response
      .tls_certificate;
  }
}

export default TlsCertificateCommand;
