/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Agent from 'gmp/models/agent';
import {CircleMinusIcon, CirclePlusIcon, EditIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import useTranslation from 'web/hooks/useTranslation';

export interface AgentActionsProps
  extends Omit<EntitiesActionsProps<Agent>, 'children'> {
  onAgentAuthorizeClick?: (entity: Agent) => void;
  onAgentCloneClick?: (entity: Agent) => void | Promise<void>;
  onAgentDeleteClick?: (entity: Agent) => void;
  onAgentEditClick?: (entity: Agent) => void;
}

const AgentActions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onAgentAuthorizeClick,
  onAgentDeleteClick,
  onAgentEditClick,
}: AgentActionsProps) => {
  const [_] = useTranslation();

  const isAuthorized = entity.isAuthorized();

  const handleAuthorizeClick = () => {
    if (onAgentAuthorizeClick) {
      onAgentAuthorizeClick(entity);
    }
  };

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
          title={_('Edit Agent')}
          value={entity}
          onClick={onAgentEditClick}
        />
        {isAuthorized ? (
          <CircleMinusIcon
            title={_('Deauthorize Agent')}
            value={entity}
            onClick={handleAuthorizeClick}
          />
        ) : (
          <CirclePlusIcon
            title={_('Authorize Agent')}
            value={entity}
            onClick={handleAuthorizeClick}
          />
        )}

        <DeleteIcon
          displayName={_('Agent')}
          // @ts-ignore
          entity={entity}
          name="agent"
          // @ts-ignore
          onClick={onAgentDeleteClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default AgentActions;
