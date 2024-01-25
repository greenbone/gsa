/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {combineReducers} from 'redux';

import {reducer as alert} from './alerts';
import {reducer as audit} from './audits';
import {reducer as auditreport} from './auditreports';
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
import {reducer as override} from './overrides';
import {reducer as permission} from './permissions';
import {reducer as policy} from './policies';
import {reducer as portlist} from './portlists';
import {reducer as reportconfig} from './reportconfigs';
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
  auditreport,
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
  override,
  permission,
  policy,
  portlist,
  reportconfig,
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
