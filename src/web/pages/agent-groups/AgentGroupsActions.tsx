/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentGroup from 'gmp/models/agent-group';
import {EditIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

export interface AgentGroupsActionsProps extends Omit<
  EntitiesActionsProps<AgentGroup>,
  'children'
> {
  onAgentGroupCloneClick?: (entity: AgentGroup) => void;
  onAgentGroupDeleteClick?: (entity: AgentGroup) => void;
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

        <TrashIcon
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
