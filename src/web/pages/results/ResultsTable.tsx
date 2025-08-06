/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import Result from 'gmp/models/result';
import {SolutionTypeSvgIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import Sort from 'web/components/sortby/SortBy';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import {FooterComponentProps} from 'web/entities/EntitiesTable';
import withEntitiesHeader, {
  WithEntitiesHeaderComponentProps,
} from 'web/entities/withEntitiesHeader';
import withRowDetails from 'web/entities/withRowDetails';
import useGmp from 'web/hooks/useGmp';
import ResultDetails, {
  ResultDetailsProps,
} from 'web/pages/results/ResultDetails';
import ResultsRow, {
  ResultTableRowProps,
} from 'web/pages/results/ResultsTableRow';
import {SortDirectionType} from 'web/utils/SortDirection';

interface ResultTableHeaderProps extends WithEntitiesHeaderComponentProps {
  audit?: boolean;
  delta?: boolean;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

const ResultTableHeader = ({
  actionsColumn,
  audit = false,
  delta = false,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: ResultTableHeaderProps) => {
  const gmp = useGmp();
  const enableEPSS = gmp.settings.enableEPSS;
  return (
    <TableHeader>
      <TableRow>
        {delta && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            rowSpan={2}
            sort={sort}
            sortBy="delta"
            title={_('Delta')}
            width="4%"
            onSortChange={onSortChange}
          />
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan={2}
          sort={sort}
          sortBy="vulnerability"
          title={_('Vulnerability')}
          width="40%"
          onSortChange={onSortChange}
        />
        <TableHead rowSpan={2} width="2%">
          <Layout align="center">
            {sort ? (
              <Sort by="solution_type" onClick={onSortChange}>
                <SolutionTypeSvgIcon title={_('Solution type')} />
              </Sort>
            ) : (
              <SolutionTypeSvgIcon title={_('Solution type')} />
            )}
          </Layout>
        </TableHead>
        {audit ? (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            rowSpan={2}
            sort={sort}
            sortBy="compliant"
            title={_('Compliant')}
            width="8%"
            onSortChange={onSortChange}
          />
        ) : (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            rowSpan={2}
            sort={sort}
            sortBy="severity"
            title={_('Severity')}
            width="8%"
            onSortChange={onSortChange}
          />
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan={2}
          sortBy="qod"
          title={_('QoD')}
          width="3%"
          onSortChange={onSortChange}
        />
        <TableHead colSpan={2} width="23%">
          {_('Host')}
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan={2}
          sort={sort}
          sortBy="location"
          title={_('Location')}
          width="9%"
          onSortChange={onSortChange}
        />
        {gmp.settings.enableEPSS && !audit && (
          <TableHead colSpan={2}>{_('EPSS')}</TableHead>
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan={2}
          sort={sort}
          sortBy="created"
          title={_('Created')}
          width="15%"
          onSortChange={onSortChange}
        />
        {actionsColumn}
      </TableRow>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="host"
          title={_('IP')}
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="hostname"
          title={_('Name')}
          onSortChange={onSortChange}
        />
        {enableEPSS && !audit && (
          <>
            <TableHead
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              sort={sort}
              sortBy="epss_score"
              title={_('Score')}
              width="3%"
              onSortChange={onSortChange}
            />
            <TableHead
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              sort={sort}
              sortBy="epss_percentile"
              title={_('Percentile')}
              width="3%"
              onSortChange={onSortChange}
            />
          </>
        )}
      </TableRow>
    </TableHeader>
  );
};

export default createEntitiesTable<
  Result,
  FooterComponentProps<Result>,
  ResultTableHeaderProps,
  ResultTableRowProps
>({
  emptyTitle: _l('No results available'),
  footer: createEntitiesFooter({
    span: 10,
    download: 'results.xml',
  }),
  header: withEntitiesHeader<ResultTableHeaderProps>(true)(ResultTableHeader),
  row: ResultsRow,
  rowDetails: withRowDetails<Result, ResultDetailsProps>(
    'result',
    7,
  )(ResultDetails),
});
