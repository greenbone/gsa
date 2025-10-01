/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import AgentGroup from 'gmp/models/agentgroup';
import DateTime from 'web/components/date/DateTime';

import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import {RowComponentProps} from 'web/entities/EntitiesTable';
import useTranslation from 'web/hooks/useTranslation';
import AgentGroupsActions, {
  AgentGroupsActionsProps,
} from 'web/pages/agent-groups/AgentGroupsActions';

export interface AgentGroupsTableRowProps
  extends AgentGroupsActionsProps,
    RowComponentProps<AgentGroup> {
  actionsComponent?: React.ComponentType<AgentGroupsActionsProps>;
}

const AgentGroupsTableRow = ({
  actionsComponent: ActionsComponent = AgentGroupsActions,
  entity,
  onAgentGroupCloneClick,
  onAgentGroupDeleteClick,
  onAgentGroupDownloadClick,
  onAgentGroupEditClick,
  onEntityRestore,
  onEntityDelete,
  onEntityDeselected,
  onEntitySelected,
  selectionType,
  'data-testid': dataTestId,
}: AgentGroupsTableRowProps) => {
  const [_] = useTranslation();

  const modificationTime = entity.modificationTime ? (
    <DateTime date={entity.modificationTime} />
  ) : (
    _('Never')
  );

  return (
    <TableRow data-testid={dataTestId}>
      <TableData>{entity.name}</TableData>
      <TableData>{entity.scanner?.name ?? <i>{_('None')}</i>}</TableData>
      <TableData>{entity.getAgentCount()}</TableData>
      <TableData>{modificationTime}</TableData>
      <ActionsComponent
        entity={entity}
        selectionType={selectionType}
        onAgentGroupCloneClick={onAgentGroupCloneClick}
        onAgentGroupDeleteClick={onAgentGroupDeleteClick}
        onAgentGroupDownloadClick={onAgentGroupDownloadClick}
        onAgentGroupEditClick={onAgentGroupEditClick}
        onEntityDelete={onEntityDelete}
        onEntityDeselected={onEntityDeselected}
        onEntityRestore={onEntityRestore}
        onEntitySelected={onEntitySelected}
      />
    </TableRow>
  );
};

export default AgentGroupsTableRow;
