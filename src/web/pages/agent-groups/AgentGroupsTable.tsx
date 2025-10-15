/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type AgentGroup from 'gmp/models/agentgroup';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';

import AgentGroupsTableHeader, {
  type AgentGroupsTableHeaderProps,
} from 'web/pages/agent-groups/AgentGroupsTableHeader';
import AgentGroupsTableRow, {
  type AgentGroupsTableRowProps,
} from 'web/pages/agent-groups/AgentGroupsTableRow';

export default createEntitiesTable<
  AgentGroup,
  CreateEntitiesFooterProps<AgentGroup>,
  AgentGroupsTableHeaderProps,
  AgentGroupsTableRowProps
>({
  emptyTitle: _l('No agent groups available'),
  row: AgentGroupsTableRow,
  rowDetails: undefined,
  header: AgentGroupsTableHeader,
  footer: createEntitiesFooter({
    span: 5,
    trash: true,
  }),
});
