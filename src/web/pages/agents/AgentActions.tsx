/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Agent from 'gmp/models/agent';
import {isDefined} from 'gmp/utils/identity';
import {CircleMinusIcon, CirclePlusIcon, EditIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import useTranslation from 'web/hooks/useTranslation';

export interface AgentActionsProps
  extends Omit<EntitiesActionsProps<Agent>, 'children'> {
  onAgentAuthorizeClick?: (entity: Agent) => void;
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
    if (isDefined(onAgentAuthorizeClick)) {
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
        <EditIcon<Agent>
          title={_('Edit Agent')}
          value={entity}
          onClick={onAgentEditClick}
        />
        {isAuthorized ? (
          <CircleMinusIcon<Agent>
            title={_('Revoke Agent')}
            value={entity}
            onClick={handleAuthorizeClick}
          />
        ) : (
          <CirclePlusIcon<Agent>
            title={_('Authorize Agent')}
            value={entity}
            onClick={handleAuthorizeClick}
          />
        )}

        <DeleteIcon<Agent>
          displayName={_('Agent')}
          entity={entity}
          name="agent"
          onClick={onAgentDeleteClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

export default AgentActions;
