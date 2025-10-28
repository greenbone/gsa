/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentInstaller from 'gmp/models/agent-installer';
import {isDefined} from 'gmp/utils/identity';
import {FingerprintIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import useTranslation from 'web/hooks/useTranslation';

export interface AgentInstallerActionsProps
  extends Omit<EntitiesActionsProps<AgentInstaller>, 'children'> {
  onAgentInstallerChecksumClick?: (entity: AgentInstaller) => void;
  onAgentInstallerDownloadClick?: (entity: AgentInstaller) => void;
}

const AgentInstallerActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onAgentInstallerChecksumClick,
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
          title={_('Download Agent Installer')}
          value={entity}
          onClick={onAgentInstallerDownloadClick}
        />
        <FingerprintIcon
          active={isDefined(entity.checksum)}
          title={
            entity.checksum
              ? _('Copy Agent Installer checksum to clipboard')
              : _('No checksum available')
          }
          value={entity}
          onClick={onAgentInstallerChecksumClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default AgentInstallerActions;
