/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {createEntitiesFooter} from 'web/entities/Footer';
import {withEntitiesHeader} from 'web/entities/Header';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import NoteDetails from 'web/pages/notes/Details';
import Row from 'web/pages/notes/Row';
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
          sortBy={sort ? 'text' : false}
          title={_('Text')}
          width="20%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'nvt' : false}
          title={_('NVT')}
          width="35%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hosts' : false}
          title={_('Hosts')}
          width="16%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'port' : false}
          title={_('Location')}
          width="16%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'active' : false}
          title={_('Active')}
          width="5%"
          onSortChange={onSortChange}
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

export default createEntitiesTable({
  emptyTitle: _l('No Notes available'),
  row: Row,
  rowDetails: withRowDetails('note', 6)(NoteDetails),
  header: withEntitiesHeader()(Header),
  footer: createEntitiesFooter({
    span: 10,
    trash: true,
    download: 'hosts.xml',
  }),
});
