/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Target from 'gmp/models/target';
import {isDefined} from 'gmp/utils/identity';
import TagListDisplay from 'web/components/form/TagListDisplay';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableData, {TableDataAlignTop} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/Block';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import TargetDetailsColGroup from 'web/pages/targets/TargetDetailsColGroup';
import {renderYesNo} from 'web/utils/Render';

interface TargetDetailsProps {
  entity: Target;
}

const MAX_HOSTS_LISTINGS = 70;

const TargetDetails = ({entity}: TargetDetailsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
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
    sshElevateCredential,
    krb5Credential,
    tasks,
    allowSimultaneousIPs,
  } = entity;

  const gmp = useGmp();

  const hostsListing = hosts
    .slice(0, MAX_HOSTS_LISTINGS)
    .map(host => <span key={host}>{host}</span>);

  const excludeHostsListing = excludeHosts
    .slice(0, MAX_HOSTS_LISTINGS)
    .map(host => <span key={host}>{host}</span>);

  return (
    <Layout flex="column" grow="1">
      <DetailsBlock title={_('Hosts')}>
        <InfoTable size="full">
          <TargetDetailsColGroup />
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

            {excludeHosts.length > 0 && (
              <TableRow>
                <TableDataAlignTop>{_('Excluded')}</TableDataAlignTop>
                <TableData>
                  <HorizontalSep $wrap $separator="," $spacing="0">
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
              <TableData>
                {_('Allow simultaneous scanning via multiple IPs')}
              </TableData>
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
              <TableData>
                <TagListDisplay color="gray" values={aliveTests} />
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Port List')}</TableData>
              <TableData>
                <span>
                  <DetailsLink id={portList?.id as string} type="portlist">
                    {portList?.name}
                  </DetailsLink>
                </span>
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>
      {capabilities.mayAccess('credential') &&
        (isDefined(sshCredential) ||
          isDefined(snmpCredential) ||
          isDefined(smbCredential) ||
          isDefined(esxiCredential) ||
          (gmp.settings.enableKrb5 && isDefined(krb5Credential))) && (
          <DetailsBlock title={_('Credentials')}>
            <InfoTable size="full">
              <TargetDetailsColGroup />
              <TableBody>
                {isDefined(sshCredential) && (
                  <TableRow>
                    <TableData>{_('SSH')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink
                          id={sshCredential.id as string}
                          type="credential"
                        >
                          {sshCredential.name}
                        </DetailsLink>
                      </span>
                      {_(' on Port {{port}}', {
                        port: String(sshCredential.port ?? ''),
                      })}
                    </TableData>
                  </TableRow>
                )}

                {isDefined(sshCredential) &&
                  isDefined(sshElevateCredential) && ( // Skip one column, because there is no way to fit a variation of the word "elevate" without leaving lots of white space on other rows
                    <TableRow>
                      <TableData>{''}</TableData>
                      <TableData>
                        <span>
                          {_('SSH elevate credential ')}
                          <DetailsLink
                            id={sshElevateCredential.id as string}
                            type="credential"
                          >
                            {sshElevateCredential.name}
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
                        <DetailsLink
                          id={krb5Credential.id as string}
                          type="credential"
                        >
                          {krb5Credential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}

                {isDefined(smbCredential) && (
                  <TableRow>
                    <TableData>{_('SMB (NTLM)')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink
                          id={smbCredential.id as string}
                          type="credential"
                        >
                          {smbCredential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}

                {isDefined(esxiCredential) && (
                  <TableRow>
                    <TableData>{_('ESXi')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink
                          id={esxiCredential.id as string}
                          type="credential"
                        >
                          {esxiCredential.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                  </TableRow>
                )}

                {isDefined(snmpCredential) && (
                  <TableRow>
                    <TableData>{_('SNMP')}</TableData>
                    <TableData>
                      <span>
                        <DetailsLink
                          id={snmpCredential.id as string}
                          type="credential"
                        >
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
                  <DetailsLink id={task.id as string} type="task">
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

export default TargetDetails;
