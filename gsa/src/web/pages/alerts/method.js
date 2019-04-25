/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {
  EMAIL_NOTICE_ATTACH,
  EMAIL_NOTICE_INCLUDE,
  METHOD_TYPE_ALEMBA_VFIRE,
  METHOD_TYPE_SCP,
  METHOD_TYPE_SEND,
  METHOD_TYPE_SNMP,
  METHOD_TYPE_SYSLOG,
  METHOD_TYPE_EMAIL,
  METHOD_TYPE_START_TASK,
  METHOD_TYPE_HTTP_GET,
  METHOD_TYPE_SOURCEFIRE,
  METHOD_TYPE_VERINICE,
} from 'gmp/models/alert';

import PropTypes from 'web/utils/proptypes';

import DetailsLink from 'web/components/link/detailslink';

import SimpleTable from 'web/components/table/simpletable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const Table = styled(SimpleTable)`
  margin-top: 5px;
  margin-left: 45px;
  width: 100%;
  & td {
    padding: 0;
  }
`;

const Method = ({method, details = false}) => {
  let url = '';
  if (method.type === METHOD_TYPE_ALEMBA_VFIRE) {
    const {data = {}} = method;
    if (details) {
      return (
        <div>
          <div>{_('Alemba vFire')}</div>
          <Table>
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              {isDefined(data.vfire_base_url) &&
                isDefined(data.vfire_base_url.value) && (
                  <TableRow>
                    <TableData>{_('Base URL')}</TableData>
                    <TableData>{data.vfire_base_url.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.vfire_call_description) &&
                isDefined(data.vfire_call_description.value) && (
                  <TableRow>
                    <TableData>{_('Call Description')}</TableData>
                    <TableData>{data.vfire_call_description.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.vfire_call_impact_name) &&
                isDefined(data.vfire_call_impact_name.value) && (
                  <TableRow>
                    <TableData>{_('Impact')}</TableData>
                    <TableData>{data.vfire_call_impact_name.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.vfire_call_partition_name) &&
                isDefined(data.vfire_call_partition_name.value) && (
                  <TableRow>
                    <TableData>{_('Partition')}</TableData>
                    <TableData>
                      {data.vfire_call_partition_name.value}
                    </TableData>
                  </TableRow>
                )}

              {isDefined(data.vfire_call_template_name) &&
                isDefined(data.vfire_call_template_name.value) && (
                  <TableRow>
                    <TableData>{_('Call Template')}</TableData>
                    <TableData>{data.vfire_call_template_name.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.vfire_call_type_name) &&
                isDefined(data.vfire_call_type_name.value) && (
                  <TableRow>
                    <TableData>{_('Call Type')}</TableData>
                    <TableData>{data.vfire_call_type_name.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.vfire_call_urgency_name) &&
                isDefined(data.vfire_call_urgency_name.value) && (
                  <TableRow>
                    <TableData>{_('Urgency')}</TableData>
                    <TableData>{data.vfire_call_urgency_name.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.vfire_client_id) &&
                isDefined(data.vfire_client_id.value) && (
                  <TableRow>
                    <TableData>{_('Alemba Client ID')}</TableData>
                    <TableData>{data.vfire_client_id.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.vfire_session_type) &&
                isDefined(data.vfire_session_type.value) && (
                  <TableRow>
                    <TableData>{_('Session Type')}</TableData>
                    <TableData>{data.vfire_session_type.value}</TableData>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      );
    }
    return _('Alemba vFire');
  }

  if (method.type === METHOD_TYPE_SCP) {
    const {data = {}} = method;
    const {scp_credential = {}} = data;
    const {credential} = scp_credential;

    if (details) {
      return (
        <div>
          <div>{_('SCP')}</div>
          <Table>
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              {isDefined(data.scp_host) && isDefined(data.scp_host.value) && (
                <TableRow>
                  <TableData>{_('Host')}</TableData>
                  <TableData>{data.scp_host.value}</TableData>
                </TableRow>
              )}

              {isDefined(credential) && isDefined(credential.id) && (
                <TableRow>
                  <TableData>{_('Credential')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink id={credential.id} type="credential">
                        {credential.name}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}

              {isDefined(credential) && isDefined(credential.login) && (
                <TableRow>
                  <TableData>{_('Login')}</TableData>
                  <TableData>{credential.login}</TableData>
                </TableRow>
              )}

              {isDefined(data.scp_known_hosts) &&
                isDefined(data.scp_known_hosts.value) && (
                  <TableRow>
                    <TableData>{_('Known Hosts')}</TableData>
                    <TableData>{data.scp_known_hosts.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.scp_path) && isDefined(data.scp_path.value) && (
                <TableRow>
                  <TableData>{_('Path')}</TableData>
                  <TableData>{data.scp_path.value}</TableData>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (isDefined(credential) && isDefined(credential)) {
      url += credential.login;
    } else {
      url += _('(Credential unavailable)');
    }

    url += '@';

    if (isDefined(data.scp_host)) {
      url += data.scp_host.value;
    }
    if (isDefined(data.scp_path)) {
      url += ':' + data.scp_path.value;
    }
    return _('SCP to {{- url}}', {url});
  }

  if (method.type === METHOD_TYPE_SEND) {
    url += method.data.send_host.value + ':' + method.data.send_port.value;
    return _('Send to {{- url}}', {url});
  }

  if (
    method.type === METHOD_TYPE_SYSLOG &&
    method.data.submethod.value === METHOD_TYPE_SNMP
  ) {
    return 'SNMP';
  }

  if (method.type === METHOD_TYPE_SNMP) {
    const {data} = method;
    if (details) {
      return (
        <div>
          <div>{_('SNMP')}</div>
          <Table>
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Agent')}</TableData>
                <TableData>{data.snmp_agent.value}</TableData>
              </TableRow>

              {isDefined(data.snmp_community) &&
                isDefined(data.snmp_community.value) && (
                  <TableRow>
                    <TableData>{_('Community')}</TableData>
                    <TableData>{data.snmp_community.value}</TableData>
                  </TableRow>
                )}

              {isDefined(data.snmp_agent) && isDefined(data.snmp_agent.value) && (
                <TableRow>
                  <TableData>{_('Message {{name}}')}</TableData>
                  <TableData>{data.snmp_message.value}</TableData>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    }
    return _('SNMP to {{agent}}', {agent: data.snmp_agent.value});
  }

  if (method.type === METHOD_TYPE_EMAIL && isDefined(method.data.to_address)) {
    const {data} = method;
    // TODO improve email content info. the info depends on the event type :-/
    if (details) {
      return (
        <div>
          <div>{_('Email')}</div>
          <Table>
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('To address')}</TableData>
                <TableData>{data.to_address.value}</TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('From address')}</TableData>
                <TableData>{data.from_address.value}</TableData>
              </TableRow>

              {details && isDefined(data.recipient_credential) && (
                <TableRow>
                  <TableData>{_('Email Encryption')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        id={data.recipient_credential.value}
                        type="credential"
                      >
                        {_('Credential')}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}

              {details &&
                isDefined(data.notice) &&
                isDefined(data.notice.value) && (
                  <TableRow>
                    <TableData>{_('Content')}</TableData>
                    <TableData>
                      {data.notice.value === EMAIL_NOTICE_INCLUDE
                        ? _('Include Content')
                        : data.notice.value === EMAIL_NOTICE_ATTACH
                        ? _('Attach Content')
                        : _('Simple Notice')}
                    </TableData>
                  </TableRow>
                )}

              {details &&
                isDefined(data.subject) &&
                isDefined(data.subject.value) && (
                  <TableRow>
                    <TableData>{_('Subject')}</TableData>
                    <TableData>{data.subject.value}</TableData>
                  </TableRow>
                )}

              {details &&
                isDefined(data.message) &&
                isDefined(data.message.value) && (
                  <TableRow>
                    <TableData>{_('Message')}</TableData>
                    <TableData>{data.message.value}</TableData>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      );
    }
    return isDefined(data.recipient_credential)
      ? _('Encrypted Email to {{address}}', {address: data.to_address.value})
      : _('Email to {{address}}', {address: data.to_address.value});
  }

  if (method.type === METHOD_TYPE_START_TASK) {
    // FIXME task name ist missing
    // in xslt the tasks have been added to the response
    // we should improve the backend to return the name for the task id here too
    return _('Start Task');
  }

  if (method.type === METHOD_TYPE_HTTP_GET) {
    const {data = {}} = method;

    if (isDefined(data.URL) && isDefined(data.URL.value)) {
      return _('HTTP GET request to URL {{- url}}', {url: data.URL.value});
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
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              {isDefined(data.defense_center_ip) &&
                isDefined(data.defense_center_ip.value) && (
                  <TableRow>
                    <TableData>{_('Defense Center IP')}</TableData>
                    <TableData>{data.defense_center_ip.value}</TableData>
                  </TableRow>
                )}
              {isDefined(data.defense_center_port) &&
                isDefined(data.defense_center_port.value) && (
                  <TableRow>
                    <TableData>{_('Defense Center Port')}</TableData>
                    <TableData>{data.defense_center_port.value}</TableData>
                  </TableRow>
                )}
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
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              {isDefined(data.verinice_server_url) &&
                isDefined(data.verinice_server_url.value) && (
                  <TableRow>
                    <TableData>{_('URL')}</TableData>
                    <TableData>{data.verinice_server_url.value}</TableData>
                  </TableRow>
                )}

              {isDefined(credential) && isDefined(credential.id) && (
                <TableRow>
                  <TableData>{_('Credential')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink id={credential.id} type="credential">
                        {credential.name}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}

              {isDefined(credential) && isDefined(credential.login) && (
                <TableRow>
                  <TableData>{_('Username')}</TableData>
                  <TableData>{credential.login}</TableData>
                </TableRow>
              )}
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
