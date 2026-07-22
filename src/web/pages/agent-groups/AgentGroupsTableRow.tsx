/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentGroup from 'gmp/models/agent-group';
import DateTime from 'web/components/date/DateTime';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import {type RowComponentProps} from 'web/entities/EntitiesTable';
import useTranslation from 'web/hooks/useTranslation';
import AgentGroupsActions, {
  type AgentGroupsActionsProps,
} from 'web/pages/agent-groups/AgentGroupsActions';
import {type SelectionTypeType} from 'web/utils/SelectionType';

// Props accepted by any pluggable actionsComponent (e.g. TrashActions),
// in addition to what the default AgentGroupsActions component uses.
export interface AgentGroupsRowActionsProps extends AgentGroupsActionsProps {
  onDeleteBulk?: () => void | Promise<void>;
  onEntityDelete?: (entity: AgentGroup) => Promise<void>;
  onEntityRestore?: (entity: AgentGroup) => Promise<void>;
  onSelectionTypeChange?: (selectionType: SelectionTypeType) => void;
  onTagsBulk?: () => void;
  onToggleDetailsClick?: (entity: AgentGroup, id: string) => void;
}

export interface AgentGroupsTableRowProps
  extends AgentGroupsRowActionsProps, RowComponentProps<AgentGroup> {
  actionsComponent?: React.ComponentType<AgentGroupsRowActionsProps>;
}

const AgentGroupsTableRow = ({
  actionsComponent: ActionsComponent = AgentGroupsActions,
  entity,
  onAgentGroupCloneClick,
  onAgentGroupDeleteClick,
  onAgentGroupEditClick,
  onEntityDeselected,
  onEntitySelected,
  selectionType,
  'data-testid': dataTestId,
  onDeleteBulk,
  onSelectionTypeChange,
  onTagsBulk,
  onToggleDetailsClick,
  onEntityDelete,
  onEntityRestore,
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
        onAgentGroupEditClick={onAgentGroupEditClick}
        onDeleteBulk={onDeleteBulk}
        onEntityDelete={onEntityDelete}
        onEntityDeselected={onEntityDeselected}
        onEntityRestore={onEntityRestore}
        onEntitySelected={onEntitySelected}
        onSelectionTypeChange={onSelectionTypeChange}
        onTagsBulk={onTagsBulk}
        onToggleDetailsClick={onToggleDetailsClick}
      />
    </TableRow>
  );
};

export default AgentGroupsTableRow;
