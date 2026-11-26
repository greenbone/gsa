/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {
  type DirectoryComputer,
  type DirectoryTarget,
} from 'gmp/models/active-directory';
import {isDefined} from 'gmp/utils/identity';
import Column from 'web/components/layout/Column';
import DetailsLink from 'web/components/link/DetailsLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import {TableDataAlignTop as TableData} from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import {DirectoryDetailsSection} from 'web/pages/active-directory/DirectoryLayout';

const RelationshipTable = styled(InfoTable)`
  th,
  td {
    overflow-wrap: anywhere;
  }

  && th {
    color: var(--mantine-color-text);
  }

  [data-mantine-color-scheme='dark'] & a {
    color: var(--mantine-color-anchor);
  }

  tbody + tbody > tr:first-child > td {
    border-top: 1px solid var(--mantine-color-default-border);
  }
`;

const TargetStatusCell = ({
  target,
  rowSpan = 1,
}: {
  target: DirectoryTarget;
  rowSpan?: number;
}) => {
  return (
    <TableData rowSpan={rowSpan}>
      <DetailsLink id={target.id} type="target">
        {target.name}
      </DetailsLink>
    </TableData>
  );
};

const TargetRelationshipRows = ({target}: {target: DirectoryTarget}) => {
  const [_] = useTranslation();
  if (!isDefined(target.tasks)) {
    return (
      <TableRow>
        <TargetStatusCell target={target} />
        <TableData colSpan={2}>{_('Task information unavailable')}</TableData>
      </TableRow>
    );
  }

  if (target.tasks.length === 0) {
    return (
      <TableRow>
        <TargetStatusCell target={target} />
        <TableData colSpan={2}>{_('No readable tasks assigned')}</TableData>
      </TableRow>
    );
  }

  const tasks = target.tasks;
  return tasks.map((task, index) => (
    <TableRow key={task.id}>
      {index === 0 && (
        <TargetStatusCell rowSpan={tasks.length} target={target} />
      )}
      <TableData>
        <DetailsLink id={task.id} type="task">
          {task.name}
        </DetailsLink>
      </TableData>
      <TableData>
        {task.config ? (
          <DetailsLink id={task.config.id} type="scanconfig">
            {task.config.name}
          </DetailsLink>
        ) : (
          _('Scan configuration unavailable')
        )}
      </TableData>
    </TableRow>
  ));
};

const ComputerRelationships = ({node}: {node: DirectoryComputer}) => {
  const [_] = useTranslation();
  const title = _('Existing scan-target assignments');
  return (
    <DirectoryDetailsSection title={title}>
      {!node.matchedTargets?.length ? (
        <span>
          {!isDefined(node.matchedTargets)
            ? _('Matching information unavailable')
            : _('No matching readable scan targets')}
        </span>
      ) : (
        <Column gap={0} miw={0} style={{overflowX: 'auto'}}>
          <RelationshipTable aria-label={title} size="full">
            <TableHeader>
              <TableRow>
                <TableHead
                  $backgroundColor="transparent"
                  scope="col"
                  sort={false}
                >
                  {_('Scan target')}
                </TableHead>
                <TableHead
                  $backgroundColor="transparent"
                  scope="col"
                  sort={false}
                >
                  {_('Task')}
                </TableHead>
                <TableHead
                  $backgroundColor="transparent"
                  scope="col"
                  sort={false}
                >
                  {_('Scan config')}
                </TableHead>
              </TableRow>
            </TableHeader>
            {node.matchedTargets.map(target => (
              <TableBody key={target.id}>
                <TargetRelationshipRows target={target} />
              </TableBody>
            ))}
          </RelationshipTable>
        </Column>
      )}
    </DirectoryDetailsSection>
  );
};

export default ComputerRelationships;
