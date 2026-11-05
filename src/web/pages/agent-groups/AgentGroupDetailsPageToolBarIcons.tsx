/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentGroup from 'gmp/models/agent-group';
import ListIcon from 'web/components/icon/ListIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import {ROUTES} from 'web/route-paths';

interface AgentGroupDetailsPageToolBarIconsProps {
  entity: AgentGroup;
  onAgentGroupCreateClick?: () => void;
  onAgentGroupCloneClick?: (entity: AgentGroup) => void;
  onAgentGroupEditClick?: (entity: AgentGroup) => void;
  onAgentGroupDeleteClick?: (entity: AgentGroup) => void;
}

const AgentGroupDetailsPageToolBarIcons = ({
  entity,
  onAgentGroupCreateClick,
  onAgentGroupCloneClick,
  onAgentGroupEditClick,
  onAgentGroupDeleteClick,
}: AgentGroupDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ListIcon
          page={ROUTES.agentGroups.url}
          title={_('Agent Groups List')}
        />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onAgentGroupCreateClick} />
        <CloneIcon entity={entity} onClick={onAgentGroupCloneClick} />
        <EditIcon entity={entity} onClick={onAgentGroupEditClick} />
        <TrashIcon entity={entity} onClick={onAgentGroupDeleteClick} />
      </IconDivider>
    </Divider>
  );
};

export default AgentGroupDetailsPageToolBarIcons;
