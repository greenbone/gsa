/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Agent from 'gmp/models/agent';
import {
  getConnectionStatusLabel,
  getAuthorizationLabel,
} from 'web/components/label/AgentsState';
import Divider from 'web/components/layout/Divider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import {type RowComponentProps} from 'web/entities/EntitiesTable';
import useTranslation from 'web/hooks/useTranslation';
import AgentActions, {
  type AgentActionsProps,
} from 'web/pages/agents/AgentActions';

export interface AgentTableRowProps
  extends AgentActionsProps, RowComponentProps<Agent> {
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

  const lastUpdateTitle = entity.lastUpdate?.toString() ?? _('Never');

  return (
    <TableRow data-testid={dataTestId}>
      <TableData title={entity.ipAddresses?.join(', ')}>
        {entity.name}
      </TableData>
      <TableData>{entity.scanner?.name}</TableData>
      <TableData>
        <Divider flex="column">
          <span>{entity.agentVersion}</span>
          {entity.updaterVersion && (
            <span>
              {_('Update available to:')} {entity.updaterVersion}
            </span>
          )}
        </Divider>
      </TableData>
      <TableData>{entity.operatingSystem}</TableData>
      <TableData title={lastUpdateTitle}>
        {getConnectionStatusLabel(entity.connectionStatus)}
      </TableData>
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
