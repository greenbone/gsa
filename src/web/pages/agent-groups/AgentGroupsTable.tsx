/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import AgentGroup from 'gmp/models/agent-groups';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';

import AgentGroupsTableHeader from 'web/pages/agent-groups/AgentGroupsTableHeader';
import AgentGroupsTableRow from 'web/pages/agent-groups/AgentGroupsTableRow';

export default createEntitiesTable<AgentGroup>({
  emptyTitle: _l('No agent groups available'),
  row: AgentGroupsTableRow,
  rowDetails: undefined,
  header: AgentGroupsTableHeader,
  footer: createEntitiesFooter({
    span: 5,
    trash: true,
  }),
});
