/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData, {TableDataAlignTop} from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import DetailsBlock from 'web/entity/Block';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import withCapabilities from 'web/utils/withCapabilities';

const MAX_HOSTS_LISTINGS = 70;

const TargetDetails = ({capabilities, entity}) => {
  const [_] = useTranslation();
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
    ssh_elevate_credential,
    krb5_credential: krb5Credential,
    tasks,
    allowSimultaneousIPs,
  } = entity;

  const gmp = useGmp();

  const hostsListing = hosts
    .slice(0, MAX_HOSTS_LISTINGS)
    .map(host => <span key={host}>{host}</span>);

  const excludeHostsListing = exclude_hosts
    .slice(0, MAX_HOSTS_LISTINGS)
    .map(host => <span key={host}>{host}</span>);

  return (
    <Layout flex="column" grow="1">
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
                <HorizontalSep $wrap $separator="," $spacing="0">
                  {hostsListing}
                  {hosts.length > MAX_HOSTS_LISTINGS && '[...]'}
                </HorizontalSep>
              </TableData>
            </TableRow>

            {exclude_hosts.length > 0 && (
              <TableRow>
                <TableDataAlignTop>{_('Excluded')}</TableDataAlignTop>
                <TableData>
                  <HorizontalSep $wrap $separator="," $spacing="0">
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
              <TableData>
                {_('Allow simultaneous scanning via multiple IPs')}
              </TableData>
              <TableData>{renderYesNo(allowSimultaneousIPs)}</TableData>
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
          isDefined(esxi_credential) ||
          (gmp.settings.enableKrb5 && isDefined(krb5Credential))) && (
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

                {isDefined(ssh_credential) &&
                  isDefined(ssh_elevate_credential) && ( // Skip one column, because there is no way to fit a variation of the word "elevate" without leaving lots of white space on other rows
                    <TableRow>
                      <TableData>{''}</TableData>
                      <TableData>
                        <span>
                          {_('SSH elevate credential ')}
                          <DetailsLink
                            id={ssh_elevate_credential.id}
                            type="credential"
                          >
                            {ssh_elevate_credential.name}
                          </DetailsLink>
                        </span>
                      </TableData>
                    </TableRow>
                  )}

                {gmp.settings.enableKrb5 && isDefined(krb5Credential) && (
                  <TableRow>
                    <TableData>{_('SMB (Kerberos)')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink id={krb5Credential.id} type="credential">
                          {krb5Credential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}

                {isDefined(smb_credential) && (
                  <TableRow>
                    <TableData>{_('SMB (NTLM)')}</TableData>
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
            {tasks.map(task => {
              return (
                <span key={task.id}>
                  <DetailsLink id={task.id} type="task">
                    {task.name}
                  </DetailsLink>
                </span>
              );
            })}
          </HorizontalSep>
        </DetailsBlock>
      )}
    </Layout>
  );
};

TargetDetails.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
};

export default withCapabilities(TargetDetails);
