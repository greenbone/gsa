/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/TableRow';
import {createEntitiesFooter} from 'web/entities/Footer';
import {withEntitiesHeader} from 'web/entities/Header';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import TaskDetails from 'web/pages/tasks/Details';
import Row from 'web/pages/tasks/Row';
import PropTypes from 'web/utils/PropTypes';

const Header = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  const sortProps = {
    currentSortBy,
    currentSortDir,
    sort,
    onSortChange,
  };
  return (
    <TableHeader>
      <TableRow>
        <TableHead {...sortProps} sortBy="name" title={_('Name')} width="41%" />
        <TableHead
          {...sortProps}
          sortBy="status"
          title={_('Status')}
          width="8%"
        />
        <TableHead
          {...sortProps}
          sortBy="total"
          title={_('Reports')}
          width="6%"
        />
        <TableHead
          {...sortProps}
          sortBy="last"
          title={_('Last Report')}
          width="24%"
        />
        <TableHead
          {...sortProps}
          sortBy="severity"
          title={_('Severity')}
          width="8%"
        />
        <TableHead
          {...sortProps}
          align="center"
          sortBy="trend"
          title={_('Trend')}
          width="5%"
        />
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const actionsColumn = (
  <TableHead align="center" title={_l('Actions')} width="10em" />
);

export default createEntitiesTable({
  emptyTitle: _l('No Tasks available'),
  row: Row,
  rowDetails: withRowDetails('task', 10)(TaskDetails),
  header: withEntitiesHeader(actionsColumn)(Header),
  footer: createEntitiesFooter({
    span: 10,
    trash: true,
    download: 'tasks.xml',
  }),
});
