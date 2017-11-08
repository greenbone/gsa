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
import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import {
  METHOD_TYPE_SCP,
  METHOD_TYPE_SEND,
  METHOD_TYPE_SNMP,
  METHOD_TYPE_SYSLOG,
  METHOD_TYPE_EMAIL,
  METHOD_TYPE_START_TASK,
} from 'gmp/models/alert.js';

const Method = ({
  method,
}) => {
  let url = '';
  if (method.type === METHOD_TYPE_SCP) {
    const {scp_credential} = method.data;

    if (is_defined(scp_credential) && is_defined(scp_credential.credential)) {
      url += scp_credential.credential.login;
    }
    else {
      url += _('(Credential unavailable)');
    }

    url += '@';

    if (is_defined(method.data.scp_host)) {
      url += method.data.scp_host.value;
    }
    if (is_defined(method.data.scp_path)) {
      url += ':' + method.data.scp_path.value;
    }
    return _('SCP to {{url}}', {url});
  }

  if (method.type === METHOD_TYPE_SEND) {
    url += method.data.send_host.value + ':' + method.data.send_port.value;
    return _('Send to {{url}}', {url});
  }

  if (method.type === METHOD_TYPE_SYSLOG &&
    method.data.submethod.value === METHOD_TYPE_SNMP) {
    return 'SNMP';
  }

  if (method.type === METHOD_TYPE_SNMP) {
    return _('SNMP to {{agent}}', {agent: method.data.snmp_agent.value});
  }

  if (method.type === METHOD_TYPE_EMAIL && is_defined(method.data.to_address)) {
    return _('Email to {{address}}', {address: method.data.to_address.value});
  }

  if (method.type === METHOD_TYPE_START_TASK) {
    // FIXME task name ist missing
    // in xslt the tasks have been added to the response
    // we should improve the backend to return the name for the task id here too
    return _('Start Task');
  }

  return method.type;
};

export default Method;

// vim: set ts=2 sw=2 tw=80:
