/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import SolutionTypeSvgIcon from 'web/components/icon/solutiontypesvgicon';

import Layout from 'web/components/layout/layout';

import Sort from 'web/components/sortby/sortby';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import ResultsRow from './row';
import ResultDetails from './details';
import useGmp from 'web/hooks/useGmp';

const Header = ({
  actionsColumn,
  audit = false,
  delta = false,
  links = true,
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
            width="4%"
            rowSpan="2"
            currentSortDir={currentSortDir}
            currentSortBy={currentSortBy}
            sortBy={sort ? 'delta' : false}
            onSortChange={onSortChange}
            title={_('Delta')}
          />
        )}
        <TableHead
          width="40%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'vulnerability' : false}
          onSortChange={onSortChange}
          title={_('Vulnerability')}
        />
        <TableHead width="2%" rowSpan="2">
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
            width="8%"
            rowSpan="2"
            currentSortDir={currentSortDir}
            currentSortBy={currentSortBy}
            sortBy={sort ? 'compliant' : false}
            onSortChange={onSortChange}
            title={_('Compliant')}
          />
        ) : (
          <TableHead
            width="8%"
            rowSpan="2"
            currentSortDir={currentSortDir}
            currentSortBy={currentSortBy}
            sortBy={sort ? 'severity' : false}
            onSortChange={onSortChange}
            title={_('Severity')}
          />
        )}
        <TableHead
          width="3%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'qod' : false}
          onSortChange={onSortChange}
          title={_('QoD')}
        />
        <TableHead colSpan="2" width="23%">
          {_('Host')}
        </TableHead>
        <TableHead
          width="9%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'location' : false}
          onSortChange={onSortChange}
          title={_('Location')}
        />
        {gmp.settings.enableEPSS && !audit && (
          <TableHead colSpan="2">{_('EPSS')}</TableHead>
        )}
        <TableHead
          width="15%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'created' : false}
          onSortChange={onSortChange}
          title={_('Created')}
        />
        {actionsColumn}
      </TableRow>
      <TableRow>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'host' : false}
          onSortChange={onSortChange}
          title={_('IP')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hostname' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        {gmp.settings.enableEPSS && !audit && (
          <>
            <TableHead
              width="3%"
              currentSortDir={currentSortDir}
              currentSortBy={currentSortBy}
              sortBy={sort ? 'epss_score' : false}
              onSortChange={onSortChange}
              title={_('Score')}
            />
            <TableHead
              width="3%"
              currentSortDir={currentSortDir}
              currentSortBy={currentSortBy}
              sortBy={sort ? 'epss_percentile' : false}
              onSortChange={onSortChange}
              title={_('Percentage')}
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
  links: PropTypes.bool,
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
