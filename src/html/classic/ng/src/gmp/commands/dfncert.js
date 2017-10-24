/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_defined} from '../utils.js';

import InfoEntitiesCommand from './infoentities.js';
import InfoEntityCommand from './infoentity.js';

import register_command from '../command.js';

import DfnCertAdv from '../models/dfncert.js';

const info_filter = info => is_defined(info.dfn_cert_adv);

class DfnCertAdvCommand extends InfoEntityCommand {

  constructor(http) {
    super(http, 'dfn_cert_adv', DfnCertAdv);
  }
}

class DfnCertAdvsCommand extends InfoEntitiesCommand {

  constructor(http) {
    super(http, 'dfn_cert_adv', DfnCertAdv, info_filter);
  }
}

register_command('dfncertadv', DfnCertAdvCommand);
register_command('dfncertadvs', DfnCertAdvsCommand);

// vim: set ts=2 sw=2 tw=80:
