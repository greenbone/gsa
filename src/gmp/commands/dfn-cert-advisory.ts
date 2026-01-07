/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntityCommand from 'gmp/commands/info-entity';
import type Http from 'gmp/http/http';
import DfnCertAdv from 'gmp/models/dfn-cert';

class DfnCertAdvisoryCommand extends InfoEntityCommand<DfnCertAdv> {
  constructor(http: Http) {
    super(http, 'dfn_cert_adv', DfnCertAdv);
  }
}

export default DfnCertAdvisoryCommand;
