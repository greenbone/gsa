/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {
  EMAIL_NOTICE_ATTACH,
  EMAIL_NOTICE_INCLUDE,
  METHOD_TYPE_ALEMBA_VFIRE,
  METHOD_TYPE_SCP,
  METHOD_TYPE_SEND,
  METHOD_TYPE_SMB,
  METHOD_TYPE_SNMP,
  METHOD_TYPE_SYSLOG,
  METHOD_TYPE_EMAIL,
  METHOD_TYPE_START_TASK,
  METHOD_TYPE_HTTP_GET,
  METHOD_TYPE_SOURCEFIRE,
  METHOD_TYPE_TIPPING_POINT,
  METHOD_TYPE_VERINICE,
} from 'gmp/models/alert';

import {hasValue} from 'gmp/utils/identity';

import HorizontalSep from 'web/components/layout/horizontalsep';

import DetailsLink from 'web/components/link/detailslink';

import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import SimpleTable from 'web/components/table/simpletable';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

const Table = styled(SimpleTable)`
  margin-top: 5px;
  margin-left: 45px;
  & td {
    padding: 0;
  }
`;

const Pre = styled.pre`
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const Method = ({method = {}, details = false, reportFormats = []}) => {
  if (!hasValue(method.type)) {
    return null;
  }

  const getReportFormatName = id => {
    const reportFormat = reportFormats.find(format => format.id === id);
    if (hasValue(reportFormat)) {
      return reportFormat.name;
    }
    return null;
  };
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
              {hasValue(data.vfire_base_url) &&
                hasValue(data.vfire_base_url.value) && (
                  <TableRow>
                    <TableData>{_('Base URL')}</TableData>
                    <TableData>{data.vfire_base_url.value}</TableData>
                  </TableRow>
                )}
              {hasValue(data.vfire_call_impact_name) &&
                hasValue(data.vfire_call_impact_name.value) && (
                  <TableRow>
                    <TableData>{_('Impact')}</TableData>
                    <TableData>{data.vfire_call_impact_name.value}</TableData>
                  </TableRow>
                )}

              {hasValue(data.vfire_call_partition_name) &&
                hasValue(data.vfire_call_partition_name.value) && (
                  <TableRow>
                    <TableData>{_('Partition')}</TableData>
                    <TableData>
                      {data.vfire_call_partition_name.value}
                    </TableData>
                  </TableRow>
                )}

              {hasValue(data.vfire_call_template_name) &&
                hasValue(data.vfire_call_template_name.value) && (
                  <TableRow>
                    <TableData>{_('Call Template')}</TableData>
                    <TableData>{data.vfire_call_template_name.value}</TableData>
                  </TableRow>
                )}

              {hasValue(data.vfire_call_type_name) &&
                hasValue(data.vfire_call_type_name.value) && (
                  <TableRow>
                    <TableData>{_('Call Type')}</TableData>
                    <TableData>{data.vfire_call_type_name.value}</TableData>
                  </TableRow>
                )}

              {hasValue(data.vfire_call_urgency_name) &&
                hasValue(data.vfire_call_urgency_name.value) && (
                  <TableRow>
                    <TableData>{_('Urgency')}</TableData>
                    <TableData>{data.vfire_call_urgency_name.value}</TableData>
                  </TableRow>
                )}

              {hasValue(data.vfire_client_id) &&
                hasValue(data.vfire_client_id.value) && (
                  <TableRow>
                    <TableData>{_('Alemba Client ID')}</TableData>
                    <TableData>{data.vfire_client_id.value}</TableData>
                  </TableRow>
                )}

              {hasValue(data.vfire_session_type) &&
                hasValue(data.vfire_session_type.value) && (
                  <TableRow>
                    <TableData>{_('Session Type')}</TableData>
                    <TableData>{data.vfire_session_type.value}</TableData>
                  </TableRow>
                )}

              {hasValue(data.report_formats) && (
                <TableRow>
                  <TableData>{_('Report Formats')}</TableData>
                  <TableData>
                    <HorizontalSep separator="," wrap spacing="0">
                      {data.report_formats.map(id => (
                        <span key={id}>{getReportFormatName(id)}</span>
                      ))}
                    </HorizontalSep>
                  </TableData>
                </TableRow>
              )}
              {hasValue(data.vfire_call_description) &&
                hasValue(data.vfire_call_description.value) && (
                  <TableRow>
                    <TableData>{_('Call Description')}</TableData>
                    <TableData>
                      <Pre>{data.vfire_call_description.value}</Pre>
                    </TableData>
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
              {hasValue(data.scp_host) && hasValue(data.scp_host.value) && (
                <TableRow>
                  <TableData>{_('Host')}</TableData>
                  <TableData>{data.scp_host.value}</TableData>
                </TableRow>
              )}

              {hasValue(credential) && hasValue(credential.id) && (
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

              {hasValue(credential) && hasValue(credential.login) && (
                <TableRow>
                  <TableData>{_('Login')}</TableData>
                  <TableData>{credential.login}</TableData>
                </TableRow>
              )}

              {hasValue(data.scp_known_hosts) &&
                hasValue(data.scp_known_hosts.value) && (
                  <TableRow>
                    <TableData>{_('Known Hosts')}</TableData>
                    <TableData>{data.scp_known_hosts.value}</TableData>
                  </TableRow>
                )}

              {hasValue(data.scp_path) && hasValue(data.scp_path.value) && (
                <TableRow>
                  <TableData>{_('Path')}</TableData>
                  <TableData>{data.scp_path.value}</TableData>
                </TableRow>
              )}

              {hasValue(data.scp_report_format) &&
                hasValue(data.scp_report_format.value) && (
                  <TableRow>
                    <TableData>{_('Report Format')}</TableData>
                    <TableData>
                      {getReportFormatName(data.scp_report_format.value)}
                    </TableData>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (hasValue(credential)) {
      url += credential.login;
    } else {
      url += _('(Credential unavailable)');
    }

    url += '@';

    if (hasValue(data.scp_host)) {
      url += data.scp_host.value;
    }
    if (hasValue(data.scp_path)) {
      url += ':' + data.scp_path.value;
    }
    return _('SCP to {{- url}}', {url});
  }

  if (method.type === METHOD_TYPE_SMB) {
    const {data = {}} = method;
    if (details) {
      return (
        <div>
          <div>{_('SMB')}</div>
          <Table>
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              {hasValue(data.smb_credential) && (
                <TableRow>
                  <TableData>{_('Credential')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        id={data.smb_credential.value}
                        type="credential"
                      >
                        {_('Credential')}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}
              {hasValue(data.smb_share_path) &&
                hasValue(data.smb_share_path.value) && (
                  <TableRow>
                    <TableData>{_('Share path')}</TableData>
                    <TableData>{data.smb_share_path.value}</TableData>
                  </TableRow>
                )}
              {hasValue(data.smb_file_path) &&
                hasValue(data.smb_file_path.value) && (
                  <TableRow>
                    <TableData>{_('File path')}</TableData>
                    <TableData>{data.smb_file_path.value}</TableData>
                  </TableRow>
                )}
              {hasValue(data.smb_report_format) &&
                hasValue(data.smb_report_format.value) && (
                  <TableRow>
                    <TableData>{_('Report Format')}</TableData>
                    <TableData>
                      {getReportFormatName(data.smb_report_format.value)}
                    </TableData>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      );
    }
  }

  if (method.type === METHOD_TYPE_SEND) {
    // need to make this prettier
    const {data = {}} = method;
    url += data.send_host.value + ':' + data.send_port.value;
    return (
      <div>
        <div>{_('Send to {{- url}}', {url})}</div>
        <Table>
          <colgroup>
            <Col width="12%" />
            <Col width="88%" />
          </colgroup>
          <TableBody>
            {details &&
              hasValue(data.send_report_format) &&
              hasValue(data.send_report_format.value) && (
                <TableRow>
                  <TableData>{_('Report Format')}</TableData>
                  <TableData>
                    {getReportFormatName(data.send_report_format.value)}
                  </TableData>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (
    method.type === METHOD_TYPE_SYSLOG &&
    method.data.submethod.value === METHOD_TYPE_SNMP
  ) {
    return 'SNMP';
  }

  if (method.type === METHOD_TYPE_SNMP) {
    const {data = {}} = method;
    const {snmp_agent = {}} = data;
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
                <TableData>{snmp_agent.value}</TableData>
              </TableRow>

              {hasValue(data.snmp_community) &&
                hasValue(data.snmp_community.value) && (
                  <TableRow>
                    <TableData>{_('Community')}</TableData>
                    <TableData>{data.snmp_community.value}</TableData>
                  </TableRow>
                )}

              {hasValue(snmp_agent.value) && (
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
    return _('SNMP to {{agent}}', {agent: snmp_agent.value});
  }

  if (method.type === METHOD_TYPE_EMAIL && hasValue(method.data.to_address)) {
    const {data = {}} = method;
    const {to_address = {}, from_address = {}} = data;
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
                <TableData>{to_address.value}</TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('From address')}</TableData>
                <TableData>{from_address.value}</TableData>
              </TableRow>

              {details && hasValue(data.recipient_credential) && (
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

              {details && hasValue(data.notice) && hasValue(data.notice.value) && (
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
                hasValue(data.notice_report_format) &&
                hasValue(data.notice_report_format.value) && (
                  <TableRow>
                    <TableData>{_('Report Format')}</TableData>
                    <TableData>
                      {getReportFormatName(data.notice_report_format.value)}
                    </TableData>
                  </TableRow>
                )}

              {details &&
                hasValue(data.notice_attach_format) &&
                hasValue(data.notice_attach_format.value) && (
                  <TableRow>
                    <TableData>{_('Report Format')}</TableData>
                    <TableData>
                      {getReportFormatName(data.notice_attach_format.value)}
                    </TableData>
                  </TableRow>
                )}

              {details &&
                hasValue(data.subject) &&
                hasValue(data.subject.value) && (
                  <TableRow>
                    <TableData>{_('Subject')}</TableData>
                    <TableData>{data.subject.value}</TableData>
                  </TableRow>
                )}

              {details &&
                hasValue(data.message) &&
                hasValue(data.message.value) && (
                  <TableRow>
                    <TableData>{_('Message')}</TableData>
                    <TableData>
                      <Pre>{data.message.value}</Pre>
                    </TableData>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      );
    }
    return hasValue(data.recipient_credential)
      ? _('Encrypted Email to {{address}}', {address: data.to_address.value})
      : _('Email to {{address}}', {address: data.to_address.value});
  }

  if (method.type === METHOD_TYPE_START_TASK) {
    // FIXME task name is missing
    // in xslt the tasks have been added to the response
    // we should improve the backend to return the name for the task id here too
    return _('Start Task');
  }

  if (method.type === METHOD_TYPE_HTTP_GET) {
    const {data = {}} = method;

    if (hasValue(data.URL) && hasValue(data.URL.value)) {
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
              {hasValue(data.defense_center_ip) &&
                hasValue(data.defense_center_ip.value) && (
                  <TableRow>
                    <TableData>{_('Defense Center IP')}</TableData>
                    <TableData>{data.defense_center_ip.value}</TableData>
                  </TableRow>
                )}
              {hasValue(data.defense_center_port) &&
                hasValue(data.defense_center_port.value) && (
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
      return (
        <div>
          <div>{_('verinice Connector')}</div>
          <Table>
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              {hasValue(data.verinice_server_url) &&
                hasValue(data.verinice_server_url.value) && (
                  <TableRow>
                    <TableData>{_('URL')}</TableData>
                    <TableData>{data.verinice_server_url.value}</TableData>
                  </TableRow>
                )}

              {hasValue(credential) && hasValue(credential.id) && (
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

              {hasValue(credential) && hasValue(credential.login) && (
                <TableRow>
                  <TableData>{_('Username')}</TableData>
                  <TableData>{credential.login}</TableData>
                </TableRow>
              )}

              {hasValue(data.verinice_server_report_format) &&
                hasValue(data.verinice_server_report_format.value) && (
                  <TableRow>
                    <TableData>{_('verinice.PRO Report')}</TableData>
                    <TableData>
                      {getReportFormatName(
                        data.verinice_server_report_format.value,
                      )}
                    </TableData>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      );
    }
    return _('verinice Connector');
  }

  if (method.type === METHOD_TYPE_TIPPING_POINT) {
    // data.tp_sms_credential has no name, only id!
    const {data = {}} = method;
    if (details) {
      return (
        <div>
          <div>{_('TippingPoint SMS')}</div>
          <Table>
            <colgroup>
              <Col width="12%" />
              <Col width="88%" />
            </colgroup>
            <TableBody>
              {hasValue(data.tp_sms_hostname) &&
                hasValue(data.tp_sms_hostname.value) && (
                  <TableRow>
                    <TableData>{_('Hostname / IP')}</TableData>
                    <TableData>{data.tp_sms_hostname.value}</TableData>
                  </TableRow>
                )}
              {hasValue(data.tp_sms_tls_workaround) &&
                hasValue(data.tp_sms_tls_workaround.value) && (
                  <TableRow>
                    <TableData>
                      {_('Use workaround for default certificate')}
                    </TableData>
                    <TableData>
                      {data.tp_sms_tls_workaround.value === 1 ? 'Yes' : 'No'}
                    </TableData>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      );
    }
    return _('TippingPoint SMS');
  }

  return method.type;
};

Method.propTypes = {
  details: PropTypes.bool,
  method: PropTypes.object.isRequired,
  reportFormats: PropTypes.array,
};

export default Method;

// vim: set ts=2 sw=2 tw=80:
