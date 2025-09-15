/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import AgentGroup from 'gmp/models/agent-groups';
import {EditIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import useTranslation from 'web/hooks/useTranslation';

export interface AgentGroupsActionsProps
  extends Omit<EntitiesActionsProps<AgentGroup>, 'children'> {
  onAgentGroupCloneClick?: (entity: AgentGroup) => void | Promise<void>;
  onAgentGroupDeleteClick?: (entity: AgentGroup) => void;
  onAgentGroupDownloadClick?: (entity: AgentGroup) => void | Promise<void>;
  onAgentGroupEditClick?: (entity: AgentGroup) => void;
}

const AgentGroupsActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onAgentGroupCloneClick,
  onAgentGroupDeleteClick,
  onAgentGroupDownloadClick,
  onAgentGroupEditClick,
}: AgentGroupsActionsProps) => {
  const [_] = useTranslation();

  return (
    <EntitiesActions
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        <EditIcon
          title={_('Edit Agent Group')}
          value={entity}
          onClick={onAgentGroupEditClick}
        />
        <CloneIcon
          entity={entity}
          name="agentgroup"
          onClick={onAgentGroupCloneClick}
        />
        <ExportIcon
          title={_('Export Agent Group')}
          value={entity}
          onClick={
            onAgentGroupDownloadClick as (agentGroup?: AgentGroup) => void
          }
        />
        <DeleteIcon
          displayName={_('Agent Group')}
          entity={entity}
          name="agentgroup"
          onClick={onAgentGroupDeleteClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default AgentGroupsActions;
