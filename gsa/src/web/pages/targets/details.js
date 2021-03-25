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

import {hasValue} from 'gmp/utils/identity';

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
    aliveTests,
    esxiCredential,
    excludeHosts,
    hosts,
    maxHosts,
    portList,
    reverseLookupOnly,
    reverseLookupUnify,
    smbCredential,
    snmpCredential,
    sshCredential,
    tasks,
    allowSimultaneousIPs,
  } = entity;

  const hostsListing = hosts
    .slice(0, MAX_HOSTS_LISTINGS)
    .map(host => <span key={host}>{host}</span>);

  const excludeHostsListing = excludeHosts
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

            {excludeHosts.length > 0 && (
              <TableRow>
                <TableDataAlignTop>{_('Excluded')}</TableDataAlignTop>
                <TableData>
                  <HorizontalSep separator="," wrap spacing="0">
                    {excludeHostsListing}
                    {excludeHosts.length > MAX_HOSTS_LISTINGS && '[...]'}
                  </HorizontalSep>
                </TableData>
              </TableRow>
            )}

            <TableRow>
              <TableData>{_('Maximum Number of Hosts')}</TableData>
              <TableData>{maxHosts}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Allow scan of simultaneous IPs')}</TableData>
              <TableData>{renderYesNo(allowSimultaneousIPs)}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Reverse Lookup Only')}</TableData>
              <TableData>{renderYesNo(reverseLookupOnly)}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Reverse Lookup Unify')}</TableData>
              <TableData>{renderYesNo(reverseLookupUnify)}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Alive Test')}</TableData>
              <TableData>{aliveTests}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Port List')}</TableData>
              <TableData>
                <span>
                  <DetailsLink id={portList.id} type="portlist">
                    {portList.name}
                  </DetailsLink>
                </span>
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {capabilities.mayAccess('credentials') && // querying for a nonexistent credential will always lead to the credential being defined, BUT the name and id being null
        (hasValue(sshCredential?.id) ||
          hasValue(snmpCredential?.id) ||
          hasValue(smbCredential?.id) ||
          hasValue(esxiCredential?.id)) && (
          <DetailsBlock title={_('Credentials')}>
            <InfoTable>
              <TableBody>
                {hasValue(sshCredential?.id) && (
                  <TableRow>
                    <TableData>{_('SSH')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={sshCredential.id} type="credential">
                          {sshCredential.name}
                        </DetailsLink>
                      </span>
                      {_(' on Port {{port}}', {port: sshCredential.port})}
                    </TableData>
                  </TableRow>
                )}

                {hasValue(smbCredential?.id) && (
                  <TableRow>
                    <TableData>{_('SMB')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={smbCredential.id} type="credential">
                          {smbCredential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}

                {hasValue(esxiCredential?.id) && (
                  <TableRow>
                    <TableData>{_('ESXi')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={esxiCredential.id} type="credential">
                          {esxiCredential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}

                {hasValue(snmpCredential?.id) && (
                  <TableRow>
                    <TableData>{_('SNMP')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={snmpCredential.id} type="credential">
                          {snmpCredential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}
              </TableBody>
            </InfoTable>
          </DetailsBlock>
        )}
      {hasValue(tasks) && tasks.length > 0 && (
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
