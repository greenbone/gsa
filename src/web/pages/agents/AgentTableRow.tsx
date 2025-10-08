/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Agent from 'gmp/models/agent';
import DateTime from 'web/components/date/DateTime';
import {
  getConnectionStatusLabel,
  getAuthorizationLabel,
} from 'web/components/label/AgentsState';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import {RowComponentProps} from 'web/entities/EntitiesTable';
import useTranslation from 'web/hooks/useTranslation';
import AgentActions, {AgentActionsProps} from 'web/pages/agents/AgentActions';

export interface AgentTableRowProps
  extends AgentActionsProps,
    RowComponentProps<Agent> {
  actionsComponent?: React.ComponentType<AgentActionsProps>;
}

const AgentTableRow = ({
  actionsComponent: ActionsComponent = AgentActions,
  entity,
  onAgentAuthorizeClick,
  onAgentDeleteClick,
  onAgentEditClick,
  onEntityDeselected,
  onEntitySelected,
  selectionType,
  'data-testid': dataTestId,
}: AgentTableRowProps) => {
  const [_] = useTranslation();

  const lastUpdate = entity.lastUpdate ? (
    <DateTime date={entity.lastUpdate} />
  ) : (
    _('Never')
  );

  return (
    <TableRow data-testid={dataTestId}>
      <TableData>{entity.name}</TableData>
      <TableData>{entity.scanner?.name}</TableData>
      <TableData>{entity.agentVersion}</TableData>
      <TableData>{lastUpdate}</TableData>
      <TableData>{getConnectionStatusLabel(entity.connectionStatus)}</TableData>
      <TableData>{getAuthorizationLabel(entity.authorized)}</TableData>
      <ActionsComponent
        entity={entity}
        selectionType={selectionType}
        onAgentAuthorizeClick={onAgentAuthorizeClick}
        onAgentDeleteClick={onAgentDeleteClick}
        onAgentEditClick={onAgentEditClick}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
      />
    </TableRow>
  );
};

export default AgentTableRow;
