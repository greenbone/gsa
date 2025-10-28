/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';

import useTranslation from 'web/hooks/useTranslation';

const AgentInstallersListPageToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        /* TODO add correct link */
        anchor="creating-and-managing-agents"
        page="installers"
        title={_('Help: Agent Installers')}
      />
    </IconDivider>
  );
};

export default AgentInstallersListPageToolBarIcons;
