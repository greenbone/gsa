/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';

import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface AgentGroupsListPageToolBarIconsProps {
  onAgentCreateClick?: () => void;
}

const AgentGroupsListPageToolBarIcons = ({
  onAgentCreateClick,
}: AgentGroupsListPageToolBarIconsProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        /* TODO add proper anchor and page */
        anchor="creating-and-managing-agents-lists"
        page="scanning"
        title={_('Help: Agents Lists')}
      />
      {capabilities.mayCreate('agent_group') && (
        <NewIcon title={_('New Agent')} onClick={onAgentCreateClick} />
      )}
    </IconDivider>
  );
};

export default AgentGroupsListPageToolBarIcons;
