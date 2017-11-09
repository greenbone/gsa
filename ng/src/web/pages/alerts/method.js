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
import React from 'react';

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import {
  EMAIL_NOTICE_ATTACH,
  EMAIL_NOTICE_INCLUDE,
  METHOD_TYPE_SCP,
  METHOD_TYPE_SEND,
  METHOD_TYPE_SNMP,
  METHOD_TYPE_SYSLOG,
  METHOD_TYPE_EMAIL,
  METHOD_TYPE_START_TASK,
  METHOD_TYPE_HTTP_GET,
  METHOD_TYPE_SOURCEFIRE,
  METHOD_TYPE_VERINICE,
} from 'gmp/models/alert.js';

import PropTypes from '../../utils/proptypes.js';

import DetailsLink from '../../components/link/detailslink.js';

import SimpleTable from '../../components/table/simpletable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const Table = glamorous(SimpleTable)({
  marginTop: '5px',
  marginLeft: '45px',
  '& td': {
    padding: '0',
  },
});
const Method = ({
  method,
  details = false,
}) => {
  let url = '';
  if (method.type === METHOD_TYPE_SCP) {
    const {data = {}} = method;
    const {scp_credential = {}} = data;
    const {credential} = scp_credential;

    if (details) {
      return (
        <div>
          <div>{_('SCP')}</div>
          <Table>
            <TableBody>
              {is_defined(data.scp_host) && is_defined(data.scp_host.value) &&
                <TableRow>
                  <TableData>
                    {_('Host')}
                  </TableData>
                  <TableData>
                    {data.scp_host.value}
                  </TableData>
                </TableRow>
              }

              {is_defined(credential) && is_defined(credential.id) &&
                <TableRow>
                  <TableData>
                    {_('Credential')}
                  </TableData>
                  <TableData>
                    <DetailsLink
                      id={credential.id}
                      type="credential"
                    >
                      {credential.name}
                    </DetailsLink>
                  </TableData>
                </TableRow>
              }

              {is_defined(credential) && is_defined(credential.login) &&
                <TableRow>
                  <TableData>
                    {_('Login')}
                  </TableData>
                  <TableData>
                    {credential.login}
                  </TableData>
                </TableRow>
              }

              {is_defined(data.scp_known_hosts) &&
                is_defined(data.scp_known_hosts.value) &&
                <TableRow>
                  <TableData>
                    {_('Known Hosts')}
                  </TableData>
                  <TableData>
                    {data.scp_known_hosts.value}
                  </TableData>
                </TableRow>
              }

              {is_defined(data.scp_path) &&
                is_defined(data.scp_path.value) &&
                <TableRow>
                  <TableData>
                    {_('Path')}
                  </TableData>
                  <TableData>
                    {data.scp_path.value}
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </Table>
        </div>
      );
    }

    if (is_defined(credential) && is_defined(credential)) {
      url += credential.login;
    }
    else {
      url += _('(Credential unavailable)');
    }

    url += '@';

    if (is_defined(data.scp_host)) {
      url += data.scp_host.value;
    }
    if (is_defined(data.scp_path)) {
      url += ':' + data.scp_path.value;
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
    const {data} = method;
    if (details) {
      return (
        <div>
          <div>{_('SNMP')}</div>
          <Table>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Agent')}
                </TableData>
                <TableData>
                  {data.snmp_agent.value}
                </TableData>
              </TableRow>

              {is_defined(data.snmp_community) &&
                is_defined(data.snmp_community.value) &&
                <TableRow>
                  <TableData>
                    {_('Community')}
                  </TableData>
                  <TableData>
                    {data.snmp_community.value}
                  </TableData>
                </TableRow>
              }

              {is_defined(data.snmp_agent) &&
                is_defined(data.snmp_agent.value) &&
                <TableRow>
                  <TableData>
                    {_('Message {{name}}')}
                  </TableData>
                  <TableData>
                    {data.snmp_message.value}
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </Table>
        </div>
      );
    }
    return _('SNMP to {{agent}}', {agent: data.snmp_agent.value});
  }

  if (method.type === METHOD_TYPE_EMAIL && is_defined(method.data.to_address)) {
    const {data} = method;
    // TODO improve email content info. the info depends on the event type :-/
    if (details) {
      return (
        <div>
          <div>{_('Email')}</div>
          <Table>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('To address')}
                </TableData>
                <TableData>
                  {data.to_address.value}
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('From address')}
                </TableData>
                <TableData>
                  {data.from_address.value}
                </TableData>
              </TableRow>

              {details && is_defined(data.notice) &&
                is_defined(data.notice.value) &&
                <TableRow>
                  <TableData>
                    {_('Content')}
                  </TableData>
                  <TableData>
                    {data.notice.value === EMAIL_NOTICE_INCLUDE ?
                      _('Include Content') :
                      data.notice.value === EMAIL_NOTICE_ATTACH ?
                      _('Attach Content') :
                      _('Simple Notice')
                    }
                  </TableData>
                </TableRow>
              }

              {details && is_defined(data.subject) &&
                is_defined(data.subject.value) &&
                <TableRow>
                  <TableData>
                    {_('Subject')}
                  </TableData>
                  <TableData>
                    {data.subject.value}
                  </TableData>
                </TableRow>
              }

              {details && is_defined(data.message) &&
                is_defined(data.message.value) &&
                <TableRow>
                  <TableData>
                    {_('Message')}
                  </TableData>
                  <TableData>
                    {data.message.value}
                  </TableData>
                </TableRow>
              }

            </TableBody>
          </Table>
        </div>
      );
    }
    return _('Email to {{address}}', {address: data.to_address.value});
  }

  if (method.type === METHOD_TYPE_START_TASK) {
    // FIXME task name ist missing
    // in xslt the tasks have been added to the response
    // we should improve the backend to return the name for the task id here too
    return _('Start Task');
  }

  if (method.type === METHOD_TYPE_HTTP_GET) {
    const {data = {}} = method;

    if (is_defined(data.URL) && is_defined(data.URL.value)) {
      return _('HTTP GET request to URL {{url}}', {url: data.URL.value});
    }

    return _('HTTP GET request');
  }

  if (method.type === METHOD_TYPE_SOURCEFIRE) {
    const {data = {}} = method;
    if (details) {
      return (
        <div>
          <div>{_('Sourcefire Connector')}</div>
          <Table>
            <TableBody>
              {is_defined(data.defense_center_ip) &&
                is_defined(data.defense_center_ip.value) &&
                <TableRow>
                  <TableData>
                    {_('Defense Center IP')}
                  </TableData>
                  <TableData>
                    {data.defense_center_ip.value}
                  </TableData>
                </TableRow>
              }
              {is_defined(data.defense_center_port) &&
                is_defined(data.defense_center_port.value) &&
                <TableRow>
                  <TableData>
                    {_('Defense Center Port')}
                  </TableData>
                  <TableData>
                    {data.defense_center_port.value}
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </Table>
        </div>
      );
    }
    return _('Sourcefire Connector');
  }

  if (method.type === METHOD_TYPE_VERINICE) {
    const {data = {}} = method;
    const {verinice_server_credential = {}} = data;
    const {credential} = verinice_server_credential;

    if (details) {
      // TODO add verinice report format.
      // Currently we can't get the report format details
      return (
        <div>
          <div>{_('verinice Connector')}</div>
          <Table>
            <TableBody>

              {is_defined(data.verinice_server_url) &&
                is_defined(data.verinice_server_url.value) &&
                <TableRow>
                  <TableData>
                    {_('URL')}
                  </TableData>
                  <TableData>
                    {data.verinice_server_url.value}
                  </TableData>
                </TableRow>
              }

              {is_defined(credential) && is_defined(credential.id) &&
                <TableRow>
                  <TableData>
                    {_('Credential')}
                  </TableData>
                  <TableData>
                    <DetailsLink
                      id={credential.id}
                      type="credential"
                    >
                      {credential.name}
                    </DetailsLink>
                  </TableData>
                </TableRow>
              }

              {is_defined(credential) && is_defined(credential.login) &&
                <TableRow>
                  <TableData>
                    {_('Userame')}
                  </TableData>
                  <TableData>
                    {credential.login}
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </Table>
        </div>
      );
    }
    return _('verinice Connector');
  }

  return method.type;
};

Method.propTypes = {
  details: PropTypes.bool,
  method: PropTypes.object.isRequired,
};

export default Method;

// vim: set ts=2 sw=2 tw=80:
