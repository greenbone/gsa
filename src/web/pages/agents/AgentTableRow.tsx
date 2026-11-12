/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Agent from 'gmp/models/agent';
import {
  getConnectionStatusLabel,
  getAuthorizationLabel,
} from 'web/components/label/AgentsStateLabel';
import Divider from 'web/components/layout/Divider';
import HaloDot from 'web/components/status/HaloDot';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import {type RowComponentProps} from 'web/entities/EntitiesTable';
import useTranslation from 'web/hooks/useTranslation';
import AgentActions, {
  type AgentActionsProps,
} from 'web/pages/agents/AgentActions';
import getOperatingSystemNameFromCpe from 'web/utils/operating-system-name';
import Theme from 'web/utils/theme';

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
  onAgentDownloadSupportBundleClick,
  onEntityDeselected,
  onEntitySelected,
  selectionType,
  'data-testid': dataTestId,
}: AgentTableRowProps) => {
  const [_] = useTranslation();

  const lastUpdateTitle = entity.lastUpdate?.toString() ?? _('Never');
  const ipAddressesTitle = `${_('IP Addresses')}: ${entity.ipAddresses?.join(', ') ?? _('None')} `;
  const operatingSystemName =
    getOperatingSystemNameFromCpe(entity.osCpe) ||
    entity.operatingSystem ||
    _('Unknown');
  const supportStatus = entity.osStatus ?? 'unknown';
  const operatingSystemTitle = [
    entity.osCpe || _('No OS CPE was reported.'),
    supportStatus === 'unknown'
      ? _('Operating system support status is unknown.')
      : undefined,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <TableRow data-testid={dataTestId}>
      <TableData title={ipAddressesTitle}>{entity.name}</TableData>
      <TableData>{entity.scanner?.name}</TableData>
      <TableData>
        <Divider flex="column">
          <span>{entity.agentVersion}</span>
          {entity.latestAgentVersion && (
            <span>
              {_('Update available to:')} {entity.latestAgentVersion}
            </span>
          )}
        </Divider>
      </TableData>
      <TableData>
        <Divider align={['start', 'center']}>
          <span title={operatingSystemTitle}>{operatingSystemName}</span>
          <HaloDot
            $animated={false}
            $color={supportStatus === 'supported' ? Theme.green : 'orange'}
            $size="8px"
            aria-label={_('Operating system support status: {{status}}', {
              status: supportStatus,
            })}
            role="img"
          />
        </Divider>
      </TableData>
      <TableData title={`${_('Last Contact')}: ${lastUpdateTitle} `}>
        {getConnectionStatusLabel(entity.connectionStatus)}
      </TableData>
      <TableData>{getAuthorizationLabel(entity.authorized)}</TableData>
      <ActionsComponent
        entity={entity}
        selectionType={selectionType}
        onAgentAuthorizeClick={onAgentAuthorizeClick}
        onAgentDeleteClick={onAgentDeleteClick}
        onAgentDownloadSupportBundleClick={onAgentDownloadSupportBundleClick}
        onAgentEditClick={onAgentEditClick}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
      />
    </TableRow>
  );
};

export default AgentTableRow;
