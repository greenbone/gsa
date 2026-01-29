/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import useFeatures from 'web/hooks/useFeatures';
import useTranslation from 'web/hooks/useTranslation';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface AgentIdTableHeadProps {
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (value: string) => void;
  sort?: boolean;
}

interface AgentIdTableDataProps {
  agentId?: string;
}

/**
 * Table header for Agent ID column. Only renders when ENABLE_AGENTS feature is enabled.
 */
export const AgentIdTableHead = ({
  currentSortBy,
  currentSortDir,
  onSortChange,
  sort = true,
}: AgentIdTableHeadProps) => {
  const [_] = useTranslation();
  const features = useFeatures();

  if (!features.featureEnabled('ENABLE_AGENTS')) {
    return null;
  }

  return (
    <TableHead
      currentSortBy={currentSortBy}
      currentSortDir={currentSortDir}
      sort={sort}
      sortBy={sort ? 'agentId' : undefined}
      title={_('Agent ID')}
      width="10%"
      onSortChange={onSortChange}
    />
  );
};

/**
 * Table data cell for Agent ID. Only renders when ENABLE_AGENTS feature is enabled.
 */
export const AgentIdTableData = ({agentId}: AgentIdTableDataProps) => {
  const features = useFeatures();

  if (!features.featureEnabled('ENABLE_AGENTS')) {
    return null;
  }

  return <TableData>{agentId}</TableData>;
};
