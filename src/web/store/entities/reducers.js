/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {combineReducers} from 'redux';
import {reducer as alert} from 'web/store/entities/alerts';
import {
  reducer as auditreport,
  deltaAuditReducer as deltaAuditReport,
} from 'web/store/entities/auditreports';
import {reducer as audit} from 'web/store/entities/audits';
import {reducer as certbund} from 'web/store/entities/certbund';
import {reducer as cpe} from 'web/store/entities/cpes';
import {reducer as credential} from 'web/store/entities/credentials';
import {reducer as cve} from 'web/store/entities/cves';
import {reducer as dfncert} from 'web/store/entities/dfncerts';
import {reducer as filter} from 'web/store/entities/filters';
import {reducer as group} from 'web/store/entities/groups';
import {reducer as host} from 'web/store/entities/hosts';
import {reducer as note} from 'web/store/entities/notes';
import {reducer as nvt} from 'web/store/entities/nvts';
import {reducer as operatingsystem} from 'web/store/entities/operatingsystems';
import {reducer as override} from 'web/store/entities/overrides';
import {reducer as permission} from 'web/store/entities/permissions';
import {reducer as policy} from 'web/store/entities/policies';
import {reducer as portlist} from 'web/store/entities/portlists';
import {reducer as reportconfig} from 'web/store/entities/reportconfigs';
import {reducer as reportformat} from 'web/store/entities/reportformats';
import {reducer as report, deltaReducer as deltaReport} from 'web/store/entities/reports';
import {reducer as result} from 'web/store/entities/results';
import {reducer as role} from 'web/store/entities/roles';
import {reducer as scanconfig} from 'web/store/entities/scanconfigs';
import {reducer as scanner} from 'web/store/entities/scanners';
import {reducer as schedule} from 'web/store/entities/schedules';
import {reducer as tag} from 'web/store/entities/tags';
import {reducer as target} from 'web/store/entities/targets';
import {reducer as task} from 'web/store/entities/tasks';
import {reducer as ticket} from 'web/store/entities/tickets';
import {reducer as tlscertificate} from 'web/store/entities/tlscertificates';
import {reducer as user} from 'web/store/entities/users';
import {reducer as vuln} from 'web/store/entities/vulns';

const entitiesReducer = combineReducers({
  alert,
  audit,
  auditreport,
  certbund,
  cpe,
  credential,
  cve,
  deltaAuditReport,
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
