/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import {createEntitiesFooter} from 'web/entities/Footer';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import PortListDetails from 'web/pages/portlists/Details';
import Row from 'web/pages/portlists/Row';
import PropTypes from 'web/utils/PropTypes';

const Header = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'name' : false}
          title={_('Name')}
          width="59%"
          onSortChange={onSortChange}
        />
        <TableHead colSpan="3" width="33%">
          {_('Port Counts')}
        </TableHead>
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead align="center" rowSpan="2" width="6em">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'total' : false}
          title={_('Total')}
          width="11%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'tcp' : false}
          title={_('TCP')}
          width="11%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'udp' : false}
          title={_('UDP')}
          width="11%"
          onSortChange={onSortChange}
        />
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

export default createEntitiesTable({
  emptyTitle: _l('No port lists available'),
  row: Row,
  rowDetails: withRowDetails('portlist', 10)(PortListDetails),
  header: Header,
  footer: createEntitiesFooter({
    download: 'portlists.xml',
    span: 6,
    trash: true,
  }),
});
