/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {combineReducers} from 'redux';

import {reducer as alert} from './alerts';
import {reducer as audit} from './audits';
import {reducer as certbund} from './certbund';
import {reducer as cpe} from './cpes';
import {reducer as credential} from './credentials';
import {reducer as cve} from './cves';
import {reducer as dfncert} from './dfncerts';
import {reducer as filter} from './filters';
import {reducer as group} from './groups';
import {reducer as host} from './hosts';
import {reducer as note} from './notes';
import {reducer as nvt} from './nvts';
import {reducer as operatingsystem} from './operatingsystems';
import {reducer as ovaldef} from './ovaldefs';
import {reducer as override} from './overrides';
import {reducer as permission} from './permissions';
import {reducer as policy} from './policies';
import {reducer as portlist} from './portlists';
import {reducer as reportformat} from './reportformats';
import {reducer as report, deltaReducer as deltaReport} from './reports';
import {reducer as result} from './results';
import {reducer as role} from './roles';
import {reducer as scanconfig} from './scanconfigs';
import {reducer as scanner} from './scanners';
import {reducer as schedule} from './schedules';
import {reducer as tag} from './tags';
import {reducer as target} from './targets';
import {reducer as task} from './tasks';
import {reducer as ticket} from './tickets';
import {reducer as tlscertificate} from './tlscertificates';
import {reducer as user} from './users';
import {reducer as vuln} from './vulns';

const entitiesReducer = combineReducers({
  alert,
  audit,
  certbund,
  cpe,
  credential,
  cve,
  deltaReport,
  dfncert,
  filter,
  group,
  host,
  note,
  nvt,
  operatingsystem,
  ovaldef,
  override,
  permission,
  policy,
  portlist,
  reportformat,
  report,
  result,
  role,
  scanconfig,
  scanner,
  schedule,
  tag,
  target,
  task,
  ticket,
  tlscertificate,
  user,
  vuln,
});

export default entitiesReducer;

// vim: set ts=2 sw=2 tw=80:
