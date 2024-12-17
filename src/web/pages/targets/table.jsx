/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {_, _l} from 'gmp/locale/lang';
import React from 'react';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';
import PropTypes from 'web/utils/proptypes';

import TargetDetails from './details';
import TargetRow from './row';

const Header = ({
  actionsColumn,
  filter,
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
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'name' : false}
          title={_('Name')}
          width="30%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hosts' : false}
          title={_('Hosts')}
          width="20%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'ips' : false}
          title={_('IPs')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'port_list' : false}
          title={_('Port List')}
          width="15%"
          onSortChange={onSortChange}
        />
        <TableHead width="15%">{_('Credentials')}</TableHead>
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  filter: PropTypes.filter,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const TargetsHeader = withEntitiesHeader()(Header);

const Footer = createEntitiesFooter({
  span: 6,
  trash: true,
  download: 'targets.xml',
});

export default createEntitiesTable({
  emptyTitle: _l('No targets available'),
  row: TargetRow,
  header: TargetsHeader,
  footer: Footer,
  rowDetails: withRowDetails('target', 10)(TargetDetails),
});

// vim: set ts=2 sw=2 tw=80:
