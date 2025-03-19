/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import React from 'react';
import SolutionTypeSvgIcon from 'web/components/icon/SolutionTypeSvgIcon';
import Layout from 'web/components/layout/Layout';
import Sort from 'web/components/sortby/SortBy';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import {createEntitiesFooter} from 'web/entities/Footer';
import {withEntitiesHeader} from 'web/entities/Header';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import useGmp from 'web/hooks/useGmp';
import ResultDetails from 'web/pages/results/Details';
import ResultsRow from 'web/pages/results/Row';
import PropTypes from 'web/utils/PropTypes';

const Header = ({
  actionsColumn,
  audit = false,
  delta = false,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  const gmp = useGmp();
  return (
    <TableHeader>
      <TableRow>
        {delta && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            rowSpan="2"
            sortBy={sort ? 'delta' : false}
            title={_('Delta')}
            width="4%"
            onSortChange={onSortChange}
          />
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'vulnerability' : false}
          title={_('Vulnerability')}
          width="40%"
          onSortChange={onSortChange}
        />
        <TableHead rowSpan="2" width="2%">
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
            rowSpan="2"
            sortBy={sort ? 'compliant' : false}
            title={_('Compliant')}
            width="8%"
            onSortChange={onSortChange}
          />
        ) : (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            rowSpan="2"
            sortBy={sort ? 'severity' : false}
            title={_('Severity')}
            width="8%"
            onSortChange={onSortChange}
          />
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'qod' : false}
          title={_('QoD')}
          width="3%"
          onSortChange={onSortChange}
        />
        <TableHead colSpan="2" width="23%">
          {_('Host')}
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'location' : false}
          title={_('Location')}
          width="9%"
          onSortChange={onSortChange}
        />
        {gmp.settings.enableEPSS && !audit && (
          <TableHead colSpan="2">{_('EPSS')}</TableHead>
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'created' : false}
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
          sortBy={sort ? 'host' : false}
          title={_('IP')}
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hostname' : false}
          title={_('Name')}
          onSortChange={onSortChange}
        />
        {gmp.settings.enableEPSS && !audit && (
          <>
            <TableHead
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              sortBy={sort ? 'epss_score' : false}
              title={_('Score')}
              width="3%"
              onSortChange={onSortChange}
            />
            <TableHead
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              sortBy={sort ? 'epss_percentile' : false}
              title={_('Percentage')}
              width="3%"
              onSortChange={onSortChange}
            />
          </>
        )}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  audit: PropTypes.bool,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  delta: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

export default createEntitiesTable({
  emptyTitle: _l('No results available'),
  footer: createEntitiesFooter({
    span: 10,
    download: 'results.xml',
  }),
  header: withEntitiesHeader(true)(Header),
  row: ResultsRow,
  rowDetails: withRowDetails('result', 7)(ResultDetails),
});
