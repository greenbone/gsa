/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentInstaller from 'gmp/models/agentinstaller';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

export interface AgentInstallerActionsProps
  extends Omit<EntitiesActionsProps<AgentInstaller>, 'children'> {
  onAgentInstallerDeleteClick?: (entity: AgentInstaller) => void;
  onAgentInstallerDownloadClick?: (entity: AgentInstaller) => void;
}

const AgentInstallerActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onAgentInstallerDeleteClick,
  onAgentInstallerDownloadClick,
}: AgentInstallerActionsProps) => {
  const [_] = useTranslation();
  return (
    <EntitiesActions<AgentInstaller>
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        <ExportIcon
          title={_('Download Installer')}
          value={entity}
          onClick={onAgentInstallerDownloadClick}
        />
        <TrashIcon
          displayName={_('Agent Installer')}
          entity={entity}
          name="agentgroup"
          onClick={onAgentInstallerDeleteClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default AgentInstallerActions;
