/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import SolutionTypeSvgIcon from 'web/components/icon/solutiontypesvgicon';

import Sort from 'web/components/sortby/sortby';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import NvtDetails from './details';
import NvtRow from './row';

const Header = ({
  actionsColumn,
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          rowSpan="2"
          width="26%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          rowSpan="2"
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'family' : false}
          onSortChange={onSortChange}
          title={_('Family')}
        />
        <TableHead
          rowSpan="2"
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'created' : false}
          onSortChange={onSortChange}
          title={_('Created')}
        />
        <TableHead
          rowSpan="2"
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'modified' : false}
          onSortChange={onSortChange}
          title={_('Modified')}
        />
        <TableHead
          rowSpan="2"
          width="18%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'cve' : false}
          onSortChange={onSortChange}
          title={_('CVE')}
        />
        <TableHead rowSpan="2" width="1%">
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
        <TableHead
          rowSpan="2"
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        <TableHead
          rowSpan="2"
          width="3%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'qod' : false}
          onSortChange={onSortChange}
          title={_('QoD')}
        />
        <TableHead colSpan="2">
          {_("EPSS")}
        </TableHead>
        {actionsColumn}
      </TableRow>
      <TableRow>
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
          title={_('Percentile')}
        />
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const NvtsHeader = withEntitiesHeader(true)(Header);

const NvtsFooter = createEntitiesFooter({
  span: 10,
  download: 'nvts.xml',
});

export const NvtsTable = createEntitiesTable({
  emptyTitle: _l('No NVTs available'),
  row: NvtRow,
  rowDetails: withRowDetails('nvt', 10)(NvtDetails),
  header: NvtsHeader,
  footer: NvtsFooter,
});

export default NvtsTable;

// vim: set ts=2 sw=2 tw=80:
