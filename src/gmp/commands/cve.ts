/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntityCommand from 'gmp/commands/info-entity';
import type Http from 'gmp/http/http';
import CVE from 'gmp/models/cve';

class CveCommand extends InfoEntityCommand<CVE> {
  constructor(http: Http) {
    super(http, 'cve', CVE);
  }
}

export default CveCommand;
