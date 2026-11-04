/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentGroup from 'gmp/models/agent-group';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsTable from 'web/components/table/DetailsTable';
import TableBody from 'web/components/table/TableBody';
import TableData, {TableDataAlignTop} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/DetailsBlock';
import useTranslation from 'web/hooks/useTranslation';

interface AgentGroupDetailsProps {
  entity: AgentGroup;
}

const AgentGroupDetails = ({entity}: AgentGroupDetailsProps) => {
  const [_] = useTranslation();

  return (
    <Layout flex="column" grow="1">
      <DetailsBlock title={_('Agent Group')}>
        <DetailsTable>
          <TableBody>
            <TableRow>
              <TableData>{_('Name')}</TableData>
              <TableData>{entity.name}</TableData>
            </TableRow>
            <TableRow>
              <TableData>{_('Comment')}</TableData>
              <TableData>{entity.comment}</TableData>
            </TableRow>
            <TableRow>
              <TableDataAlignTop>{_('Agents')}</TableDataAlignTop>
              <TableData>
                {entity.agents.length > 0 ? (
                  <HorizontalSep $wrap $separator="," $spacing="0">
                    {entity.agents.map(agent => (
                      <span key={agent.id}>{agent.name}</span>
                    ))}
                  </HorizontalSep>
                ) : (
                  <i>{_('None')}</i>
                )}
              </TableData>
            </TableRow>
          </TableBody>
        </DetailsTable>
      </DetailsBlock>
      <DetailsBlock title={_('Scheduler Options')}>
        <DetailsTable>
          <TableBody>
            <TableRow>
              <TableData>{_('Cron expression')}</TableData>
              <TableData>{entity.schedulerCronTime}</TableData>
            </TableRow>
            <TableRow>
              <TableData>{_('Max delay (seconds)')}</TableData>
              <TableData>{entity.maxDelaySeconds}</TableData>
            </TableRow>
          </TableBody>
        </DetailsTable>
      </DetailsBlock>
    </Layout>
  );
};

export default AgentGroupDetails;
