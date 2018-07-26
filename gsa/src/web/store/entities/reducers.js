/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import {combineReducers} from 'redux';

import {reducer as alert} from './alerts';
import {reducer as credential} from './credentials';
import {reducer as filter} from './filters';
import {reducer as portlist} from './portlists';
import {reducer as reportformat} from './reportformats';
import {reducer as scanconfig} from './scanconfigs';
import {reducer as scanner} from './scanners';
import {reducer as schedule} from './schedules';
import {reducer as target} from './targets';
import {reducer as task} from './tasks';
import {reducer as agent} from './agents';
import {reducer as certbund} from './certbund';
import {reducer as cpe} from './cpes';
import {reducer as cve} from './cves';
import {reducer as dfncert} from './dfncerts';
import {reducer as group} from './groups';
import {reducer as host} from './hosts';
import {reducer as note} from './notes';
import {reducer as nvts} from './nvts';

const entitiesReducer = combineReducers({
  alert,
  credential,
  filter,
  portlist,
  reportformat,
  scanconfig,
  scanner,
  schedule,
  target,
  task,
  agent,
  certbund,
  cpe,
  cve,
  dfncert,
  group,
  host,
  note,
  nvts,
});

export default entitiesReducer;

// vim: set ts=2 sw=2 tw=80:
