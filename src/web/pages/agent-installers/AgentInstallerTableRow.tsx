/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentInstaller from 'gmp/models/agent-installer';
import DateTime from 'web/components/date/DateTime';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import {type RowComponentProps} from 'web/entities/EntitiesTable';
import AgentInstallerActions, {
  type AgentInstallerActionsProps,
} from 'web/pages/agent-installers/AgentInstallerActions';

export interface AgentInstallerTableRowProps
  extends AgentInstallerActionsProps, RowComponentProps<AgentInstaller> {
  actionsComponent?: React.ComponentType<AgentInstallerActionsProps>;
}

const AgentInstallerTableRow = ({
  entity,
  actionsComponent: ActionsComponent = AgentInstallerActions,
  'data-testid': dataTestId,
  selectionType,
  onAgentInstallerDownloadClick,
  onEntityDeselected,
  onEntitySelected,
  ...other
}: AgentInstallerTableRowProps) => {
  return (
    <TableRow data-testid={dataTestId}>
      <TableData>{entity.name}</TableData>
      <TableData>{entity.description}</TableData>
      <TableData>{entity.version}</TableData>
      <TableData>
        <DateTime date={entity.modificationTime} />
      </TableData>
      <ActionsComponent
        {...other}
        entity={entity}
        selectionType={selectionType}
        onAgentInstallerDownloadClick={onAgentInstallerDownloadClick}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
      />
    </TableRow>
  );
};

export default AgentInstallerTableRow;
