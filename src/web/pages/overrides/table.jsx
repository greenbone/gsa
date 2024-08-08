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

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import OverrideDetails from './details';
import Row from './row';

const Header = ({
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  actionsColumn,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          width="19%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'text' : false}
          onSortChange={onSortChange}
          title={_('Text')}
        />
        <TableHead
          width="30%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'nvt' : false}
          onSortChange={onSortChange}
          title={_('NVT')}
        />
        <TableHead
          width="12%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          onSortChange={onSortChange}
          title={_('Hosts')}
        />
        <TableHead
          width="12%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'port' : false}
          onSortChange={onSortChange}
          title={_('Location')}
        />
        <TableHead
          width="9%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('From')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          width="8%"
          sortBy={sort ? 'newSeverity' : false}
          onSortChange={onSortChange}
          title={_('To')}
        />
        <TableHead
          width="4%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'active' : false}
          onSortChange={onSortChange}
          title={_('Active')}
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
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

export default createEntitiesTable({
  emptyTitle: _l('No Overrides available'),
  row: Row,
  rowDetails: withRowDetails('override', 8)(OverrideDetails),
  header: withEntitiesHeader()(Header),
  footer: createEntitiesFooter({
    span: 10,
    trash: true,
    download: 'overrides.xml',
  }),
});

// vim: set ts=2 sw=2 tw=80:
