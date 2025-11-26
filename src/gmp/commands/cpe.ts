/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntityCommand from 'gmp/commands/info-entity';
import type Http from 'gmp/http/http';
import Cpe from 'gmp/models/cpe';

class CpeCommand extends InfoEntityCommand<Cpe> {
  constructor(http: Http) {
    super(http, 'cpe', Cpe);
  }
}

export default CpeCommand;
