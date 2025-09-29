/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import Agent from 'gmp/models/agents';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';

import AgentTableHeader from 'web/pages/agents/AgentTableHeader';
import AgentTableRow from 'web/pages/agents/AgentTableRow';

export default createEntitiesTable<Agent>({
  emptyTitle: _l('No agents available'),
  row: AgentTableRow,
  rowDetails: undefined,
  header: AgentTableHeader,
  footer: createEntitiesFooter({
    span: 8,
    delete: true,
    authorize: true,
    revoke: true,
  }),
});
