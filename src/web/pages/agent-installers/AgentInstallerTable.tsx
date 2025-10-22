/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type AgentInstaller from 'gmp/models/agentinstaller';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import AgentInstallerTableHeader, {
  type AgentInstallerTableHeaderProps,
} from 'web/pages/agent-installers/AgentInstallerTableHeader';
import AgentInstallerTableRow, {
  type AgentInstallerTableRowProps,
} from 'web/pages/agent-installers/AgentInstallerTableRow';

export default createEntitiesTable<
  AgentInstaller,
  CreateEntitiesFooterProps<AgentInstaller>,
  AgentInstallerTableHeaderProps,
  AgentInstallerTableRowProps
>({
  emptyTitle: _l('No agent installers available'),
  row: AgentInstallerTableRow,
  header: AgentInstallerTableHeader,
  footer: createEntitiesFooter({
    span: 8,
    trash: true,
  }),
});
