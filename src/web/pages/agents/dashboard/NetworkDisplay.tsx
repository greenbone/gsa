/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {AGENTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {AgentsNetworkLoader} from 'web/pages/agents/dashboard/Loaders';

interface NetworkGroup {
  count: number;
  value: string;
  text?: {
    name?: string;
  };
}

interface NetworkData {
  groups?: NetworkGroup[];
  total?: number;
}

const transformNetworkData = (data: NetworkData = {}) => {
  const {groups = []} = data;
  return groups.map(group => ({
    value: group.count,
    label: group.text?.name || group.value || _('N/A'),
  }));
};

interface TransformedNetworkRow {
  label: string;
  value: number;
}

export const AgentsNetworkTableDisplay = createDisplay({
  loaderComponent: AgentsNetworkLoader,
  displayComponent: DataTableDisplay,
  dataTitles: [_l('Network Name'), _l('# of Agents')],
  dataRow: (row: TransformedNetworkRow) => [row.label, row.value],
  dataTransform: transformNetworkData,
  title: ({data: tableData}: {data: {total?: number}}) =>
    _('Agents by Network (Total: {{count}})', {
      count: tableData.total || 0,
    }),
  displayId: 'agent-by-network-table',
  displayName: 'AgentsNetworkTableDisplay',
  filtersFilter: AGENTS_FILTER_FILTER,
} as any);

registerDisplay(
  AgentsNetworkTableDisplay.displayId,
  AgentsNetworkTableDisplay,
  {
    title: _l('Table: Agents by Network'),
  },
);
