/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {AGENTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {AgentsSeverityLoader} from 'web/pages/agents/dashboard/Loaders';

export const AgentsSeverityDisplay = createDisplay({
  loaderComponent: AgentsSeverityLoader,
  displayComponent: SeverityClassDisplay,
  dataTitles: [_l('Severity Class'), _l('# of Agents')],
  title: ({data: tableData}: {data: {total?: number}}) =>
    _('Agents by Severity Class (Total: {{count}})', {
      count: tableData.total || 0,
    }),
  displayId: 'agent-by-severity-class',
  displayName: 'AgentsSeverityDisplay',
  filtersFilter: AGENTS_FILTER_FILTER,
} as any);

export const AgentsSeverityTableDisplay = createDisplay({
  loaderComponent: AgentsSeverityLoader,
  displayComponent: SeverityClassTableDisplay,
  dataTitles: [_l('Severity Class'), _l('# of Agents')],
  title: ({data: tableData}: {data: {total?: number}}) =>
    _('Agents by Severity Class (Total: {{count}})', {
      count: tableData.total || 0,
    }),
  displayId: 'agent-by-severity-class-table',
  displayName: 'AgentsSeverityTableDisplay',
  filtersFilter: AGENTS_FILTER_FILTER,
} as any);

registerDisplay(AgentsSeverityDisplay.displayId, AgentsSeverityDisplay, {
  title: _l('Chart: Agents by Severity Class'),
});

registerDisplay(
  AgentsSeverityTableDisplay.displayId,
  AgentsSeverityTableDisplay,
  {
    title: _l('Table: Agents by Severity Class'),
  },
);
