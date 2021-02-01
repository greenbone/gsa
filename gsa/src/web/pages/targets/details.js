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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';
import HorizontalSep from 'web/components/layout/horizontalsep';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';
import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

const MAX_HOSTS_LISTINGS = 70;

const TargetDetails = ({capabilities, entity, links = true}) => {
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

  const hostsListing = hosts
    .slice(0, MAX_HOSTS_LISTINGS)
    .map(host => <span key={host}>{host}</span>);

  const excludeHostsListing = exclude_hosts
    .slice(0, MAX_HOSTS_LISTINGS)
    .map(host => <span key={host}>{host}</span>);

  return (
    <Layout grow="1" flex="column">
      <DetailsBlock title={_('Hosts')}>
        <InfoTable size="full">
          <colgroup>
            <Col width="15%" />
            <Col width="85%" />
          </colgroup>
          <TableBody>
            <TableRow>
              <TableDataAlignTop>{_('Included')}</TableDataAlignTop>
              <TableData>
                <HorizontalSep separator="," wrap spacing="0">
                  {hostsListing}
                  {hosts.length > MAX_HOSTS_LISTINGS && '[...]'}
                </HorizontalSep>
              </TableData>
            </TableRow>

            {exclude_hosts.length > 0 && (
              <TableRow>
                <TableDataAlignTop>{_('Excluded')}</TableDataAlignTop>
                <TableData>
                  <HorizontalSep separator="," wrap spacing="0">
                    {excludeHostsListing}
                    {exclude_hosts.length > MAX_HOSTS_LISTINGS && '[...]'}
                  </HorizontalSep>
                </TableData>
              </TableRow>
            )}

            <TableRow>
              <TableData>{_('Maximum Number of Hosts')}</TableData>
              <TableData>{max_hosts}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Reverse Lookup Only')}</TableData>
              <TableData>{renderYesNo(reverse_lookup_only)}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Reverse Lookup Unify')}</TableData>
              <TableData>{renderYesNo(reverse_lookup_unify)}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Alive Test')}</TableData>
              <TableData>{alive_tests}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Port List')}</TableData>
              <TableData>
                <span>
                  <DetailsLink id={port_list.id} type="portlist">
                    {port_list.name}
                  </DetailsLink>
                </span>
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {capabilities.mayAccess('credentials') &&
        (isDefined(ssh_credential) ||
          isDefined(snmp_credential) ||
          isDefined(smb_credential) ||
          isDefined(esxi_credential)) && (
          <DetailsBlock title={_('Credentials')}>
            <InfoTable>
              <TableBody>
                {isDefined(ssh_credential) && (
                  <TableRow>
                    <TableData>{_('SSH')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={ssh_credential.id} type="credential">
                          {ssh_credential.name}
                        </DetailsLink>
                      </span>
                      {_(' on Port {{port}}', {port: ssh_credential.port})}
                    </TableData>
                  </TableRow>
                )}

                {isDefined(smb_credential) && (
                  <TableRow>
                    <TableData>{_('SMB')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={smb_credential.id} type="credential">
                          {smb_credential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}

                {isDefined(esxi_credential) && (
                  <TableRow>
                    <TableData>{_('ESXi')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={esxi_credential.id} type="credential">
                          {esxi_credential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}

                {isDefined(snmp_credential) && (
                  <TableRow>
                    <TableData>{_('SNMP')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={snmp_credential.id} type="credential">
                          {snmp_credential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}
              </TableBody>
            </InfoTable>
          </DetailsBlock>
        )}
      {isDefined(tasks) && tasks.length > 0 && (
        <DetailsBlock
          title={_('Tasks using this Target ({{count}})', {
            count: tasks.length,
          })}
        >
          <HorizontalSep>
            {tasks.map(task => (
              <span key={task.id}>
                <DetailsLink id={task.id} type="task">
                  {task.name}
                </DetailsLink>
              </span>
            ))}
          </HorizontalSep>
        </DetailsBlock>
      )}
    </Layout>
  );
};

TargetDetails.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default withCapabilities(TargetDetails);

// vim: set ts=2 sw=2 tw=80:
