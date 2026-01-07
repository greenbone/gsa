/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntityCommand from 'gmp/commands/info-entity';
import type Http from 'gmp/http/http';
import CertBundAdv from 'gmp/models/cert-bund';

class CertBundAdvisoryCommand extends InfoEntityCommand<CertBundAdv> {
  constructor(http: Http) {
    super(http, 'cert_bund_adv', CertBundAdv);
  }
}

export default CertBundAdvisoryCommand;
