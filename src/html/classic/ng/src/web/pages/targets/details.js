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

import {Col} from 'glamorous';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_yesno} from '../../utils/render.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import DetailsBlock from '../../entity/block.js';

const TargetDetails = ({
  entity,
  links = true,
}, {capabilities}) => {
  const {
    alive_tests,
    esxi_credential,
    exclude_hosts,
    hosts,
    max_hosts,
    port_list,
    reverse_lookup_only,
    reverse_lookup_unify,
    smb_credential,
    snmp_credential,
    ssh_credential,
    tasks,
  } = entity;
  return (
    <Layout
      grow="1"
      flex="column">

      <DetailsBlock
        title={_('Hosts')}>
        <InfoTable size="full">
          <colgroup>
            <Col width="20%"/>
            <Col width="80%"/>
          </colgroup>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Included')}
              </TableData>
              <TableData>
                <Divider flex wrap>
                  {hosts.map(host => (
                    <span key={host}>{host}</span>
                  ))}
                </Divider>
              </TableData>
            </TableRow>

            {exclude_hosts.length > 0 &&
              <TableRow>
                <TableData>
                  {_('Excluded')}
                </TableData>
                <TableData>
                  <Divider>
                    {exclude_hosts.map(host => (
                      <span key={host}>{host}</span>
                    ))}
                  </Divider>
                </TableData>
              </TableRow>
            }

            <TableRow>
              <TableData>
                {_('Maximum Number of Hosts')}
              </TableData>
              <TableData>
                {max_hosts}
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>
                {_('Reverse Lookup Only')}
              </TableData>
              <TableData>
                {render_yesno(reverse_lookup_only)}
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>
                {_('Reverse Lookup Unify')}
              </TableData>
              <TableData>
                {render_yesno(reverse_lookup_unify)}
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>
                {_('Alive Test')}
              </TableData>
              <TableData>
                {alive_tests}
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>
                {_('Port List')}
              </TableData>
              <TableData>
                <DetailsLink
                  legacy
                  id={port_list.id}
                  type="port_list">
                  {port_list.name}
                </DetailsLink>
              </TableData>
            </TableRow>

          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {capabilities.mayAccess('credentials') && (is_defined(ssh_credential) ||
        is_defined(snmp_credential) || is_defined(smb_credential) ||
        is_defined(esxi_credential)) &&
        <DetailsBlock
          title={_('Credentials')}>
          <InfoTable>
            <TableBody>
              {is_defined(ssh_credential) &&
                <TableRow>
                  <TableData>
                    {_('SSH')}
                  </TableData>
                  <TableData>
                    <DetailsLink
                      legacy
                      id={ssh_credential.id}
                      type="credential">
                      {ssh_credential.name}
                    </DetailsLink>
                    {_(' on Port {{port}}', {port: ssh_credential.port})}
                  </TableData>
                </TableRow>
              }

              {is_defined(smb_credential) &&
                <TableRow>
                  <TableData>
                    {_('SMB')}
                  </TableData>
                  <TableData>
                    <DetailsLink
                      legacy
                      id={smb_credential.id}
                      type="credential">
                      {smb_credential.name}
                    </DetailsLink>
                  </TableData>
                </TableRow>
              }

              {is_defined(esxi_credential) &&
                <TableRow>
                  <TableData>
                    {_('ESXi')}
                  </TableData>
                  <TableData>
                    <DetailsLink
                      legacy
                      id={esxi_credential.id}
                      type="credential">
                      {esxi_credential.name}
                    </DetailsLink>
                  </TableData>
                </TableRow>
              }

              {is_defined(snmp_credential) &&
                <TableRow>
                  <TableData>
                    {_('SNMP')}
                  </TableData>
                  <TableData>
                    <DetailsLink
                      legacy
                      id={snmp_credential.id}
                      type="credential">
                      {snmp_credential.name}
                    </DetailsLink>
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }
      {is_defined(tasks) && tasks.length > 0 &&
        <DetailsBlock
          title={_('Tasks using this Target ({{count}})',
            {count: tasks.length})}
        >
          <Divider>
            {tasks.map(task => (
              <DetailsLink
                key={task.id}
                id={task.id}
                type="task">
                {task.name}
              </DetailsLink>
            ))}
          </Divider>
        </DetailsBlock>
      }
    </Layout>
  );
};

TargetDetails.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

TargetDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default TargetDetails;

// vim: set ts=2 sw=2 tw=80:
