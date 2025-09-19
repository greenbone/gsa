/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DownloadIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';

import useTranslation from 'web/hooks/useTranslation';

interface AgentsListPageToolBarIconsProps {
  onAgentCreateClick?: () => void;
}

const AgentsListPageToolBarIcons = ({
  onAgentCreateClick,
}: AgentsListPageToolBarIconsProps) => {
  /* TODO FIX Permission for super admin */
  //  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        /* TODO add correct link */
        anchor="creating-and-managing-agents-lists"
        page="scanning"
        title={_('Help: Agents Lists')}
      />
      {
        /* TODO check permissions */
        /* capabilities.mayCreate('agent') &&  */ <DownloadIcon
          title={_('Download Agents List')}
          onClick={onAgentCreateClick}
        />
      }
    </IconDivider>
  );
};

export default AgentsListPageToolBarIcons;
